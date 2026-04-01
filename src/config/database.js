import mongoose from "mongoose";

import config from "./env.js";

mongoose.set("strictQuery", true);

const connectionOptions = {
  autoIndex: !config.isProduction,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};

const connectDatabase = async () => {
  if (!config.mongoUri) {
    throw new Error("Missing MongoDB connection string (MONGO_URI).");
  }

  try {
    await mongoose.connect(config.mongoUri, connectionOptions);
    console.log("MongoDB connection established");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

const disconnectDatabase = async () => {
  await mongoose.connection.close();
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

export { connectDatabase, disconnectDatabase };
