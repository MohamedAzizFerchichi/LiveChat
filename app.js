const express = require("express");
const app = express();
const server = require("http").createServer(app).listen(3000);
const io = require("socket.io")(server);
const db = require("./config/db");
const Message = require("./Modules/chat/model");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

io.on("connection", (socket) => {
  socket.emit("connected", "Hello Dear client");

  socket.on("typing", (name) => {
    socket.broadcast.emit("typing", name);
  });

  socket.on("chat message", (msg, name, date) => {
    io.emit("chat message", { msg, name, date });
    const message = new Message({ message: msg, name: name, date: date });
    message.save()
      .then(() => console.log("message saved!"))
      .catch((error) => console.error("Error saving message:", error));
  });

  socket.on("disconnect", () => {
    io.emit("disconnected", "Un utilisateur est déconnecté");
  });
});

app.use(express.static(__dirname + "/public"));
app.use("/api/chat", require("./Modules/chat"));

app.get("/", (req, res, next) => {
  res.sendFile(__dirname + "/index.html");
});
