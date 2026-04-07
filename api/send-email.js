import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, name, amount, receiptId, receiptLink } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Donation Receipt",
      html: `
        <h2>Thank you ${name} 🙏</h2>
        <p>Amount: ₹${amount}</p>
        <p>Receipt ID: ${receiptId}</p>
        <a href="${receiptLink}">View Receipt</a>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("EMAIL SENT:", info.response);

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}