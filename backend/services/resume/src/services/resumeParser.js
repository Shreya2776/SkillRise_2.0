import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

export async function parseResume(file) {

  if (!file) {
    throw new Error("No file uploaded");
  }

  // PDF
  if (file.mimetype === "application/pdf") {

    const data = await pdf(file.buffer);

    return data.text;
  }

  // DOCX
  if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype.includes("word")
  ) {

    const result = await mammoth.extractRawText({
      buffer: file.buffer
    });

    return result.value;
  }

  return file.buffer.toString();
}