import { useState } from 'react';
import './App.css';
import { ChatClient } from "./defintions";
import ComfyJS from "comfy.js";
import React from 'react';

const myStreamer = new ChatClient.Streamer('zentreya','asd');
const messageTimeout = 6000;

ComfyJS.Init(myStreamer.channelName)

export interface IChatAppState {
  messageQueue: ChatClient.NewMessage[]
}

function ChatApp() {
  const [messageQueue, setMessageQueue] = useState([] as ChatClient.NewMessage[])

  ComfyJS.onChat = (user: string, message: string, flags: object, self: any, extra: any) => {
    console.log(`New chat message by ${extra.displayName}`);
    const myNewMessage = new ChatClient.NewMessage(user, message, flags, extra);
    const newMessageQueue = [myNewMessage, ...messageQueue];
    setMessageQueue(newMessageQueue);
  }

  const filterMessageQueue = (messageID: string) => {
    let newMessageQueue = messageQueue

    const filteredQueue = newMessageQueue.filter(item => {
      return (messageID !== item.messageID) as boolean
    });

    setMessageQueue(filteredQueue);
  }

  return (
    <ul id='chat-container'>
      {messageQueue.map(cf => (
        <React.Fragment key={cf.messageID}>
          <ChatClient.ChatMessageFrame 
            messageID={cf.messageID}
            user={cf.user}
            rawMessage={cf.message}
            flags={cf.flags}
            extra={cf.extra}
            timeStamp={cf.timeStamp}
            isExpired={cf.isExpired}
            selfDestroy={filterMessageQueue}
            lifeTime={messageTimeout}
          />
        </React.Fragment> ))}
    </ul>
  );
}

export default ChatApp;
