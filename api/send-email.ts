import { Resend } from "resend";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, name, amount, receiptId, receiptLink } = req.body;

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Donation Receipt",
      html: `
        <h2>Thank you ${name} 🙏</h2>
        <p>Amount: ₹${amount}</p>
        <p>Receipt ID: ${receiptId}</p>
        <a href="${receiptLink}">View Receipt</a>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Email Error:", err);
    return res.status(500).json({ error: err.message });
  }
}