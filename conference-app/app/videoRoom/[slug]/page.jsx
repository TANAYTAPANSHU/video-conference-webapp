"use client";
import ReactPlayer from "react-player";
import { SocketContext } from "../../context/SocketProvider";
import React, {
  useCallback,
  useEffect,
  useContext,
  useState,
  useRef,
} from "react";
import peer from "../../service/peer";
import { mute, unmute, videoOn, videoOff } from "../../assets/icons";

export default function Page({ params }) {
  const roomNumber = params.slug;

  //get the socket using context
  const socket = useContext(SocketContext);

  const playerRef = useRef();

  //state variable to set remote socket id  and stream
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [remoteStream, setRemoteStream] = useState();
  const [isCallDone, setIsCallDone] = useState(false);
  const [isStreamSent, setIsStreamSent] = useState(false);
  
  //boolean to handle user mute
  const [isUserMute, setIsUserMute] = useState(false)
  //boolean to handle user Video 
  const [isUserVisible, setIsUserVisible] = useState(true)

  //variable to store userStream
  const [myStream, setMyStream] = useState();
  const [remoteMute, setRemoteMute] = useState(false);
    //boolean to handle remote user Video 
    const [isRemoteVisible, setIsRemoteVisible] = useState(true)

  async function getMyStream(audio) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: audio ? audio : true,
      video: true,
    });
    setMyStream(stream);
  }

  //function to handle user joined
  const handleUserJoined = useCallback(({ name, id }) => {
    setRemoteSocketId(id);
  }, []);

  //function to call user
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
    setIsCallDone(true);
  }, [remoteSocketId, socket]);

  //function to handle incoming call
  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  //function to send my stream
  const sendStreams = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
      setIsStreamSent(true);
    }
  }, [myStream]);

  //function to handle call accepted
  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      sendStreams();
    },
    [sendStreams]
  );

  //function for handle negotiation
  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    getMyStream();
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const toggleMute = () => {
    setIsUserMute(state => !state)
    socket.emit("call:mute", { to: remoteSocketId });
  };

  const handleRemoteCallMuted = useCallback(async ({ from }) => {
    setRemoteMute((state) => !state);
  }, []);

  const handleRemoteVideoStopped = useCallback(async ({ from }) => {
    setIsRemoteVisible(state => !state)
  }, []);
  

  //useeffect for user:joined and incoming call
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("call:muted", handleRemoteCallMuted);
    socket.on("video:stoped", handleRemoteVideoStopped);
    

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("call:muted", handleRemoteCallMuted);
      socket.off("video:stoped", handleRemoteVideoStopped);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
    handleRemoteCallMuted,
    handleRemoteVideoStopped
  ]);

  return (
    <div className="flex flex-col flex-1 items-center   ">
      <h1 className="lg:text-4xl text-white font-bold mt-16 md:text-3xl sm:mt-8 sm:text-xl  ">
        Room Number - {roomNumber}
      </h1>
      <div className="lg:mt-10  md:mt-8  flex flex-col items-center">
        <h4 className=" lg:text-2xl mb-4  md:text-xl sm:text-base ">
          {remoteSocketId
            ? "Someone has joined"
            : "Looks like you are alone here !"}
        </h4>
        {!isStreamSent && (
          <div className="flex">
            {remoteSocketId && (
              <button
                style={{ background: "white", color: "black" }}
                onClick={handleCallUser}
                className="  text-white text-xl rounded-xl  px-8 py-4 flex items-center mx-4"
              >
                CALL
              </button>
            )}
            {remoteSocketId && isCallDone && (
              <button
                style={{ background: "white", color: "black" }}
                onClick={sendStreams}
                className="bg-gradient-to-r  text-white text-xl rounded-xl from-[#1E59F0] to-[#b23ab4]  px-8 py-4 flex items-center"
              >
                Send Stream
              </button>
            )}
          </div>
        )}
      </div>

      {/* container for video display */}
      <div className="lg:flex lg:mt-12   sm:block md:mt-4">
        {myStream && (
          <div className="block sm:flex sm:flex-col sm:items-center ">
            <h1 className="text-white   lg:text-3xl md:text-xl sm:text-base mb-4 ">My Video</h1>
            <ReactPlayer
              className="border-2 border-white w-1/2"
              playing={isUserVisible}
              muted
              width={"100%"}
              height={"70%"}
              url={myStream}
              ref={playerRef}
            />

            <div className="mt-6">
              <button
                style={{
                  height: 10,
                  width: 10,
                }}
                onClick={toggleMute}
              >
                {isUserMute ? mute : unmute}
              </button>

              <button
                className="ml-16"
                onClick={() => {
                  setIsUserVisible(state => !state)
                  socket.emit("video:stop", { to: remoteSocketId });
                }}
              >
                {isUserVisible ? videoOn : videoOff}
              </button>
            </div>
          </div>
        )}

        {remoteStream && (
          <div className=" lg:mx-4">
            <h1 className="text-white   lg:text-3xl md:text-xl sm:text-base mb-4">Remote Stream</h1>
            <ReactPlayer
              className="border-2 border-white w-1/2"
              playing = {isRemoteVisible}
              muted={remoteMute}
              width={"100%"}
              height={"70%"}
              url={remoteStream}
            />
          </div>
        )}
      </div>
    </div>
  );
}
