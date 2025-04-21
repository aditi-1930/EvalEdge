import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { processQuery } from "./api.js";

const app = express();
const filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filename);

// 🔥 Serve dashb.html first before static
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dashb.html"));
});

// ✅ Static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "frontend")));

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { question, studentAnswer } = req.body;
  const result = await processQuery(question, studentAnswer || "");
  res.json(result);
});

app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000/");
});
