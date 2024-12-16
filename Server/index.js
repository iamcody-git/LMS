import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";
import healthRoute from "./Routes/healthRoutes.js";
import userRoute from "./Routes/userRoutes.js";

dotenv.config();
const app = express();

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running at ${PORT} in ${NODE_ENV}`);

  // Global rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many request from this Ip. Please try again",
  });

  // security middleware
  app.use(helmet());
  app.use(mongoSanitize());
  app.use("/api", limiter);
  app.use(cookieParser());
  app.use(hpp());

  //logging middleware
  if (NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  //Body parser middleware
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  //Global Error Handler
  app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(err.status || 500).json({
      status: "Error",
      message: err.message || "Internal server error",
      ...NODE_ENV(NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  //cors configuration
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "htpp://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      allowedHeaders: [
        "content-Type",
        "Authorization",
        "X-Requested-With",
        "device-remember-token",
        "Access-Control-Allow-Origin",
        "Origin",
        "Accept",
      ],
    })
  );

  //API Routes
  app.use("/health", healthRoute);
  app.use("/api/v1/user", userRoute);

  // handling route error
  app.use((req, res) => {
    res.status(404).json({
      status: "Error",
      message: "Route no found",
    });
  });
});
