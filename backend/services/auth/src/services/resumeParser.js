
// // }
// import pdfParse from "pdf-parse/node";
// import mammoth from "mammoth";

// export async function parseResume(file) {
//   if (!file) {
//     throw new Error("No file uploaded");
//   }

//   // PDF
//   if (file.mimetype === "application/pdf") {
//     try {
//       const data = await pdfParse(file.buffer);
//       return data.text;
//     } catch (error) {
//       console.error("PDF parsing error:", error);
//       throw new Error(`Failed to parse PDF: ${error.message}`);
//     }
//   }

//   // DOCX
//   if (
//     file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
//     file.mimetype.includes("word")
//   ) {
//     try {
//       const result = await mammoth.extractRawText({
//         buffer: file.buffer,
//       });
//       return result.value;
//     } catch (error) {
//       console.error("DOCX parsing error:", error);
//       throw new Error(`Failed to parse DOCX: ${error.message}`);
//     }
//   }

//   // Plain text fallback
//   return file.buffer.toString();
// }

// import * as pdf from "pdf-parse/node";
// import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function parseResume(file) {
  if (!file) {
    throw new Error("No file uploaded");
  }

  // PDF
  if (file.mimetype === "application/pdf") {
    try {
      const parser = new PDFParse({ 
        data: file.buffer,
        verbosity: 0
      });
      const result = await parser.getText();
      await parser.destroy();
      return result.text;
    } catch (error) {
      console.error("PDF parsing error:", error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  // DOCX
  if (
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype.includes("word")
  ) {
    try {
      const result = await mammoth.extractRawText({
        buffer: file.buffer,
      });
      return result.value;
    } catch (error) {
      console.error("DOCX parsing error:", error);
      throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
  }

  // Plain text fallback
  return file.buffer.toString();
}
