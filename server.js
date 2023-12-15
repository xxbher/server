const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get("/trigger-api/:dataid/:doorNumber", (req, res) => {
  // Replace 'abcd1234' with the actual socket ID of the client you want to notify
  const clientIdToNotify = "RaAETyb8iFXFHQKZAAAB";

  // Send a message to the specific client
  io.to(req.params.dataid).emit("api-triggered", req.params.doorNumber);

  res.send("API triggered successfully");
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
