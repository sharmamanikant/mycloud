import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mycloud";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

