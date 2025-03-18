import { useState, useEffect } from 'react';
import './App.css';
import { ChatClient } from "./defintions";
import ComfyJS, { ComfyJSInstance } from "comfy.js";

const myStreamer = new ChatClient.Streamer('shylily','asd');
const messageTimeout = 5

ComfyJS.Init(myStreamer.channelName)

function App() {
  const [messageQueue, setMessageQueue] = useState([] as ChatClient.ChatFrame[]);

  useEffect(() => {
    const interval = setInterval(() => {
      let newMessageQueue = messageQueue
      newMessageQueue.filter(item => {
        let age = item.timeStamp as Date;
        age.setSeconds(age.getSeconds() + messageTimeout);
        return (age > new Date()) as Boolean
      })
      console.warn('Queue length: ' + newMessageQueue.length)
      setMessageQueue(newMessageQueue)
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  ComfyJS.onChat = (user: string, message: string, flags: object, self: any, extra: any) => {
    console.log(`New chat message by ${extra.username}`);
    var myChatFrame = new ChatClient.ChatFrame(user, message, flags, extra)
    
    setMessageQueue(
      [
        ...messageQueue,
        myChatFrame
      ]
    )
  }

  return (
    <>
      {messageQueue.map(cm => (
        cm.render()
      ))}
    </>
  );
}

export default App;
