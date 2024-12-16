import { getDbStatus } from "../Database/db.js";

export const checkHealth = async (req, res) => {
  try {
    const dbStatus = getDbStatus();

    const healthStatus = {
      status: "OK",
      timeStamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus.isConnected ? "healthy" : "unhealthy",
          details: {
            ...dbStatus,
            readyState: getReadyStateText(dbStatus.readyState),
          },
        },
        server: {
          status: "healthy",
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
      },
    };

    const httpStatus =
      healthStatus.services.database.status === "healthy" ? 200 : 503;

    res.status(httpStatus).json(healthStatus);
  } catch (error) {
    console.log("Helath check failed", error);
    res.status(500).json({
      status: "ERROR",
      timeStamp: new Date().toISOString(),
      error: error.message,
    });
  }
};


// utility method
function getReadyStateText(state) {
  switch (state) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 4:
      return "disconnecting";

    default:
      return "unknown";
  }
}
