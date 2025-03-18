export namespace ChatClient {
    export class Streamer {
        public channelName: string;
        public channelId: string;

        constructor(channelName: string, channelId: string) {
            this.channelName = channelName;
            this.channelId = channelId
        }
    }

    export class Chatter {
        public displayName: string;
        public nameColor: string;

        constructor(displayName: string, userColor: string) {
            this.displayName = displayName;
            this.nameColor = userColor ?? 'firebrick';
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
        public timeStamp: Date;

        constructor(user: string, message: string, flags: any, extra: any) {
            this.messageID = crypto.randomUUID()
            this.user = new Chatter(extra.displayName, extra.userColor);
            this.message = new ChatMessage(this.user, message);
            this.flags = flags;
            this.extra = extra;
            this.timeStamp = new Date();
        }
        
        public render() {
            return (
                <div className="chate-frame" key={this.messageID}>
                    <div className="user-frame">
                        <div className="username" style={{color: this.user.nameColor}}>
                            {this.user.displayName}
                        </div>
                    </div>
                    <div className="message-frame">
                        <div className="message">
                            {this.message.toString()}
                        </div>
                    </div>
                </div>
            );
        }
    }
}