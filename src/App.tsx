import { useState } from 'react';
import './App.css';
import { ChatClient } from "./defintions";
import ComfyJS, { ComfyJSInstance } from "comfy.js";

const myStreamer = new ChatClient.Streamer('michimochievee','asd');

ComfyJS.Init(myStreamer.channelName)

function App() {
  const [messageQueue, setMessageQueue] = useState([] as ChatClient.ChatFrame[]);

  ComfyJS.onChat = (user: string, message: string, flags: object, self: any, extra: any) => {
    console.log(`New chat message by ${extra.username}`);
    var myChatFrame = new ChatClient.ChatFrame(user, message, flags, extra)

    setTimeout(() => {
      let newMessageQueue = messageQueue.filter(item => 
        item.messageID !== myChatFrame.messageID)
      setMessageQueue(newMessageQueue)
    }, 5000)

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
