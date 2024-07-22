const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const Locker = require("./lockerSchema");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json()); // Enable JSON parsing for POST requests

mongoose
  .connect(
    "mongodb+srv://bher:FQezjVMpeZ0oLulY@ac-nhlkcuk.f29jvsq.mongodb.net/SOPHON?retryWrites=true",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.log("MongoDB Connection Failed"));

// Handle general connections
const generalNamespace = io.of("/general");
generalNamespace.on("connection", async (socket) => {
  const dataid = socket.handshake.query.dataid;
  console.log(`General client connected: ${dataid}`);

  socket.join(dataid);
  const locker = await Locker.findOneAndUpdate(
    { location_code: dataid },
    { $set: { locker_status: true } },
    { new: true }
  );
  socket.on("disconnect", async () => {
    const locker = await Locker.findOneAndUpdate(
      { location_code: dataid },
      { $set: { locker_status: false } },
      { new: true }
    );
  });
});

// Handle controller connections
const controllerNamespace = io.of("/controller");
controllerNamespace.on("connection", async (socket) => {
  const dataid = socket.handshake.query.dataid;
  console.log(`Controller client connected: ${dataid}`);

  socket.join(dataid);

  try {
    const locker = await Locker.findOneAndUpdate(
      { location_code: dataid },
      { $set: { locker_controller_status: true } },
      { new: true }
    );
  } catch (err) {
    console.error("Error fetching locker by location_code:", err.message);
  }

  socket.on("disconnect", async () => {
    const locker = await Locker.findOneAndUpdate(
      { location_code: dataid },
      { $set: { locker_controller_status: false } },
      { new: true }
    );
  });
});

app.get("/maintinance/:dataid/:status", (req, res) => {
  const dataid = req.params.dataid;
  const status = req.params.status;

  // Include a response in the "api-triggered" event
  const responseMessage = "API trigger message sent to clients in the room";

  // Emit the "api-triggered" event to the specified room in the general namespace
  generalNamespace.to(dataid).emit("maintinance", {
    status,
    response: responseMessage,
  });

  res.send("Event emitted successfully");
});

app.get("/trigger-api/:dataid/:doorNumber", (req, res) => {
  const dataid = req.params.dataid;
  const doorNumber = req.params.doorNumber;

  // Include a response in the "api-triggered" event
  const responseMessage = "API trigger message sent to clients in the room";

  // Emit the "api-triggered" event to the specified room in the general namespace
  controllerNamespace.to(dataid).emit("api-triggered", {
    doorNumber,
    response: responseMessage,
  });

  res.send("Event emitted successfully");
});

app.get("/opendoor/:dataid/:doorNumber", (req, res) => {
  const dataid = req.params.dataid;
  const doorNumber = req.params.doorNumber;

  // Include a response in the "opendoor" event
  const responseMessage = "API trigger message sent to clients in the room";

  // Emit the "opendoor" event to the controller namespace
  controllerNamespace.to(dataid).emit("opendoor", {
    doorNumber,
    response: responseMessage,
  });

  // Listen for the client-response event and include it in res.send
  const responseListener = (clientResponse) => {
    res.send({
      apiResponse: "API request received",
      clientResponse,
    });

    // Remove the listener after the response is received
    controllerNamespace.to(dataid).off("client-response", responseListener);
  };

  // Attach the listener to the room
  controllerNamespace.to(dataid).on("client-response", responseListener);
});

const PORT = process.env.PORT || 7777;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
