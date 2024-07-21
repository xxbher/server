const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json()); // Enable JSON parsing for POST requests

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  const dataid = socket.handshake.query.dataid;
  socket.join(dataid); // Join the room based on dataid

  // Event handlers for the socket connection can be added here
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Define the API endpoint outside of the connection block
app.get("/trigger-api/:dataid/:doorNumber", (req, res) => {
  const dataid = req.params.dataid;
  const doorNumber = req.params.doorNumber;

  // Include a response in the "api-triggered" event
  const responseMessage = "API trigger message sent to clients in the room";

  // Emit the "api-triggered" event
  io.to(dataid).emit("api-triggered", { doorNumber, response: responseMessage });

  // Listen for the client-response event from any client in the room
  io.of("/").adapter.rooms.get(dataid).forEach(socketId => {
    const socket = io.sockets.sockets.get(socketId);
    socket.once("client-response", (clientResponse) => {
      res.send({
        apiResponse: "API request received",
        clientResponse,
      });
    });
  });
});

const PORT = process.env.PORT || 7777;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
