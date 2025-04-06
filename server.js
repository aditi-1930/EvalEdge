import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { processQuery } from "./api.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

app.post("/chat", async (req, res) => {
  const { question, studentAnswer } = req.body;
  const result = await processQuery(question, studentAnswer || "");
  res.json(result);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000/");
});
