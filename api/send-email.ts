import twilio from 'twilio';

export async function POST(req: Request) {
  try {
    const { phone, name, amount, category, receiptLink } = await req.json();

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phone}`,
      body: `🙏 Thank you ${name}

Amount: ₹${amount}
Category: ${category}

Receipt:
${receiptLink}`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}