import nodemailer from "nodemailer";
import { generateReceiptPDF } from "../utils/generateReceiptPDF";

export default async function handler(req, res) {
  try {
    const { name, email, amount } = req.body;

    // 1. Generate PDF
    const pdfBuffer = await generateReceiptPDF({
      name,
      email,
      amount,
    });

    // 2. Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // 3. Send email with attachment
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Donation Receipt",
      text: `Hi ${name},\n\nThank you for your donation of ₹${amount}. Please find your receipt attached.\n\nRegards,\nTeam`,
      attachments: [
        {
          filename: "receipt.pdf",
          content: pdfBuffer,
        },
      ],
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}