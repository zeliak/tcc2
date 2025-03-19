import { useState, useEffect } from 'react';
import './App.css';
import { ChatClient } from "./defintions";
import ComfyJS from "comfy.js";
import { addMilliseconds } from 'date-fns';

const myStreamer = new ChatClient.Streamer('arielle','asd');
const messageTimeout = 5000;

ComfyJS.Init(myStreamer.channelName)

function App() {
  const [messageQueue, setMessageQueue] = useState([] as ChatClient.ChatFrame[]);
  const [isFadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    let newMessageQueue = messageQueue;

    const interval = setInterval(() => {
      let currentTimeStamp = new Date()
      for (let i = 0; i < newMessageQueue.length; i++) {
        let item = newMessageQueue[i];
        let age = addMilliseconds(item.timeStamp, (messageTimeout - 500));
        if (age < currentTimeStamp) {
          item.fadeOut = true;
          newMessageQueue[i] = item;
        }
      }

      const items = newMessageQueue.filter(item => {
        let age = addMilliseconds(item.timeStamp, messageTimeout);
        return (age > currentTimeStamp) as Boolean;
      });
      console.warn('Queue length: ' + items.length);
      setMessageQueue(items);
    }, 500);
    return () => clearInterval(interval);
  }, [messageQueue, setMessageQueue]);

  ComfyJS.onChat = (user: string, message: string, flags: object, self: any, extra: any) => {
    console.log(`New chat message by ${extra.username}`);
    var myChatFrame = new ChatClient.ChatFrame(user, message, flags, extra)
    let newMessageQueue = [myChatFrame, ...messageQueue]
    setMessageQueue(newMessageQueue)
  }

  return (
    <ul id='chat-container'>
      {messageQueue.map(cm => (
        cm.render()
      ))}
    </ul>
  );
}

export default App;
