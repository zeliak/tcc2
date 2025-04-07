import { Component, useState } from 'react';
import './App.css';
import { ChatClient } from "./defintions";
import ComfyJS from "comfy.js";
import React from 'react';
import { useSearchParams } from 'react-router'
import { addMinutes } from 'date-fns';

const messageTimeout = 15000;
var lastBackendUpdate = {
  streamerName: '',
  lastUpdateDate: new Date()
}
var allEmoteNames = ''

export interface IChatAppState {
  messageQueue: ChatClient.NewMessage[]
}

async function startBackendFetch(streamerName: string): Promise<void> {
  const lifetimeToCompare = addMinutes(lastBackendUpdate.lastUpdateDate, 10)
  const currentTime = new Date()

  if (currentTime > lifetimeToCompare || streamerName !== lastBackendUpdate.streamerName) {
    const endpoints = [
      'emote/fetchall?streamer=' + streamerName,
      'badge/fetchall?streamer=' + streamerName,
      'emote/getallnames'
    ];
    const baseUrl = 'http://localhost:5000/';
    var isUpdateSuccess = false

    try {
      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];
        const fetchUrl = baseUrl + endpoint
        const response = await fetch(fetchUrl, {
          method: 'GET'
        });
  
        if (response.ok) {
          console.log('Updated ' + fetchUrl);
          isUpdateSuccess = true
          const re = /getallnames$/g;
          if (fetchUrl.match(re)) {
            const objects = await response.json();
            const reSpecialChars = /[\!\?\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-]/g;
            var sTvString = '('

            for (let i = 0; i < objects.length; i++) {
              const name = objects[i].name;
              const escapedName = name.replace(reSpecialChars, '\\$&');
              if (i !== 0) {
                sTvString = sTvString + '|\\b' + escapedName + '\\b';
              }
              else {
                sTvString = sTvString + '\\b' + escapedName + '\\b';
              }
            }
            allEmoteNames = sTvString + ')'

          }
        }
        else {
          const error = 'Could not update ' + fetchUrl;
          console.error(error)
          throw response.body
        }
      }
    }
    catch (error) {
      console.error(error)
      isUpdateSuccess = false
    }
    finally {
      if (isUpdateSuccess) {
        lastBackendUpdate = {
          streamerName: streamerName,
          lastUpdateDate: new Date()
        }
      }
    }
  }

}

function ChatApp() {
  const [messageQueue, setMessageQueue] = useState([] as ChatClient.NewMessage[]);
  const [searchParams, setSearchParams] = useSearchParams();

  const streamerName = searchParams.get('streamer') || 'zelixplore';
  const myStreamer = new ChatClient.Streamer(streamerName);
  startBackendFetch(myStreamer.channelName)

  const cClient = ComfyJS.GetClient()
  if (cClient === null) {
    ComfyJS.Init(myStreamer.channelName)
  }

  ComfyJS.onChat = (user: string, message: string, flags: object, self: any, extra: any) => {
    console.debug(`New chat message by ${extra.displayName}`);
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
            allNames={allEmoteNames}
          />
        </React.Fragment> ))}
    </ul>
  );
}

export default ChatApp;
