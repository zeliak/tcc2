import { error } from "console";
import React, { JSX } from "react";

export namespace ChatClient {
    export class Streamer {
        public channelName: string;
        public channelId: string;

        constructor(channelName: string, channelId: string) {
            this.channelName = channelName;
            this.channelId = channelId
        }
    }

    export interface IChatterProps {
        displayName: string;
        username: string;
        nameColor?: string;
        pfpUrl?: string;
        handleUsernameReady: Function;
    }

    export interface IChatterState {
        displayName: string;
        username: string
        nameColor?: string;
        pfpUrl: string;
        isReady: boolean;
    }

    interface IPfp {
        username: string
        pfpUrl: string
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

        componentDidMount(): void {
            const requestUrl = 'http://localhost:5000/twitch/userpfp?username=' + this.props.username.toLowerCase();
            const res = fetch(requestUrl).then(res => res.json());
            res.then(json => {
                const data = json as IPfp;
                this.setState({pfpUrl:data.pfpUrl,isReady:true});
                this.props.handleUsernameReady();
            });
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
                </div>
            )
        }
    }

    export interface IChatMessageProps {
        rawMessage: string,
        handleMessageReady: Function
    }

    export interface IChatMessageState {
        rawMessage: string,
        isReady: boolean
    }

    export class ChatMessage extends React.Component<IChatMessageProps, IChatMessageState> {

        constructor(props: IChatMessageProps) {
            super(props);
            this.state = {
                rawMessage:this.props.rawMessage,
                isReady:false
            };
        }

        componentDidMount(): void {
            this.props.handleMessageReady();
        }

        public render(): JSX.Element {
            return(
                <div className="message-frame">
                    <div className="message">
                        {this.state.rawMessage}
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
    }

    export interface IChatMessageFrameState {
        isExpired: boolean,
        isUsernameReady: boolean,
        isMessageReady: boolean
    }

    export class ChatMessageFrame extends React.Component<IChatMessageFrameProps,IChatMessageFrameState> {
        constructor(props: IChatMessageFrameProps) {
            super(props);
            this.state = {
                isExpired:false,
                isMessageReady:true,
                isUsernameReady:false
            };
            this.handleUsernameReady = this.handleUsernameReady.bind(this);
            this.handleMessageReady = this.handleMessageReady.bind(this);
        }

        componentDidMount(): void {
        }

        componentDidUpdate(prevProps: Readonly<IChatMessageFrameProps>, prevState: Readonly<IChatMessageFrameState>, snapshot?: any): void {
            if (prevState.isExpired !== this.props.isExpired) {
                this.setState({
                    isExpired:this.props.isExpired
                })
            }
        }
        
        handleUsernameReady() {
            this.setState({
                isUsernameReady:true
            });
        }

        handleMessageReady() {
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
            if (this.state.isExpired) {
                messageFrameClasses += ' fade-out'
            }

            if (this.isReady()) {
                messageFrameClasses += ' ready'
            }
            else {
                messageFrameClasses += ' not-ready'
            }

            return messageFrameClasses
        }

        public render() {
            return(
                <li id={this.props.messageID} className={this.getMessageFrameClasses()}>
                    <Chatter nameColor={this.props.extra.userColor} displayName={this.props.extra.displayName} username={this.props.extra.username}  handleUsernameReady={this.handleUsernameReady}></Chatter>
                    <br />
                    <ChatMessage rawMessage={this.props.rawMessage} handleMessageReady={this.handleMessageReady}></ChatMessage>
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