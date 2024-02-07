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

  // Listen for the client-emitted "client-response" event
  socket.on("client-response", (response, callback) => {
    console.log(`Received response from client: ${response}`);
    // Send an acknowledgment back to the client
    callback("Acknowledgment from server");
  });
});

app.get("/trigger-api/:dataid/:doorNumber", (req, res) => {
  const dataid = req.params.dataid;
  const doorNumber = req.params.doorNumber;

  // Include a response in the "api-triggered" event
  const responseMessage = "API trigger message sent to clients in the room";

  // Emit the event and pass a callback function
  io.to(dataid).emit("api-triggered", { doorNumber, response: responseMessage }, (clientResponse) => {
    console.log(`Received response from client: ${clientResponse}`);
    
    // Respond to the HTTP request including the client's response
    res.send({
      apiResponse: responseMessage,
      clientResponse,
    });
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
