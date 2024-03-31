import React from "react";
import Image from "next/image";
import { FaFile } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";

const Message = ({ item }: { item: any }) => {
  return (
    <>
      {item?.type === 1 ? (
        <p>{item?.message}</p>
      ) : item?.type === 11 ? (
        <div className="w-full aspect-square overflow-hidden flex items-center justify-center">
          {item?.fileDownloadUrl?.toString() !== "logo.png" ? (
            <Image
              src={item?.fileDownloadUrl}
              height={60}
              width={60}
              alt={"Image"}
              className="w-full h-full object-cover"
              onError={() => {
                console.log("image error");
              }}
            />
          ) : (
            <MdErrorOutline size={80} color="red" />
          )}
        </div>
      ) : item?.type === 12 ? (
        <div className="flex flex-col items-center gap-5">
          <FaFile size={100} />
          <p className="w-full truncate">{item?.fileName}</p>
        </div>
      ) : null}
    </>
  );
};

export default Message;
