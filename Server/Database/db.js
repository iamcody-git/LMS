import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 sec

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;

    //configure mongooose setting
    mongoose.set("strictQuery", true);

    mongoose.connection.on("connected", () => {
      console.log("MONGO CONNECTED SUCCESSFULY");
      this.isConnected = true;
    });

    mongoose.connection.on("error", () => {
      console.log("MONGODB CONNECTION ERROR");
      this.isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MONGO DISCONNECTED");
      this.handleDisconnection();
    });
    process.on("SIGTERM", this.handleAppTermination.bind(this));
  }

  async connect() {
    try {
      if (!process.env.MONGO_URL) {
        throw new Error("Mongo db url is not define in env variable");
      }

      const connectionOption = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMs: 5000,
        socketTimeoutMs: 45000,
        family: 4,
      };

      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      await mongoose.connect(process.env.MONGO_URL, connectionOption);
      this.retryCount = 0;
    } catch (error) {
      console.log(error.message);
      await this.handleConnectionError();
    }
  }

  async handleConnectionError() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `retrying connection..Attemp ${this.retryCount} of ${MAX_RETRIES}`
      );
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve;
        }, RETRY_INTERVAL)
      );
      return this.connect();
    }
  }

  async handleDisconnection() {
    if (!this.isConnected) {
      console.log("Attempting to reconnected to mongodb");
      this.connect();
    }
  }

  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination ");
      process.exit(0);
    } catch (error) {
      console.log("Error during database disconnection", error);
      process.exit(1);
    }
  }
  
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

// create a singleton instance
const dbConnection = new DatabaseConnection();

export default dbConnection.connect.bind(dbConnection);
export const getDbStatus = dbConnection.getConnectionStatus.bind(dbConnection);
