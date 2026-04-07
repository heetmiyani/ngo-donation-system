import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { email, name, amount, category, receiptId, receiptLink } = await req.json();

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
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

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}