const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const formatMsg = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socket(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = "Chat Bot";

// Run when client connects
io.on('connection', socket => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // welcome current user
        socket.emit('message', formatMsg(botName, "Welcome to Chat Room!"));

        // broadcast when a user connects
        socket.broadcast.to(user.room).emit("message", formatMsg(botName, `${user.username} has joined the room!`));

        // send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // listen for chat message
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMsg(user.username, msg));
    })

    // run when a user disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit("message", formatMsg(botName, `${user.username} has left the room!`));
        }

        // send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});