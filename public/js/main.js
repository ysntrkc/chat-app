const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const roomUsers = document.getElementById("users");

// get username and room
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// join room
socket.emit("joinRoom", { username, room })

// get room and users
socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputRoomUsers(users);
})

// message from server
socket.on("message", message => {
    outputMessage(message);

    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// submit message
chatForm.addEventListener("submit", e => {
    e.preventDefault();

    // get message
    const msg = e.target.elements.msg.value;

    // emit message to server
    socket.emit("chatMessage", msg);

    // clear input
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

// output message to DOM
function outputMessage(msg) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `
        <p class="meta">${msg.username} <span>${msg.time}</span></p>
        <p class="text">
            ${msg.text}
        </p>
    `;
    chatMessages.appendChild(div);
}

// output room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// output usernames to DOM
function outputRoomUsers(users) {
    roomUsers.innerHTML = `${users.map(user => {
        if (user.id === socket.id) {
            return `<li><b>${user.username}</b></li>`
        } else {
            return `<li>${user.username}</li>`
        }
    }).join("")}`;
}