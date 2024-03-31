"use client";
import React, { useEffect, useRef, useState } from "react";
// import "./video.css";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { ImPhoneHangUp } from "react-icons/im";
import { IoMdMic, IoMdMicOff } from "react-icons/io";
import { ZegoDeviceInfo } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";

const Page = () => {
  // const [userToken, setUserToken] = useState("");

  let appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "");
  // Access server address, which is of the String type. You can obtain it in ZEGOCLOUD Admin Console. (For more information about how to obtain it, see Prerequisites.)
  let server = process.env.NEXT_PUBLIC_ZEGO_SERVER_ID || "";

  const searchParams = useSearchParams();
  const userId = searchParams?.get("userId");
  const roomId = searchParams?.get("roomId");
  // const [zg, setZg] = useState<ZegoExpressEngine>(
  //   new ZegoExpressEngine(appID, server)
  // );
  const [streamIdState, setStreamIdState] = useState(
    new Date().getTime().toString()
  );
  const [localStreamState, setLocalStreamState] = useState<any>();
  const [remoteStreamState, setRemoteStreamState] = useState<MediaStream>();
  const [videoDeviceList, setVideoDeviceList] = useState<ZegoDeviceInfo[]>([]);
  const [cameraDevicesVal, setCameraDevicesVal] = useState<string>();
  const [audioDeviceList, setAudioDeviceList] = useState<ZegoDeviceInfo[]>([]);
  const [microphoneDevicesVal, setMicrophoneDevicesVal] = useState("");
  const [isMute, setIsMute] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (!userId || !roomId) {
      router.replace("/");
    } else {
      axios
        .post("/api/get-zego-token", { userID: userId })
        .then((result: any) => {
          console.log({ createTokenRes: result });
          // setUserToken(result?.data?.data);
          createRoom(userId, userId, roomId, result?.data?.data);
        })
        .catch((error: any) => {
          console.log({ tokenCreateError: error });
        });
    }
  }, []);

  // useEffect(() => {
  //   axios
  //     .post("/api/get-zego-token", { userID: "112233445566" })
  //     .then((result: any) => {
  //       console.log({ createTokenRes: result });
  //       setUserToken(result?.data?.data);
  //     })
  //     .catch((error: any) => {
  //       console.log({ tokenCreateError: error });
  //     });
  // }, []);
  // Create a ZegoExpressEngin instance and listen for event callbacks

  // Unique AppID of a project, which is of the Number type. You can obtain it in ZEGOCLOUD Admin Console.
  // let appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "");
  // // Access server address, which is of the String type. You can obtain it in ZEGOCLOUD Admin Console. (For more information about how to obtain it, see Prerequisites.)
  // let server = process.env.NEXT_PUBLIC_ZEGO_SERVER_ID || "";

  // // Instance initialization
  const zg = new ZegoExpressEngine(appID, server);

  // Room status update callback
  zg.on("roomStateChanged", (roomID, reason, errorCode, extendData) => {
    if (reason == "LOGINING") {
      // Logging in.
      console.log("function LOGINING");
    } else if (reason == "LOGINED") {
      // Login successful.
      // Only after a user successfully logs in to a room or switches the room, can `startPublishingStream` and `startPlayingStream` be called to publish and play streams properly.
      // Publish streams to ZEGOCLOUD audio and video cloud.
      console.log("function LOGINED");
    } else if (reason == "LOGIN_FAILED") {
      // Login failed.
      console.log("function LOGIN_FAILED");
    } else if (reason == "RECONNECTING") {
      // Reconnecting.
      console.log("function RECONNECTING");
    } else if (reason == "RECONNECTED") {
      // Reconnection successful.
      console.log("function RECONNECTED");
    } else if (reason == "RECONNECT_FAILED") {
      // Reconnection failed.
      console.log("function RECONNECT_FAILED");
    } else if (reason == "KICKOUT") {
      // Forced to log out of a room.
      console.log("function KICKOUT");
    } else if (reason == "LOGOUT") {
      // Logout successful.
      console.log("function LOGOUT");
    } else if (reason == "LOGOUT_FAILED") {
      // Logout failed.
      console.log("function LOGOUT_FAILED");
    }
  });

  // Notification of users joining or leaving a room
  // The `roomUserUpdate` callback can be received only when `ZegoRoomConfig` in which the `userUpdate` parameter is set to `true` is passed in the `loginRoom` method.
  zg.on("roomUserUpdate", (roomID, updateType, userList) => {
    console.log({
      message: "function roomUserUpdate",
      roomID,
      updateType,
      userList,
    });
    if (updateType == "ADD") {
      for (var i = 0; i < userList.length; i++) {
        console.log(userList[i]["userID"], "joins the room:", roomID);
        console.log("function user joined: " + userList[i]["userID"]);
      }
    } else if (updateType == "DELETE") {
      for (var i = 0; i < userList.length; i++) {
        console.log(userList[i]["userID"], "leaves the room:", roomID);
        console.log(
          "function user leaved: " + userList[i]["userID"] + updateType
        );
      }
    }
  });

  // Log in to a room. If the login succeeds, `true` is returned.
  // The `roomUserUpdate` callback can be received only when `userUpdate` is set to `true`.

  const createRoom = (
    userID: string,
    userName: string,
    roomID: string,
    token: string
  ) => {
    // let userID = "112233445566";
    // let userName = "user0001";
    // let roomID = "0001";
    // let token =
    //   "04AAAAAGXhqRMAEGpqaDJyYjBsb3ZzMmZ2YmkAgIwX0YUg3Cm5l+WldYv5Vt7g8hfCnVRDYMzpgZBHQvqKCtbaewnWuJ5rCY+Rtj2m0rJGy+0AiR07nlBt7FgWVfsBTSJsvW4glQTvEMXTTXCGvigoIcSE0pGiIU7+6jgWHG2sWsrgKtOOAQKCLz7mFBAsFpiHJ1H3Pt+lj0vzqI7i"; // use the state userToken
    // To prevent yourself from missing any notification, listen for callback events such as user login or logout, room connection status updates, and stream publishing status updates before logging in to a room.
    zg.on(
      "roomStateChanged",
      async (roomID, reason, errorCode, extendedData) => {
        console.log({ roomID, reason, errorCode, extendedData });
      }
    );
    zg.loginRoom(
      roomID,
      token,
      { userID, userName: userID },
      { userUpdate: true }
    )
      .then(async (result) => {
        if (result == true) {
          console.log({ message: "function login success", result });
          // Create a stream and start the preview.
          // After calling the `createZegoStream` method, you cannot perform subsequent operations until the ZEGOCLOUD server returns a streaming media object.
          const localStream = await zg.createZegoStream();
          setLocalStreamState(localStream);
          // Preview the stream and mount the playback component to the page. "local-video" is the id of the <div> element that serves as the component container.
          localStream.playVideo(document.querySelector("#local-video"), {
            enableAutoplayDialog: true,
          });

          // Start to publish an audio and video stream to the ZEGOCLOUD audio and video cloud.
          let streamID = new Date().getTime().toString();
          zg.startPublishingStream(streamID, localStream);
          console.log("function streamId: " + streamID);
          setStreamIdState(streamID);
        }
      })
      .catch((error) => {
        console.log({ message: "function Login Falid", error: error });
      });
  };

  zg.on("playerStateUpdate", (result) => {
    console.log("function result: " + result);
    console.log({ message: "function result:", result });
  });

  // Stream status update callback
  zg.on(
    "roomStreamUpdate",
    async (roomID, updateType, streamList, extendedData) => {
      console.log("update stream");
      console.log({
        message: "update stream",
        roomID,
        updateType,
        streamList,
        extendedData,
      });
      console.log("function 1: " + updateType);
      // When `updateType` is set to `ADD`, an audio and video stream is added, and you can call the `startPlayingStream` method to play the stream.
      if (updateType == "ADD") {
        console.log("function add");

        // When streams are added, play them.
        // For the conciseness of the sample code, only the first stream in the list of newly added audio and video streams is played here. In a real service, it is recommended that you traverse the stream list to play each stream.
        const streamID = streamList[0].streamID;
        // The stream list specified by `streamList` contains the ID of the corresponding stream.
        const remoteStream = await zg.startPlayingStream(streamID);

        // Create a media stream player object to play remote media streams.
        const remoteView = zg.createRemoteStreamView(remoteStream);
        // Mount the player to a page. In the sample code, `remote-video` indicates the DOM element ID of the player.
        console.log("remote video case");
        remoteView.play("remote-video");
      } else if (updateType == "DELETE") {
        console.log("function delete");

        // When streams are deleted, stop playing them.
        console.log("Deleted case");
        const streamID = streamList[0].streamID;
        console.log("function delete steamId: " + streamID);
        zg.stopPlayingStream(streamID);
      }
    }
  );

  const handleDecline = () => {
    zg.stopPublishingStream(streamIdState);
    zg.destroyStream(localStreamState);
    zg.stopPlayingStream(streamIdState);
    // zg.stopPlayingStream(streamIdState);
    zg.logoutRoom(roomId || "");
    // zg.destroyEngine();
    // router.replace("/");
    console.log("function handleDecline");
  };

  const handleMute = () => {
    const m = zg.muteMicrophone(true);
    console.log("function mute: " + m);
    const ism = zg.isMicrophoneMuted();
    console.log("function ism: " + ism);
    zg.mutePlayStreamAudio(streamIdState, true)
      .then((result) => {
        console.log({ message: "function 1" }, { result });
      })
      .catch((error) => {
        console.log({ message: "function 1" }, { error });
      });
    zg.mutePublishStreamAudio(localStreamState, true);
  };

  return (
    <div className="p-5 w-full bg-green-600 h-screen">
      {/* <h1>Zego RTC Video Call</h1>
      <h4>Local video</h4>
      <div id="local-video"></div>
      <h4>Remote video</h4>
      <div id="remote-video"></div> */}
      <div
        id="remote-video"
        className="relative w-full h-[90%] bg-red-500 rounded-lg"
      >
        <div
          id="local-video"
          className="bg-white w-80 aspect-[11/9] rounded-lg absolute right-5 top-5 z-10"
        ></div>
      </div>
      <div className="w-full h-[10%] bg-white flex items-center justify-center gap-5">
        <button
          className="bg-red-600 px-5 py-2 rounded-3xl"
          onClick={handleDecline}
        >
          <ImPhoneHangUp color={"#fff"} size={40} />
        </button>
        <button
          className=" px-5 py-2 rounded-3xl"
          onClick={() => {
            setIsMute(!isMute);
            handleMute();
          }}
        >
          {isMute ? (
            <IoMdMic color={"#000000"} size={40} />
          ) : (
            <IoMdMicOff color={"#000000"} size={40} />
          )}
        </button>
      </div>
    </div>
  );
};

export default Page;
