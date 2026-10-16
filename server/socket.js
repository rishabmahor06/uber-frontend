const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");
const rideModel = require("./models/ride.model");

let io;

function initializeSocket(socketIo) {
  io = socketIo;

  io.on("connection", (socket) => {
    socket.on("join", async (data) => {
      try {
        const { userId, userType } = data || {};
        if (!userId) return;

        if (userType === "user") {
          await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        } else if (userType === "captain") {
          // keep an ongoing ride's status, otherwise go online
          const resumed = await captainModel.updateOne(
            { _id: userId, status: "on_ride" },
            { socketId: socket.id }
          );
          if (!resumed.matchedCount) {
            await captainModel.findByIdAndUpdate(userId, {
              socketId: socket.id,
              status: "available",
            });
          }
        }
      } catch (err) {
        console.error("Error in join event:", err.message);
      }
    });

    socket.on("leave", async (data) => {
      try {
        const { userId, userType } = data || {};
        if (userType === "captain" && userId) {
          await captainModel.updateOne(
            { _id: userId, status: "available" },
            { status: "unavailable" }
          );
        }
      } catch (err) {
        console.error("Error in leave event:", err.message);
      }
    });

    // Captain GPS updates. Optionally relayed live to the rider of a ride.
    socket.on("update-location-captain", async (data) => {
      try {
        const { userId, location, rideId } = data || {};
        const lat = Number(location?.lat);
        const lng = Number(location?.lng);
        if (!userId || !isFinite(lat) || !isFinite(lng)) return;

        await captainModel.findByIdAndUpdate(userId, {
          location: { ltd: lat, lng },
          socketId: socket.id,
        });

        if (rideId) {
          const ride = await rideModel
            .findOne({ _id: rideId, captain: userId })
            .populate("user", "socketId");
          if (ride?.user?.socketId) {
            io.to(ride.user.socketId).emit("captain-location", {
              rideId,
              lat,
              lng,
            });
          }
        }
      } catch (err) {
        console.error("Failed to update captain location:", err.message);
      }
    });

    socket.on("disconnect", async () => {
      try {
        await captainModel.updateOne(
          { socketId: socket.id, status: { $ne: "on_ride" } },
          { status: "unavailable", socketId: null }
        );
        await captainModel.updateOne(
          { socketId: socket.id, status: "on_ride" },
          { socketId: null }
        );
        await userModel.updateOne(
          { socketId: socket.id },
          { socketId: null }
        );
      } catch (err) {
        console.error("Error handling disconnect:", err.message);
      }
    });
  });
}

function sendMessageToSocket(socketId, messageObject) {
  if (!socketId) return;
  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("socket io not initialize.");
  }
}

module.exports = { initializeSocket, sendMessageToSocket };
