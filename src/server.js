import http from "http";
import { fileURLToPath } from "url";

import app from "./app.js";
import config from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDatabase();
    server.listen(config.port, () => {
      console.log(
        `API server listening on port ${config.port} in ${config.nodeEnv} mode`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Closing server gracefully.`);
  server.close(() => {
    console.log("HTTP server closed.");
    disconnectDatabase()
      .catch((err) => console.error("Error during Mongo disconnect:", err))
      .finally(() => process.exit(0));
  });

  setTimeout(() => {
    console.warn("Forcing shutdown after 5s timeout.");
    process.exit(1);
  }, 5000).unref();
};

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal));
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  gracefulShutdown("unhandledRejection");
});

const __filename = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] === __filename;

if (isDirectRun) {
  startServer();
}

export { server, startServer };
