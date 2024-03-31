import { generateToken04 } from "@/components/zegoServerAssistant";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body;
  let { userID } = body;
  if (!userID) {
    return res.status(400).json({ data: "Error" });
  }

  const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "");
  const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_ID || "";

  const effectiveTimeInSeconds = 93600; //type: number; unit: s； token 过期时间，单位：秒
  //   {"room_id":""}
  // ,"privilege":{"1":1,"2":1}
  // const payloadObject = {room_id: roomID};
  // const payload = JSON.stringify(payloadObject);
  const payload = "";
  // Build token

  const token = generateToken04(
    appID,
    userID.toString(),
    serverSecret,
    effectiveTimeInSeconds,
    payload
  );
  if (token.length != 0) {
    res.status(200).json({ data: token });
  } else {
    res.status(500).send("Error");
  }

  //   wss://webliveroom32110601-api.coolzcloud.com/ws
  // fetch(`wss://webliveroom32110601-api.coolzcloud.com/ws?userID=${userID}&expired_ts=86400`,{
  //     method:"GET",
  // })
  // .then((res)=>res.json())
  // .then((res)=>{

  // const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
  //    appId,
  //    token,
  //    roomID,
  //    userID,
  //    userName
  // );
  // const zp = ZegoUIKitPrebuilt.create(kitToken);
  //... to joinRoom
}

export const config = {
  api: {
    externalResolver: true,
  },
};
