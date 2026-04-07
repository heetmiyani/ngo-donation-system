import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

export default async function handler(req, res) {
  try {
    const { email, name, amount, category, receiptId } = req.body;

    if (!email || !name || !amount || !receiptId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Generate Styled PDF (PDFKit - SAFE)
    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // 🎨 HEADER
      doc
        .fontSize(22)
        .fillColor("#10b981")
        .text("DONATION RECEIPT", { align: "center" });

      doc.moveDown();

      // 📄 Receipt Box
      doc
        .rect(40, 100, 500, 250)
        .stroke("#10b981");

      doc.moveDown(2);

      doc.fontSize(12).fillColor("black");

      doc.text(`Receipt ID: ${receiptId}`);
      doc.text(`Name: ${name}`);
      doc.text(`Email: ${email}`);
      doc.text(`Category: ${category}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);

      doc.moveDown();

      // 💰 Amount Highlight
      doc
        .fontSize(20)
        .fillColor("#10b981")
        .text(`₹${amount}`, { align: "center" });

      doc.moveDown();

      doc
        .fontSize(14)
        .fillColor("black")
        .text("Thank you for your support ❤️", {
          align: "center",
        });

      doc.end();
    });

    // ✅ Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Donation Receipt - ${receiptId}`,
      text: `Hi ${name}, your donation receipt is attached.`,
      attachments: [
        {
          filename: `receipt-${receiptId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("FINAL ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
}