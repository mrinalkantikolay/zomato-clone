// ======================
// HANDLE SYNC ERRORS FIRST
// ======================
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥", err);
  process.exit(1);
});

// ======================
// LOAD ENV VARIABLES FIRST
// ======================
require("dotenv").config();

const http = require("http");
const app = require("./app");

const { sequelize } = require("./config/mysql");

// ======================
// DATABASE CONNECTIONS
// ======================
const connectMongoDB = require("./config/mongo");
const { connectMySQL } = require("./config/mysql");

const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || "development";

let server;

const startServer = async () => {
  try {
    // Connect databases
    await connectMongoDB();
    await connectMySQL();

    await sequelize.sync();
    console.log(" MySQL tables synced");

    // Create server
    server = http.createServer(app);

    // Initialize Socket.IO for real-time tracking
    const { initializeSocket } = require("./config/socket");
    initializeSocket(server);
    console.log(" Socket.IO initialized");

    // Start server
    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${NODE_ENV}`);
      console.log(" MongoDB + MySQL connected");
      console.log(" Real-time tracking enabled");
    });

    // ======================
    // HANDLE ASYNC ERRORS
    // ======================
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION 💥", err);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();


// GRACEFUL SHUTDOWN


process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  if (server) {
    server.close(() => {
      console.log("Process terminated");
      process.exit(0);
    });
  }
});