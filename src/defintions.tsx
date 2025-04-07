import React, { JSX } from "react";
import scrunge from './img/scrunge.jpg'
import { ComfyJSInstance } from "comfy.js";

export namespace ChatClient {
    export class Streamer {
        public channelName: string;
        public channelId?: string;

        constructor(channelName: string, channelId?: string) {
            this.channelName = channelName;
            if (!!channelId) {
                this.channelId = channelId
            }
        }
    }

    export interface IChatterProps {
        displayName: string;
        username: string;
        nameColor?: string;
        pfpUrl?: string;
        badges?: object;
        handleUsernameReady: Function;
    }

    export interface IChatterState {
        displayName: string;
        username: string
        nameColor?: string;
        pfpUrl: string;
        badges?: IBadgeUrl[];
        isReady: boolean;
    }

    interface IPfp {
        username: string
        pfpUrl: string
    }
    
    interface IBadgeUrl {
        name: string
        imgUrl?: string
        version: string
    }

    interface IBadge {
        id: string
    }

    export class Chatter extends React.Component<IChatterProps,IChatterState> {

        constructor(props: IChatterProps) {
            super(props)
            this.state = {
                displayName:this.props.displayName,
                username:this.props.username,
                nameColor:this.props.nameColor || 'firebrick',
                pfpUrl:"",
                isReady:false
            }
        }

        private async fetchBadgesUrl(badgeIds?: object): Promise<void> {
            const requestUrl = 'http://localhost:5000/user/badge?list=';
            var resolvedBadges: IBadgeUrl[] | undefined = [];


            
            if (null !== badgeIds) {
                for (const [k, v] of Object.entries(badgeIds as IBadge)) {
                    let badge: IBadgeUrl = {
                        name:k,
                        version:v
                    }

                    if (undefined !== resolvedBadges) {
                        resolvedBadges.push(badge);
                    }
                    else {
                        console.warn('Badges dont fit in');
                    }
                }
                try {
                    const res = await fetch(requestUrl, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(resolvedBadges)
                    });
                    resolvedBadges = await res.json() as IBadgeUrl[];
                }
                catch (error) {
                    console.error('Fetching badges went wrong', error);
                }
    
                this.setState({badges:resolvedBadges});
            }
        }

        private async fetchPfpUrl() {
            const requestUrl = 'http://localhost:5000/user/pfp?username=' + this.props.username.toLowerCase();
            var pfpUrlObj: IPfp = {
                pfpUrl:scrunge,
                username:this.props.username
            };

            try {
                const response = await fetch(requestUrl);
                pfpUrlObj = await response.json() as IPfp;
            } catch (error) {
                console.error('failed to fetch pfp url', error);
            }
            finally {
                    this.setState({pfpUrl:pfpUrlObj.pfpUrl,isReady:true});
                    this.props.handleUsernameReady();
            }

        }

        componentDidMount(): void {
            this.fetchPfpUrl();
            this.fetchBadgesUrl(this.props.badges);
        }
        
        public render(): JSX.Element {
            return(
                <div className="user-frame">
                    <div className="user-pfp">
                        {
                            (this.state.isReady)?
                            <img src={this.state.pfpUrl} alt="pfp" />:<></>
                        }
                    </div>
                    <div className="username" style={{color: this.state.nameColor}}>
                        {this.state.displayName}
                    </div>
                    <div className="badges">
                        {this.state.badges?.map(badge => (
                            <img src={badge.imgUrl} className="badge" key={badge.name}/>
                        ))}
                    </div>
                </div>
            )
        }
    }

    export interface IChatMessageProps {
        rawMessage: string,
        handleMessageReady: Function
        extra: any
        allNames: string
    }

    export interface IChatMessageState {
        message: string,
        isReady: boolean
    }

    export interface IEmote {
        name?: string,
        imgUrl?: string,
        twitchId: string,
        positions: string[]
    }

    export interface IEmoteFromDb {
        name: string,
        imgUrl: string,
        twitchId: string,
        _id: string
    }

    export class ChatMessage extends React.Component<IChatMessageProps, IChatMessageState> {

        constructor(props: IChatMessageProps) {
            super(props);
            this.state = {
                message:this.props.rawMessage,
                isReady:false
            };
        }

        private getEmoteName(emote: IEmote, message: string):string {
            const position = emote.positions[0];
            const positions = position.split('-');
            const startingPosition = Number(positions[0]);
            const endingPosition = Number(positions[1]) + 1;

            return message.substring(startingPosition,endingPosition);
        }

        private async resolveTwitchEmotes(): Promise<void> {
            const fetchBase = 'http://localhost:5000/emote/fetchone';
            var tempMessage = this.props.rawMessage;
            const reSpecialChars = /[\!\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-]/g;

            if (this.props.extra.messageEmotes !== null) {
                const tEmotes = this.props.extra.messageEmotes
                for (const [k, v] of Object.entries(tEmotes as IEmote)) {
                    let emote: IEmote = {
                        twitchId:k,
                        positions:v
                    }
                    emote.name = this.getEmoteName(emote, tempMessage)
                    const fetchUrl = fetchBase + '?id=' + emote.twitchId + '&name=' + emote.name;
                    const res = await fetch(fetchUrl, {
                        method: "GET"
                    });
                }
            }
            else {
                console.debug('No twitch emotes, nothing to do');
            }

            const emoteRe = new RegExp(this.props.allNames, 'g')
            const matches: RegExpMatchArray | null = tempMessage.match(emoteRe)

            if (null !== matches) {
                for (let i = 0; i < matches.length; i++) {
                    const emote = matches[i];
                    const re = new RegExp(emote, 'g');
                    const fetcResponse = await fetch('http://localhost:5000/emote/getone?name=' + emote, {
                        method: 'GET'
                    });
                    if (fetcResponse.ok) {
                        const myEmote = await fetcResponse.json() as IEmoteFromDb;
                        const replaceText = `<img src="${myEmote.imgUrl}" alt="emote" class="emote" />`;
                        tempMessage = tempMessage.replaceAll(re, replaceText);
                    }
                    else {
                        console.warn('Could not get emote: ' + emote);
                    }
                }

                this.setState({
                    message: tempMessage,
                    isReady: true
                });
            }

            
        }

        public async componentDidMount(): Promise<void> {
            await this.resolveTwitchEmotes();
            this.props.handleMessageReady();
        }

        public render(): JSX.Element {
            return(
                <div className="message-frame">
                    <div className="message" dangerouslySetInnerHTML={{__html: this.state.message}}>
                    </div>
                </div>
            )
        }
    }

    export interface IChatMessageFrameProps {
        messageID: string,
        user: string,
        rawMessage: string,
        flags: any,
        extra: any,
        timeStamp: Date
        isExpired: boolean
        selfDestroy: Function
        lifeTime: number
        allNames: string
    }

    export interface IChatMessageFrameState {
        isExpired: boolean,
        isUsernameReady: boolean,
        isMessageReady: boolean,
        animationClass: string
    }

    export class ChatMessageFrame extends React.Component<IChatMessageFrameProps,IChatMessageFrameState> {
        fadeOutTimer?: NodeJS.Timeout;
        destroyTimer?: NodeJS.Timeout;

        constructor(props: IChatMessageFrameProps) {
            super(props);
            this.state = {
                isExpired:false,
                isMessageReady:true,
                isUsernameReady:false,
                animationClass:"fly-in"
            };
            this.handleUsernameReady = this.handleUsernameReady.bind(this);
            this.handleMessageReady = this.handleMessageReady.bind(this);
        }

        private initTimers() {
            if (this.fadeOutTimer != null) {
                clearTimeout(this.fadeOutTimer)
            }

            if (this.destroyTimer != null){
                clearTimeout(this.destroyTimer)
            }

            this.fadeOutTimer = setTimeout(() => {
                this.setState({isExpired:true});
                clearTimeout(this.fadeOutTimer);
            }, this.props.lifeTime - 500);
            this.destroyTimer = setTimeout(() => {
                this.props.selfDestroy(this.props.messageID);
                clearTimeout(this.destroyTimer);
            }, this.props.lifeTime);
        }

        public componentDidMount(): void {
            this.initTimers();
        }

        public componentDidUpdate(prevProps: Readonly<IChatMessageFrameProps>, prevState: Readonly<IChatMessageFrameState>, snapshot?: any): void {
            if (prevState.isExpired !== this.props.isExpired) {
                this.setState({
                    isExpired:this.props.isExpired
                })
            }
        }

        public componentWillUnmount(): void {
            clearTimeout(this.fadeOutTimer);
            clearTimeout(this.destroyTimer);
        }
        
        public handleUsernameReady() {
            this.setState({
                isUsernameReady:true
            });
        }

        public handleMessageReady() {
            this.setState({
                isMessageReady:true
            });
        }

        public isReady(): boolean {
            if (this.state.isMessageReady && this.state.isUsernameReady) {
                return true;
            }
            else {
                return false;
            }
        }

        public getMessageFrameClasses(): string {
            var messageFrameClasses = "chat-frame"
            if (this.state.isExpired && 'fade-out' !== this.state.animationClass) {
                this.setState({animationClass:'fade-out'})
            }

            if (this.isReady()) {
                messageFrameClasses += ' ready ' + this.state.animationClass
            }
            else {
                messageFrameClasses += ' not-ready'
            }

            return messageFrameClasses
        }

        public render() {
            return(
                <li id={this.props.messageID} className={this.getMessageFrameClasses()} >
                    <Chatter nameColor={this.props.extra.userColor} displayName={this.props.extra.displayName} username={this.props.extra.username} badges={this.props.extra.userBadges} handleUsernameReady={this.handleUsernameReady}></Chatter>
                    <br />
                    <ChatMessage rawMessage={this.props.rawMessage} handleMessageReady={this.handleMessageReady} extra={this.props.extra} allNames={this.props.allNames}></ChatMessage>
                </li>
            )
        }
    }

    export class NewMessage {
        public messageID: string;
        public user: string;
        public message: string;
        public flags: any;
        public extra: any;
        public timeStamp: Date;
        public isExpired: boolean

        constructor(user: string, message: string, flags: any, extra: any) {
            this.messageID = crypto.randomUUID();
            this.user = user;
            this.message = message;
            this.flags = flags;
            this.extra = extra;
            this.timeStamp = new Date();
            this.isExpired = false
        }
    }
}