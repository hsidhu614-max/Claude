import "dotenv/config";
import express from "express";
import cors from "cors";
import { translateRouter } from "./translate.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));

app.use("/api/translate", translateRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
