import { useState, useEffect } from 'react';
import './App.css';
import { ChatClient } from "./defintions";
import ComfyJS from "comfy.js";
import { addMilliseconds } from 'date-fns';
import React from 'react';
import { timeStamp } from 'console';

const myStreamer = new ChatClient.Streamer('zentreya','asd');
const messageTimeout = 5000;

ComfyJS.Init(myStreamer.channelName)

 function App() {
  const [messageQueue, setMessageQueue] = useState([] as ChatClient.NewMessage[]);

  useEffect(() => {
    let newMessageQueue = messageQueue;

    const interval = setInterval(() => {
      let currentTimeStamp = new Date()
      for (let i = 0; i < newMessageQueue.length; i++) {
        let item = newMessageQueue[i];
        let age = addMilliseconds(item.timeStamp, (messageTimeout - 500));
        if (age < currentTimeStamp) {
          item.isExpired = true;
          newMessageQueue[i] = item;
        }
      }

      const items = newMessageQueue.filter(item => {
        let age = addMilliseconds(item.timeStamp, messageTimeout);
        return (age > currentTimeStamp) as Boolean;
      });
      
      setMessageQueue(items);
    }, 500);
    return () => clearInterval(interval);
  }, [messageQueue, setMessageQueue]);

  ComfyJS.onChat = (user: string, message: string, flags: object, self: any, extra: any) => {
    console.log(`New chat message by ${extra.displayName}`);
    const myNewMessage = new ChatClient.NewMessage(user, message, flags, extra);
    const newMessageQueue = [myNewMessage, ...messageQueue];
    setMessageQueue(newMessageQueue);
  }

  return (
    <ul id='chat-container'>
      {messageQueue.map(cf => (
        <React.Fragment key={cf.messageID}>
          <ChatClient.ChatMessageFrame messageID={cf.messageID} user={cf.user} rawMessage={cf.message} flags={cf.flags} extra={cf.extra} timeStamp={cf.timeStamp} isExpired={cf.isExpired}></ChatClient.ChatMessageFrame>
        </React.Fragment> ))}
    </ul>
  );
}

export default App;
