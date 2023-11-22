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

  useEffect(() => {
    console.log(peer);
  }, []);
  //variable to store userStream
  const [myStream, setMyStream] = useState();

  const [streamPlay, setStreamPlay] = useState(true);
  const [remoteMute, setRemoteMute] = useState(false);

  async function getMyStream(audio) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: audio ? audio : true,
      video: true,
    });
    setMyStream(stream);
  }

  //function to handle user joined
  const handleUserJoined = useCallback(({ email, id }) => {
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
    socket.emit("call:mute", { to: remoteSocketId });
    setRemoteMute((state) => !state);
  };

  const handleRemoteCallMuted = useCallback(async ({ from }) => {
    // setRemoteMute(state => !state)
  }, []);

  //useeffect for user:joined and incoming call
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("call:muted", handleRemoteCallMuted);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
    handleRemoteCallMuted,
  ]);

  return (
    <div className="flex flex-col flex-1 items-center   ">
      <h1 className="text-6xl text-white font-bold mt-16 ">
        Room Number - {roomNumber}
      </h1>
      <div className="mt-10 flex flex-col items-center">
        <h4 className=" text-2xl   ">
          {remoteSocketId ? "Connected" : "There is  no one in room"}
        </h4>
        {remoteSocketId && (
          <button
            style={{ background: "white", color: "black" }}
            onClick={sendStreams}
          >
            Send Stream
          </button>
        )}
        {remoteSocketId && (
          <button
            style={{ background: "white", color: "black" }}
            onClick={handleCallUser}
          >
            CALL
          </button>
        )}
      </div>
      <div className="flex mt-6">
        {myStream && (
          <div>
            <h1 className="text-white text-xl">My Video</h1>
            <ReactPlayer
              style={{ borderWidth: 1, borderColor: "white" }}
              playing={streamPlay}
              muted
              height={488}
              width={650}
              url={myStream}
              ref={playerRef}
            />
            <div>
              <button
                style={{
                  height: 20,
                  width: 20,
                }}
                onClick={toggleMute}
              >
                {remoteMute ? mute : unmute}
              </button>

              <button
                className="ml-16"
                onClick={() => {
                  setStreamPlay((streamPlay) => !streamPlay);
                }}
              >
                {streamPlay ? videoOn : videoOff}
              </button>
            </div>
          </div>
        )}

        {remoteStream && (
          <div className="mx-4">
            <h1 className="text-white text-xl">Remote Stream</h1>
            {console.log("This is ", remoteMute)}
            <ReactPlayer
              style={{ borderWidth: 1, borderColor: "white" }}
              playing
              muted={remoteMute}
              height={488}
              width={650}
              url={remoteStream}
            />
          </div>
        )}
      </div>
    </div>
  );
}
