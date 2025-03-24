import { error } from "console";
import React from "react";

export namespace ChatClient {
    export class Streamer {
        public channelName: string;
        public channelId: string;

        constructor(channelName: string, channelId: string) {
            this.channelName = channelName;
            this.channelId = channelId
        }
    }

    interface Pfp {
        userName: string
        pfpUrl: string
    }

    export class Chatter {
        public displayName: string;
        public nameColor: string;
        public pfpUrl?: string;

        constructor(displayName: string, userColor: string) {
            this.displayName = displayName;
            this.nameColor = userColor ?? 'firebrick';
        }

        public setPfpUrl() {
            let requestUrl = 'http://localhost:5000/twitch/userpfp?username=' + this.displayName.toLowerCase();
            const pfpUrl = async (url: string): Promise<Pfp> => {
                const data = await fetch(url)
                const pfp = await data.json() as Pfp
                return pfp as Pfp
            }

            pfpUrl(requestUrl)
                .then(res => {this.pfpUrl = res.pfpUrl})
                .catch(err => console.log('no pfp'))
        }
    }

    export class ChatMessage {
        public chatter: Chatter;
        private rawMessage: string;

        constructor(chatter: Chatter, rawMessage: string) {
            this.chatter = chatter;
            this.rawMessage = rawMessage;
        }

        public toString(): string {
            return this.rawMessage as string
        }
    }

    export class ChatFrame {
        public messageID: string;
        public user: Chatter;
        public message: ChatMessage;
        public flags: any;
        public extra: any;
        public timeStamp;
        public fadeOut: boolean = false;

        constructor(user: string, message: string, flags: any, extra: any) {
            this.messageID = crypto.randomUUID()
            this.user = new Chatter(extra.displayName, extra.userColor);
            this.message = new ChatMessage(this.user, message);
            this.flags = flags;
            this.extra = extra;
            this.timeStamp = new Date();
        }
        
        public setChatterPfp() {
            this.user.setPfpUrl()
        }

        public render() {
            return (
                <li id={this.messageID} className={"chat-frame" + (this.fadeOut ? ' fade-out':'')} key={this.messageID}>
                    <div className="user-frame">
                        <div className="user-pfp">
                            <img src={this.user.pfpUrl} alt="" />
                        </div>
                        <div className="username" style={{color: this.user.nameColor}}>
                            {this.user.displayName}
                        </div>
                    </div>
                    <div className="message-frame">
                        <div className="message">
                            {this.message.toString()}
                        </div>
                    </div>
                </li>
            );
        }
    }
}