import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, amount, receiptId, receiptLink } = req.body;

    const resend = new Resend(process.env.RESEND_API_KEY);

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Donation Receipt',
      html: `
        <h2>Thank you ${name} 🙏</h2>
        <p>Amount: ₹${amount}</p>
        <p>Receipt ID: ${receiptId}</p>
        <a href="${receiptLink}">View Receipt</a>
      `,
    });

    console.log("EMAIL SENT:", response);

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}