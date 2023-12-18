const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get("/trigger-api/:dataid/:doorNumber", (req, res) => {
  const dataid = req.params.dataid;
  const doorNumber = req.params.doorNumber;

  io.to(dataid).emit("api-triggered", doorNumber);
  res.send("API triggered successfully");
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  const dataid = socket.handshake.query.dataid;
  socket.join(dataid); // Join the room based on dataid
  
  // Listen for the "command-executed" event from the client
  socket.on("command-executed", (doorNumber) => {
    console.log(`Command executed successfully for door ${doorNumber}`);
    // You can add additional logic here if needed
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
