"use client"
import React, { createContext, useMemo, useContext } from 'react'
import {io} from 'socket.io-client'

export const SocketContext = createContext(null);

export const useSocket = () =>{
    const socket = useContext(SocketContext)
    return socket
}

function SocketProvider(props) {
    const socket = useMemo(()=> io("https://video-conference-server.onrender.com"),[])
  return (
    <SocketContext.Provider value={socket} >
        {props.children}
    </SocketContext.Provider>
  )
}

export default SocketProvider