import pdf from "html-pdf-node";

export async function generateReceiptPDF(data) {
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

  const file = { content: html };
  const options = { format: "A4" };

  const pdfBuffer = await pdf.generatePdf(file, options);
  return pdfBuffer;
}