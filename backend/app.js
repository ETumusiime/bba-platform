// backend/app.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => res.json({ message: "BBA backend running (app.js placeholder)" }));

export default app;
