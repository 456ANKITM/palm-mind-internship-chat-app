import {Server} from "socket.io";

let onlineUsers = [];

export const initSocket = (server) => {

    const io = new Server (server, {
        cors:{
            origin: process.env.ORIGIN ||  "http://localhost:5173",
            credentials:true
        }
    })

    io.on("connection", (socket) => {
        console.log("User Connected:", socket.id);

        // Add User 
        socket.on("addUser", (userId)=>{
            onlineUsers = onlineUsers.filter((u) => u.userId !== userId);
            onlineUsers.push({
                userId,
                socketId: socket.id
            })
        })

        // Send and receive Message 
        socket.on("sendMessage", (data) => {
            const {
                conversationId, 
                senderId,
                receiverId,
                text
            } = data;
            const receiver = onlineUsers.find((user)=>user.userId === receiverId)
            if(receiver) {
                io.to(receiver.socketId).emit("getMessage",{
                    conversationId,
                    senderId,
                    text
                })
                io.to(receiver.socketId).emit("newUnreadMessage",{
                    conversationId,
                })
            }
        })

        // 
        socket.on("disconnect", ()=>{
            onlineUsers = onlineUsers.filter((user)=>user.socketId !== socket.id)
            console.log("User Disconnected", socket.id)
        })
    })
    console.log("Socket Initialized")
}