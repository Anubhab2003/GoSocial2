import React from 'react'
import { useParams } from 'react-router-dom'
import {ZegoUIKitPrebuilt} from '@zegocloud/zego-uikit-prebuilt'
function Room() {
    const {roomId} = useParams();

    const myMeeting=async(element)=>{
        const appId=45547009;
        const serverSecret="a37fa58d95ab68295115fcb3a6fd8e03";
        const kitToken=ZegoUIKitPrebuilt.generateKitTokenForTest(appId,serverSecret,roomId,Date.now().toString(),"Anubhab Chowdhury");

        const zc=ZegoUIKitPrebuilt.create(kitToken);
        zc.joinRoom({
            container:element,
            sharedLinks:[
                { name: "Copy Link",
                    url:`https://localhost:5173/room/${roomId}`
                 },
            ],
            scenario:{
                mode:ZegoUIKitPrebuilt.OneONoneCall,
            }
        })
    }
  return (
    <div>
      <div ref={myMeeting}/>
    </div>
  )
}

export default Room
