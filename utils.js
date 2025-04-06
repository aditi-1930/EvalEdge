import fs from "fs";

export function loadJSON(filename) {
  try {
    return JSON.parse(fs.readFileSync(filename, "utf8"));
  } catch (error) {
    console.error(`❌ Error loading ${filename}:`, error);
    return {};
  }
}
