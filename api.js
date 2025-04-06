import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load JSON Helper
function loadJSON(filename) {
  try {
    return JSON.parse(fs.readFileSync(filename, "utf8"));
  } catch (err) {
    console.error(`❌ Error loading ${filename}:`, err);
    return {};
  }
}

function extractMarks(text) {
  const match = text.match(/(\d+)\s*marks?/i);
  return match ? parseInt(match[1]) : 2;
}

function detectCategory(question) {
  const q = question.toLowerCase();
  if (q.includes("fill in") || q.includes("error") || q.includes("transformation"))
    return "Grammar";
  if (q.includes("letter") || q.includes("notice") || q.includes("story"))
    return "Writing";
  if (q.includes("comprehension") || q.includes("passage"))
    return "Reading";
  return "Literature";
}

function detectIntent(text) {
  const lower = text.toLowerCase();
  if (["hi", "hello", "hey", "who are you", "good morning", "how can you help me"].includes(lower))
    return "greeting";
  if (lower.includes("syllabus")) return "syllabus";
  if (lower.startsWith("summary of")) return "summary";
  if (lower.startsWith("ideal")) return "ideal";
  return "evaluate";
}

// 🟡 Main Dispatcher
export async function processQuery(question, studentAnswer = "") {
  const intent = detectIntent(question);
  const category = detectCategory(question);

  if (intent === "greeting") {
    return {
      response: `👋 Hello! I'm your CBSE Class 10 English Assistant. You can ask me to evaluate answers, provide ideal responses, or summarize lessons.`
    };
  }

  if (intent === "syllabus") {
    return {
      response: `📘 **Class 10 English Syllabus** (CBSE):

**Reading:**
- Unseen Passage
- Note Making

**Writing:**
- Formal Letters
- Story Writing
- Analytical Paragraph

**Grammar:**
- Tenses, Modals, Subject-Verb Concord
- Reported Speech
- Determiners

**Literature:**
- *First Flight* & *Footprints Without Feet* (All Chapters & Poems)`
    };
  }

  if (intent === "summary") {
    return generateSummary(question);
  }

  if (intent === "ideal") {
    return getIdealAnswer(question);
  }

  return evaluateAnswer(question, studentAnswer);
}

// ✅ Evaluation
export async function evaluateAnswer(question, studentAnswer) {
  try {
    const idealAnswers = loadJSON("./data/idealanswers.json");
    const markingScheme = loadJSON("./data/markingscheme.json");
    const marks = extractMarks(question);
    const category = detectCategory(question);
    const idealAnswer = idealAnswers[question] || null;
    const markingCriteria = markingScheme.sections?.[category] || null;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
You are an expert CBSE English teacher. Strictly evaluate this student answer.

**Question:** ${question}
**Student Answer:** ${studentAnswer}
**Marks:** ${marks}
${idealAnswer ? `**Ideal Answer:** ${idealAnswer}` : "Refer to NCERT for ideal reference."}
${markingCriteria ? `**Marking Criteria:** ${JSON.stringify(markingCriteria, null, 2)}` : ""}

Provide output in this exact markdown format:

**Evaluation of Student Answer:**

**Strengths:**
- ...

**Weaknesses:**
- ...

**Suggestions for Improvement:**
- ...

**Final Marks:** (out of ${marks})

**Reasoning:**
- ...
    `;

    const result = await model.generateContent(prompt);
    return { evaluation: result.response.text() };
  } catch (error) {
    console.error("❌ Evaluation Error:", error);
    return { evaluation: "Error generating evaluation." };
  }
}

// ✅ Ideal Answer
export async function getIdealAnswer(question) {
  const idealAnswers = loadJSON("./data/idealanswers.json");
  const marks = extractMarks(question);
  if (idealAnswers[question]) {
    return { idealAnswer: `**Ideal Answer (${marks} Marks):**\n\n${idealAnswers[question]}` };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp" });
  const result = await model.generateContent(`
Give an ideal answer (for ${marks} marks) for this Class 10 CBSE question:
**${question}**
Follow NCERT pattern only.`);

  return { idealAnswer: result.response.text() };
}

// ✅ Summary
export async function generateSummary(question) {
  try {
    const lesson = question.replace(/summary of/i, "").trim();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp" });

    const prompt = `
Provide a detailed summary of the Class 10 English ${lesson} lesson/poem.
Output in the following structured format:

- **Chapter Name**
- **Poem or Prose**
- **Title**
- **Writer**
- **Theme**
- **Value Depicted**
- **Summary**
    `;

    const result = await model.generateContent(prompt);
    return { summary: result.response.text() };
  } catch (err) {
    console.error("❌ Summary Error:", err);
    return { summary: "Error generating summary." };
  }
}
