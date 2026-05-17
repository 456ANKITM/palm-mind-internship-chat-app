# ChatFlow - Messaging Platform

A full stack real-time chat application buid with react, redux, RTK Query, socket.io, node js and mongo db atlas database. I used prebuilt UI for some UI Components

# Features of this application

- Real time message transfer
- 1-1 Chat
- Unread Message Count tracking
- Authentication using JWT
- Full responsive
- User Search Feature by their name

# Future scope

- Message Encryption
- File Sending

# Tech Stack

Frontend

- React JS
- Tailwind CSS
- Redux
- RTK Query
- Socket.io Client
- Lucide-react
- Socket.io-client

Backend

- Node Js
- Express
- Mongo DB Atlas + Mongoose
- Socket.io
- JWT Authentication (Cookie-Based)
- Cloudinary (for Profile picture upload)

# Folder Structure

client/
│
├── components/
├── pages/
├── redux/
├── socket.js
├── assets/
└── App.jsx

server/
│
├── controllers/
├── models/
├── routes/
├── middleware/
└── server.js
|** socket.js
|** utils/
|\_\_config/

# Installation and setup

git clone https://github.com/456ANKITM/palm-mind-internship-chat-app.git

# Install Dependencies and set environment Variables

cd frontend
npm install

cd backend
npm install

# Run the application

cd frontend
npm run dev

cd backend
npm run dev
