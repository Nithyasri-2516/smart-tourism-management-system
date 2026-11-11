
import dns from "node:dns";

// Use Google and Cloudflare DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import routes from "./routes/routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CLIENT_URL?.split(",") || "http://localhost:5173"
}));

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300
}));

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", service: "smart-tourism-api" })
);

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () =>
      console.log(`API listening on ${port}`)
    );
  })
  .catch(err => {
    console.error("Startup failed:", err.message);
    process.exit(1);
  });
