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
        userName: string;
        nameColor?: string;
        pfpUrl?: string;
    }

    export interface IChatterState {
        displayName: string;
        userName: string
        nameColor?: string;
        pfpUrl: string;
        loading: boolean;
    }

    interface IPfp {
        userName: string
        pfpUrl: string
    }

    export class Chatter extends React.Component<IChatterProps,IChatterState> {

        constructor(props: IChatterProps) {
            super(props)
            this.state = {
                displayName:this.props.displayName,
                userName:this.props.userName,
                nameColor:this.props.nameColor || 'firebrick',
                pfpUrl:"",
                loading:true
            }
            this.init(this.props.userName)
        }

        private init(userName: string) {
            const requestUrl = 'http://localhost:5000/twitch/userpfp?username=' + userName.toLowerCase();
            const res = fetch(requestUrl).then(res => res.json());
            res.then(json => {
                const data = json as IPfp
                this.setState({pfpUrl:data.pfpUrl,loading:false})
            });
        }

        public render(): JSX.Element {
            return(
                <div className="user-frame">
                    <div className="user-pfp">
                        {
                            (!this.state.loading)?
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
        rawMessage: string
    }

    export interface IChatMessageState {
        rawMessage: string,
        isLoading: boolean
    }

    export class ChatMessage extends React.Component<IChatMessageProps, IChatMessageState> {

        constructor(props: IChatMessageProps) {
            super(props)
            this.state = {
                rawMessage:this.props.rawMessage,
                isLoading:true
            }
        }

        public render() {
            return(
                <div className="message-frame">
                    <div className="message">
                        {this.state.rawMessage}
                    </div>
                </div>
            )
        }
    }

    export interface IChatFrameProps {
        messageID?: string,
        rawMessage: string,
        flags: any,
        extra: any,
        timeStamp?: Date
    }

    export interface IChatFrameState {
        messageID?: string,
        rawMessage: string,
        flags: any,
        extra: any,
        timeStamp: Date,
        isExpired: boolean
    }

    export class ChatFrame {
        public messageID: string;
        public rawMessage: string;
        public flags: any;
        public extra: any;
        public timeStamp;
        public fadeOut: boolean = false;

        constructor(user: string, message: string, flags: any, extra: any) {
            this.messageID = crypto.randomUUID();
            this.rawMessage = message;
            this.flags = flags;
            this.extra = extra;
            this.timeStamp = new Date();
        }

        public render() {
            return (
                <li id={this.messageID} className={"chat-frame" + (this.fadeOut ? ' fade-out':'')} key={this.messageID}>
                    <Chatter nameColor={this.extra.userColor} displayName={this.extra.displayName} userName={this.extra.username}></Chatter>
                    <br />
                    <ChatMessage rawMessage={this.rawMessage}></ChatMessage>
                </li>
            );
        }
    }
}