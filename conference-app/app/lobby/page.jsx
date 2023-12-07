"use client";
import { useCallback, useContext, useEffect, useState, useRef } from "react";
import { SocketContext, useSocket } from "../context/SocketProvider";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function Page() {
  const searchParams = useSearchParams();

  const search = searchParams.getAll("search", "sis");
  // State variables to store input values
  const [name, setName] = useState("");
  // const [room, setRoom] = useState("");
  const roomNumberRef = useRef();
  const router = useRouter();
  const socket = useSocket();

  // Event handler for the name input
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  // Event handler for the room input
  const handleRoomChange = (e) => {
    roomNumberRef.current = e.target.value;
  };

  // Event handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    let roomNumber = roomNumberRef.current;
    //emit this event
    socket.emit("room:join", { name, roomNumber });

    // You can use the name and room values as needed

    // You can also send this data to a server, update state, or perform other actions.
  };

  useEffect(() => {
    socket.on("room:join", (data) => {
      router.push(`/videoRoom/${roomNumberRef.current}`);
    });
    socket.on("user:joined", (data) => {
      console.log(`User joined data`, data);
    });
    return () => {
      socket.off("room:join");
      socket.off("user:joined");
    };
  }, [socket]);

  return (
    <div className="flex flex-col self-center ml-[40%] items-center justify-center">
      <div className="mb-10 flex flex-col items-center">
        <h1 className="text-white text-5xl mb-5">Welcome to lobby</h1>
        <p className="text-white">Provide information to join a room</p>
      </div>

      <form onSubmit={handleSubmit} className="w-4/5">
        <div className="mb-4 w-full">
          <label
            htmlFor="string"
            className="block text-lg font-semibold text-white"
          >
            Name:
          </label>
          <input
            type="string"
            id="name"
            name="name"
            value={name}
            onChange={handleNameChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="room"
            className="block text-lg font-semibold text-white"
          >
            Room:
          </label>
          <input
            type="number"
            id="room"
            name="room"
            value={roomNumberRef.current}
            onChange={handleRoomChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r  text-white text-xl rounded-xl from-[#1E59F0] to-[#b23ab4]  px-8 py-4 flex items-center "
        >
          Join Room
        </button>
      </form>
    </div>
  );
}

export default Page;
