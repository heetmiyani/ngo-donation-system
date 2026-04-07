import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

export default async function handler(req, res) {
  try {
    const { email, name, amount, category, receiptId, receiptLink } = req.body;

    // ✅ Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    // ✅ Generate PDF
    const doc = new PDFDocument();
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfData = Buffer.concat(buffers);

      // ✅ Send Email
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
            content: pdfData,
          },
        ],
      });

      return res.status(200).json({ success: true });
    });

    // ✅ PDF Content
    doc.fontSize(20).text("Donation Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Receipt ID: ${receiptId}`);
    doc.text(`Name: ${name}`);
    doc.text(`Amount: ₹${amount}`);
    doc.text(`Category: ${category}`);
    doc.moveDown();

    doc.text("Thank you for your generous contribution!", {
      align: "center",
    });

    doc.end();

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}