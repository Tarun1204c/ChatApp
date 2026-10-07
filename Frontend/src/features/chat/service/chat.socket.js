import { io } from "socket.io-client";

export const initializeSocketConnection = () => {
    const socket = io(import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : "http://localhost:3000"), {
        withCredentials: true,
    })

    socket.on("connect", () => {
        console.log("Connected to Socket.io server")
    })

    return socket
}