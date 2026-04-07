import pdf from "html-pdf-node";
import { generateReceiptHTML } from "./receiptGenerator";

export async function generateReceiptPDF(donation, donor) {
  // ✅ Use SAME HTML as frontend
  const html = generateReceiptHTML(donation, donor);

  const file = { content: html };

  const options = {
    format: "A4",
    printBackground: true, // 🔥 IMPORTANT (for CSS colors)
  };

  const pdfBuffer = await pdf.generatePdf(file, options);

  return pdfBuffer;
}