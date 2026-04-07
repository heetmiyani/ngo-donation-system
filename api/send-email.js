import nodemailer from "nodemailer";
import pdf from "html-pdf-node";
import { generateReceiptHTML } from "../utils/receiptTemplate";

export default async function handler(req, res) {
  try {
    const { email, name, amount, category, receiptId, receiptLink } = req.body;

    // ✅ Validation
    if (!email || !name || !amount || !receiptId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Email transporter (DO NOT REMOVE)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Prepare data
    const donation = {
      receipt_id: receiptId,
      donation_date: new Date(),
      amount,
      category,
    };

    const donor = {
      name,
      email,
    };

    // ✅ Generate HTML (same design)
    const html = generateReceiptHTML(donation, donor);

    // ✅ Convert HTML → PDF
    const file = { content: html };
    const options = {
      format: "A4",
      printBackground: true,
    };

    const pdfBuffer = await pdf.generatePdf(file, options);

    // ✅ Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Donation Receipt - ${receiptId}`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>🙏 Thank You ${name}</h2>
          <p>Your donation has been successfully received.</p>

          <table style="margin-top:10px;">
            <tr><td><strong>Amount:</strong></td><td>₹${amount}</td></tr>
            <tr><td><strong>Category:</strong></td><td>${category}</td></tr>
            <tr><td><strong>Receipt ID:</strong></td><td>${receiptId}</td></tr>
          </table>

          <br/>

          <a href="${receiptLink}" 
             style="padding: 10px 15px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
             Download Receipt
          </a>

          <p style="margin-top:20px;">We truly appreciate your support ❤️</p>
        </div>
      `,
      attachments: [
        {
          filename: `receipt-${receiptId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("EMAIL ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
}