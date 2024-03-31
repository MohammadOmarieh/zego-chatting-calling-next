"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  ZIM,
  ZIMConnectionEvent,
  ZIMConnectionState,
  ZIMError,
  ZIMMessage,
  ZIMLoginConfig,
  ZIMConversation,
  ZIMMessageQueriedResult,
  ZIMMediaMessageBase,
} from "zego-zim-web";
import { IoPersonCircle } from "react-icons/io5";
import Image from "next/image";
import { GoFileDirectory, GoFileMedia } from "react-icons/go";
import Message from "./Message";
// type ZIMLoginConfig = {
//   userName?: string;
//   token?: string;
//   isOfflineLogin?: boolean;
// };

const Chatting = ({ zimInstance }: { zimInstance: ZIM }) => {
  const searchParams = useSearchParams();
  const userId = searchParams?.get("userId");
  const avatarUrl = searchParams?.get("avatarUrl");
  const userName = searchParams?.get("userName");
  let userInfo = { userID: userId || "", userName: userName || userId || "" };
  //   let ZIMLoginConfig;
  const [messagesHistory, setMessagesHistory] =
    useState<ZIMMessageQueriedResult>();
  const [messagesHistoryList, setMessagesHistoryList] = useState<ZIMMessage[]>(
    []
  );
  const [zim, setZim] = useState(zimInstance);
  const [token, setToken] = useState("token");
  const [zimLoginConfig, setzimLoginConfig] = useState<ZIMLoginConfig>({
    userName: userId || "",
    token: token || "",
    isOfflineLogin: false,
  });
  const [conservationData, setConservationData] = useState<ZIMConversation>();
  const [sendMessage, setSendMessage] = useState("");
  const [sendMessageNewChat, setSendMessageNewChat] = useState("");
  const errorFun = (zim: ZIM, errorInfo: ZIMError) => {
    console.log({ message: "function error", errorInfo });
  };
  const [conservationList, setConservationList] = useState<ZIMConversation[]>(
    []
  );
  const [isLogin, setIsLogin] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [newToConservationId, setNewToConservationId] = useState("");
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  // const chatBoxRef = useRef<HTMLDivElement>(null);
  const [timeMark, setTimeMart] = useState("");
  const connectionStateChangedFun = (
    zim: ZIM,
    {
      state,
      event,
      extendedData,
    }: {
      state: ZIMConnectionState;
      event: ZIMConnectionEvent;
      extendedData: string;
    }
  ) => {
    console.log({
      message: "function connectionStateChanged",
      state,
      event,
      extendedData,
    });
    // When SDK logout occurred due to a long-time network disconnection, you will need to log in again.
    if (state == 0 && event == 3) {
      // zim.login(userId || "", token)
    }
  };

  const receivePeerMessageFunc = (
    zim: ZIM,
    {
      messageList,
      fromConversationID,
    }: { messageList: ZIMMessage[]; fromConversationID: string }
  ) => {
    console.log({
      message: "function receivePeerMessage",
      messageList,
      fromConversationID,
    });
    setMessagesHistoryList((messagesHistoryList) => [
      ...messagesHistoryList,
      ...messageList,
    ]);
  };

  const tokenWillExpireFunc = (zim: ZIM, { second }: { second: number }) => {
    console.log("tokenWillExpire", second);
    // You can call the renewToken method to renew the token.
    // To generate a new Token, refer to the Prerequisites.
    zim
      .renewToken(token)
      .then(function ({ token }) {
        // Renewed successfully.
      })
      .catch(function (err) {
        // Renew failed.
      });
  };

  const handleCreateNewChat = (e: any) => {
    // e.preventDefault();
    handleSendMessage(e, newToConservationId, sendMessageNewChat)
      .then(function ({ message }) {
        // Message sent successfully.
        console.log({
          message: "function message sent successfully",
          messageData: message,
        });
        setMessagesHistoryList((messagesHistoryList) => [
          ...messagesHistoryList,
          message,
        ]);
        setNewToConservationId("");
        setSendMessageNewChat("");
        setRefresh(!refresh);
      })
      .catch(function (err) {
        console.log({ message: "function message sent faild", err });

        // Failed to send a message.
      });
  };

  const handleSendMessage = (
    e: any,
    toConversationID: string,
    message: string
  ) => {
    //  Send one-to-one text messages.
    e.preventDefault();
    // let toConversationID = toConversationID || "";
    let conversationType = 0; // Message type; 1-on- chat: 0, in-room chat: 1, group chat:2
    let config = {
      priority: 1, // Set priority for the message. 1: Low (by default). 2: Medium. 3: High.
    };

    let messageTextObj = {
      type: 1,
      message: message,
      //   extendedData: "Message extended info(optional)",
    };
    let notification = {
      onMessageAttached: function (message: any) {
        console.log({
          message: "fucntion onMessageAttached",
          messageP: message,
        });
        // todo: Loading
      },
    };

    return zim.sendMessage(
      messageTextObj,
      toConversationID,
      conversationType,
      config,
      notification
    );
  };

  let notification = {
    onMessageAttached: function (message: any) {
      // todo: Loading
      console.log({ message: "function onMessageAttached", messageP: message });
    },
    onMediaUploadingProgress: function (
      message: any,
      currentFileSize: any,
      totalFileSize: any
    ) {
      // todo: upload progress
      console.log({
        message: "function onMediaUploadingProgress",
        messageP: message,
        currentFileSize,
        totalFileSize,
      });
    },
  };
  const handleSendMedia = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: number
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadImage(e.target.files[0]);
      console.log({ message: "function file upload", file: e.target.files[0] });
    }

    let conversationID = conservationData?.conversationID || "";
    let config = { priority: 1 };

    let message = { fileLocalPath: e?.target?.files?.[0], type };

    zim
      .sendMediaMessage(message, conversationID, 0, config, notification)
      .then((res) => {
        console.log({ message: "function file upload success", res });
        setMessagesHistoryList((messagesHistoryList) => [
          ...messagesHistoryList,
          res.message,
        ]);
      })
      .catch((err) => {
        console.log({ message: "function file upload fail", err });
      });
  };

  //get the history message
  function queryMessageCallback() {
    let config = {
      nextMessage: undefined, // NextMessage is null on the first query.
      count: 30,
      reverse: true,
    };
    let conversationType = 0;
    let conversationID = conservationData?.conversationID || "";
    // setMessagesHistory([...messagesHistory, ...messageList]);

    // When you scroll down to a message at the top of the screen, you can search for earlier messages.    if (fetchMore && messageList.length > 0) {
    // In subsequent paging queries, nextMessage is the last message in the list of messages currently queried.
    // config.nextMessage = messageList[messageList.length - 1];
    zim
      .queryHistoryMessage(conversationID, conversationType, config)
      .then((queryMessageCallback) => {
        console.log({
          message: "function history message",
          queryMessageCallback,
        });
        setMessagesHistory(queryMessageCallback);
        setMessagesHistoryList(queryMessageCallback.messageList);
      });
  }

  const scrollToBottom = () => {
    // if (chatBoxRef.current) {
    //   console.log("function scrollToBottom");

    //   (chatBoxRef?.current as HTMLDivElement)?.scrollIntoView({
    //     behavior: "smooth",
    //     block: "end",
    //   });
    // }
    let objDiv = document.getElementById("chatBox");
    if (objDiv) objDiv.scrollTop = objDiv.scrollHeight;
  };

  function formatDate(timestamp: any) {
    // Create a new Date object from the timestamp
    const date = new Date(timestamp);

    // Format the date
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return formattedDate;
  }

  const timeHistory = (time: string) => {
    if (timeMark !== time) {
      setTimeMart(time);
      return time;
    }
  };

  console.log({ conservationList });

  useEffect(() => {
    if (conservationData?.conversationID) {
      queryMessageCallback();
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conservationData]);

  // Set up and listen for the callback for receiving error codes.
  useEffect(() => {
    zim.on("error", errorFun);

    // return zim.off('error')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up and listen for the callback for connection status changes.
  useEffect(() => {
    zim.on("connectionStateChanged", connectionStateChangedFun);

    // return zim.off("connectionStateChanged", connectionStateChangedFun);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up and listen for the callback for receiving one-to-one messages.
  useEffect(() => {
    zim.on("receivePeerMessage", receivePeerMessageFunc);
  });

  // Set up and listen for the callback for token expires.
  useEffect(() => {
    zim.on("tokenWillExpire", tokenWillExpireFunc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    axios
      .post("/api/get-zego-token", { userID: userId })
      .then((result) => {
        const token = result?.data?.data;
        setToken(token);
        const userInfo: ZIMLoginConfig = {
          userName: userId || "",
          token: token || "",
          isOfflineLogin: false,
        };
        setzimLoginConfig(userInfo);

        zim
          .login(userId || "", userInfo)
          .then(() => {
            // Login successful.
            setIsLogin(true);
            console.log("function login successful");

            //update convervation avatar
            if (avatarUrl) {
              zim
                .updateUserAvatarUrl(avatarUrl)
                .then(() => {
                  console.log("function avatar successful");
                })
                .catch((error) => {
                  console.log({ message: "function avatar failed", error });
                });
            }
          })
          .catch((err) => {
            // Login failed.
            console.log("function login failed");
          });
      })
      .catch((error: any) => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLogin) {
      let config = {
        // The number of conversations queried per page.
        count: 20,
      };
      // Pull the conversation list.
      zim
        .queryConversationList(config)
        .then(function ({ conversationList }) {
          // Query succeeded. You need to store and maintain the conversation objects in the array.
          console.log({
            message: "function pull conversation list successfully",
            conversationList,
          });
          setConservationList(conversationList);
        })
        .catch(function (err) {
          // Query failed.
          console.log({
            message: "function pull conversation list faild",
            err,
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin, refresh]);

  // Set up and listen for the callback for receiving the one-to-one messages.
  useEffect(() => {
    zim.on(
      "receivePeerMessage",
      function (zim, { messageList, fromConversationID }) {
        console.log("receivePeerMessage", messageList, fromConversationID);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messagesHistoryList?.length > 0) {
      scrollToBottom();
    }
  }, [messagesHistoryList]);

  return (
    <div className="w-full h-screen flex items-center justify-between bg-[#F2F2F2]">
      <div className="w-[30%] h-screen bg-white p-5">
        <form
          onSubmit={handleCreateNewChat}
          className="bg-gradient-to-l from-secondary to-primary shadow-md flex flex-col gap-4 p-5 mb-5 rounded-md w-full"
        >
          <p className="text-white text-xl font-medium">create new chat</p>
          <input
            type="text"
            className="w-full rounded-md p-2"
            placeholder="User ID"
            value={newToConservationId}
            onChange={(e) => {
              setNewToConservationId(e.target.value);
            }}
          />
          <input
            type="text"
            className="w-full rounded-md p-2"
            placeholder="message"
            value={sendMessageNewChat}
            onChange={(e) => {
              setSendMessageNewChat(e.target.value);
            }}
          />
          <button className="h-12 w-16 rounded-lg bg-[#85B4D5] text-white self-center">
            send
          </button>
        </form>
        {conservationList?.map((item: ZIMConversation, index: number) => (
          <div
            key={index}
            className={`${
              item.conversationID === conservationData?.conversationID
                ? "bg-gradient-to-l from-secondary to-primary shadow-md"
                : "hover:bg-[#F2F2F2]"
            } flex justify-start gap-4 p-5 mb-5 rounded-md cursor-pointer w-full`}
            onClick={() => {
              setConservationData(item);
            }}
          >
            <div className="bg-green-400 w-16 h-16 rounded-full overflow-hidden">
              {/* <IoPersonCircle size={60} /> */}
              {item?.conversationAvatarUrl && (
                <Image
                  src={item?.conversationAvatarUrl}
                  height={60}
                  width={60}
                  alt={"Avatar"}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div
              className={`flex flex-col justify-between w-[70%] ${
                item.conversationID === conservationData?.conversationID
                  ? "text-white"
                  : ""
              }`}
            >
              <p className={`truncate text-xl `}>{item?.conversationName}</p>
              <p className={`w-full truncate text-lg `}>
                {item?.lastMessage?.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {conservationData?.conversationID ? (
        <div className="h-screen w-[70%] flex flex-col">
          <div
            className="w-full bg-[#F2F2F2] flex flex-col gap-5 h-screen overflow-auto px-3 py-5 "
            id="chatBox"
          >
            {messagesHistoryList?.length > 0 &&
              messagesHistoryList?.map((item: any, index: number) => {
                return (
                  <div
                    key={index}
                    className={`w-full flex items-center gap-3  ${
                      item?.senderUserID === userId ? "flex-row-reverse" : ""
                    }`}
                  >
                    {item?.senderUserID !== userId &&
                    conservationData?.conversationAvatarUrl ? (
                      <div className="bg-green-400 w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={conservationData?.conversationAvatarUrl}
                          height={60}
                          width={60}
                          alt={"Avatar"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : item?.senderUserID === userId && avatarUrl ? (
                      <div className="bg-green-400 w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={avatarUrl}
                          height={60}
                          width={60}
                          alt={"Avatar"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <IoPersonCircle size={40} />
                    )}
                    <div
                      className={`-500  rounded-md max-w-[50%] ${
                        item?.type === 11 ? "w-[27%]" : "p-3"
                      } ${
                        item?.senderUserID === userId
                          ? "bg-[#C7E6FC]"
                          : "bg-white"
                      }`}
                    >
                      {item && <Message item={item} />}
                    </div>
                  </div>
                );
              })}
          </div>
          <form
            onSubmit={(e) =>
              handleSendMessage(
                e,
                conservationData?.conversationID || "",
                sendMessage
              )
                .then(function ({ message }) {
                  // Message sent successfully.
                  console.log({
                    message: "function message sent successfully",
                    messageData: message,
                  });
                  setMessagesHistoryList((messagesHistoryList) => [
                    ...messagesHistoryList,
                    message,
                  ]);
                  setSendMessage("");
                })
                .catch(function (err) {
                  console.log({ message: "function message sent faild", err });

                  // Failed to send a message.
                })
            }
            className="bg-[#E6E6E6] w-full h-48 flex p-3 gap-10 items-center"
          >
            <div className="bg-white h-full w-4/5 rounded-md flex flex-col">
              <div className="h-14 w-full rounded-md flex items-center pt-3 px-5 gap-5">
                <label className="cursor-pointer">
                  <GoFileDirectory size={30} color="#666666" />
                  <input
                    type="file"
                    onChange={(e) => {
                      handleSendMedia(e, 12);
                    }}
                    className="hidden"
                  />
                </label>

                <label className="cursor-pointer">
                  <GoFileMedia size={30} color="#666666" />
                  <input
                    type="file"
                    onChange={(e) => {
                      handleSendMedia(e, 11);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                style={{ resize: "none" }}
                className="w-full h-full rounded-md p-5 border-0 outline-none"
                placeholder="message ..."
                value={sendMessage}
                required
                onChange={(e) => {
                  setSendMessage(e.target.value);
                }}
              />
            </div>
            <button
              className="h-14 w-16 rounded-lg bg-[#85B4D5] text-white"
              type="submit"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="h-screen w-[70%] flex justify-center items-center">
          <p>Please Choose a chat</p>
        </div>
      )}
    </div>
  );
};

export default Chatting;
