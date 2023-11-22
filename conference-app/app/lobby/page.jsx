"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import { SocketContext, useSocket } from "../context/SocketProvider";
import Link from 'next/link'
import { useRouter } from 'next/navigation';


function Page() {
  // State variables to store input values
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const router = useRouter();
  const socket = useSocket()

  // Event handler for the email input
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Event handler for the room input
  const handleRoomChange = (e) => {
    setRoom(e.target.value);
  };

  // Event handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    //emit this event 
    socket.emit("room:join", { email, room });
    router.push(`/videoRoom/${room}`);
    // You can use the email and room values as needed

    // You can also send this data to a server, update state, or perform other actions.
  };
  

  useEffect(() => {
    socket.on("room:join", (data) => {
      console.log(`Data from server`,data);
    })
    socket.on("user:joined", (data) => {
      console.log(`User joined data`,data);
    });
    return () => {
      socket.off('room:join')
      socket.off('user:joined')
    }
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
            Email:
          </label>
          <input
            type="string"
            id="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
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
            value={room}
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
