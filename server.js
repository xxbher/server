const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Add middleware to handle JSON in the request body
app.use(express.json());

// Function to find a socket by userId
function findSocketByUserId(userId) {
  const sockets = io.of("/").connected;

  if (sockets) {
    const socketValues = Object.values(sockets);
    console.log(
      "Connected Sockets:",
      socketValues.map((socket) => socket.handshake.query)
    );

    const targetSocket = socketValues.find(
      (socket) => socket.handshake.query.userId === userId
    );

    if (targetSocket) {
      return targetSocket;
    } else {
      console.error(`Socket not found for userId ${userId}`);
    }
  } else {
    console.error("No connected sockets found");
  }

  // Log the socket IDs and namespaces for further investigation
  console.log("All Socket IDs:", Object.keys(io.sockets?.sockets || {}));
  console.log("All Socket Namespaces:", Object.keys(io.nsps || {}));

  return null;
}

// Handle API endpoint for sending data to the client
app.post("/api/sendDataToClient", async (req, res) => {
  const userId = req.body.userId;
  const data = req.body.data;

  console.log("Received API request to send data:", { userId, data });

  // Wait for a short duration to ensure the connection is fully established
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Find the socket associated with the userId
  const targetSocket = findSocketByUserId(userId);

  if (targetSocket) {
    // Send data to the target client
    targetSocket.emit("serverResponse", data);
    console.log("Data sent to client successfully");
    res.json({ success: true, message: "Data sent to client successfully" });
  } else {
    console.error(`Client not found for userId ${userId}`);
    res.status(404).json({ success: false, message: "Client not found" });
  }
});

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`Client connected with ID ${socket.id} and userId ${userId}`);

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log(
      `Client disconnected with ID ${socket.id} and userId ${userId}`
    );
    // Handle disconnection, update database, etc.
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
