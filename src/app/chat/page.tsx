"use client";
import React from "react";
import { ZIM } from "zego-zim-web";
import Chatting from "./chatting";

const Page = () => {
  const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "");

  ZIM.create({ appID });
  let zim = ZIM.getInstance();
  return <Chatting zimInstance={zim} />;
};

export default Page;
