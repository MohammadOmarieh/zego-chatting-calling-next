"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Room from "@/components/room";
export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userName, setUserName] = useState("");
  const handleSubmitVideo = (e: any) => {
    e.preventDefault();
    router.replace(`/video?userId=${userId}&roomId=${roomId}`);
  };
  const handleSubmitChat = (e: any) => {
    e.preventDefault();
    // router.replace(`/video?userId=${userId}&roomId=${roomId}`);
    router.replace(
      `/chat?userId=${userId}&userName=${userName}&avatarUrl=${avatarUrl}`
    );
  };
  return (
    <div className="flex items-center justify-center w-full h-screen gap-5">
      <form
        onSubmit={handleSubmitVideo}
        className="w-2/5 h-[60vh] bg-cyan-300 rounded-lg flex items-center justify-center flex-col gap-5"
      >
        <h1 className="text-4xl font-semibold ">Zego-Calling App</h1>
        <div className="p-5 w-3/6 flex flex-col gap-5">
          <label>
            <p className="text-xl font-medium">Enter User ID</p>
            <input
              type="text"
              name="userid"
              className="w-full text-xl px-4 py-2 rounded-lg"
              placeholder="ex: a445"
              value={userId}
              required
              onChange={(e) => {
                setUserId(e.target.value);
              }}
            />
          </label>
          <label>
            <p className="text-xl font-medium">Enter Room ID</p>
            <input
              type="text"
              name="roomid"
              className="w-full text-xl px-4 py-2 rounded-lg"
              placeholder="ex: 1234"
              value={roomId}
              required
              onChange={(e) => {
                setRoomId(e.target.value);
              }}
            />
          </label>
        </div>
        <button
          className="bg-blue-700 rounded-xl text-white text-xl px-5 py-2"
          type="submit"
        >
          Submit
        </button>
      </form>
      <form
        onSubmit={handleSubmitChat}
        className="w-2/5 h-[60vh] bg-green-400 rounded-lg flex items-center justify-center flex-col gap-5"
      >
        <h1 className="text-4xl font-semibold ">Zego-Chat App</h1>
        <div className="p-5 w-3/6 flex flex-col gap-5">
          <label>
            <p className="text-xl font-medium">Enter User ID</p>
            <input
              type="text"
              name="userid"
              className="w-full text-xl px-4 py-2 rounded-lg"
              placeholder="ex: a445"
              value={userId}
              required
              onChange={(e) => {
                setUserId(e.target.value);
              }}
            />
          </label>
          <label>
            <p className="text-xl font-medium">Enter User Name</p>
            <input
              type="text"
              name="userName"
              className="w-full text-xl px-4 py-2 rounded-lg"
              placeholder="Example"
              value={userName}
              required
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            />
          </label>
          <label>
            <p className="text-xl font-medium">Enter Avatar Url</p>
            <input
              type="text"
              name="avatarURL"
              className="w-full text-xl px-4 py-2 rounded-lg"
              placeholder="https://ww..."
              value={avatarUrl}
              required
              onChange={(e) => {
                setAvatarUrl(e.target.value);
              }}
            />
          </label>
        </div>
        <button
          className="bg-blue-700 rounded-xl text-white text-xl px-5 py-2"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
