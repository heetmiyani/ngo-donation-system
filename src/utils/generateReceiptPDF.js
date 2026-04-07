import puppeteer from "puppeteer";

export async function generateReceiptPDF(data) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = `
    <html>
      <body>
        <h1>Donation Receipt</h1>
        <p>Name: ${data.name}</p>
        <p>Email: ${data.email}</p>
        <p>Amount: ₹${data.amount}</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </body>
    </html>
  `;

  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();
  return pdfBuffer;
}