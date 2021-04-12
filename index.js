const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const pastelColor = 'hsl(' + hue + ', 100%, 80%)';
  return pastelColor
}

let users = [];

io.on("connection", (socket) => {
  console.log("Client connected!", socket.id);

  socket.on("newUser", ({ username }) => {
    socket.username = username;
    socket.color = getRandomPastelColor();

    users.push({
      username,
      id: socket.id
    });

    socket.emit("loginSuccess", {
      numberOfConnectedUsers: users.length,
      users,
    });

    socket.broadcast.emit("userJoined", {
      username,
      users,
      numberOfConnectedUsers: users.length,
    });
  });

  socket.on("newMessage", (message) => {
    socket.broadcast.emit("newMessage", {
      from: socket.username,
      message,
      color: socket.color
    });
  });

  socket.on("disconnect", () => {
    users = users.filter(user => user.id !== socket.id)

    socket.broadcast.emit("userDisconnected", {
      username: socket.username,
      users,
      numberOfConnectedUsers: users.length,
    });
  });
});

app.get("/", (req, res) => {
  res.send("something!");
});

const port = process.env.PORT || 9000;

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
