import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    const { email, name, amount, category, receiptId } = req.body;

    const response = await resend.emails.send({
      from: 'NGO <onboarding@resend.dev>',
      to: email,
      subject: 'Donation Receipt',
      html: `
        <h2>Thank you, ${name} 🙏</h2>
        <p>We received your donation.</p>
        <p><b>Amount:</b> ₹${amount}</p>
        <p><b>Category:</b> ${category}</p>
        <p><b>Receipt ID:</b> ${receiptId}</p>
      `,
    });

    res.status(200).json({ success: true, response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}