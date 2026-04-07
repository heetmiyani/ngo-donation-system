import { Donor, Donation } from '../types/database';

export function generateReceiptHTML(donation: Donation, donor: Donor): string {
  const date = new Date(donation.donation_date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Donation Receipt - ${donation.receipt_id}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    .receipt-container {
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 40px;
      background: white;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #10b981;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #10b981;
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    .header p {
      margin: 5px 0;
      color: #666;
    }
    .receipt-id {
      background: #f0fdf4;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
      font-size: 18px;
      font-weight: bold;
      color: #10b981;
    }
    .details-section {
      margin: 25px 0;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .details-label {
      font-weight: 600;
      color: #666;
    }
    .details-value {
      color: #111;
      font-weight: 500;
    }
    .amount-section {
      background: #f9fafb;
      border: 2px dashed #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    }
    .amount-label {
      color: #666;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .amount-value {
      font-size: 36px;
      font-weight: bold;
      color: #10b981;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #666;
      font-size: 14px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
    }
    .thank-you {
      font-size: 24px;
      color: #10b981;
      font-weight: bold;
      margin: 30px 0 10px 0;
    }
    .print-button {
      background: #10b981;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin: 20px auto;
      display: block;
    }
    .print-button:hover {
      background: #059669;
    }
  </style>
</head>
<body>
  <button onclick="window.print()" class="print-button no-print">Print Receipt</button>

  <div class="receipt-container">
    <div class="header">
      <h1>DONATION RECEIPT</h1>
      <p>Thank you for your generous contribution</p>
    </div>

    <div class="receipt-id">
      Receipt ID: ${donation.receipt_id}
    </div>

    <div class="details-section">
      <div class="details-row">
        <span class="details-label">Donor Name:</span>
        <span class="details-value">${donor.name}</span>
      </div>
      ${donor.phone ? `
      <div class="details-row">
        <span class="details-label">Phone:</span>
        <span class="details-value">${donor.phone}</span>
      </div>
      ` : ''}
      ${donor.email ? `
      <div class="details-row">
        <span class="details-label">Email:</span>
        <span class="details-value">${donor.email}</span>
      </div>
      ` : ''}
      <div class="details-row">
        <span class="details-label">Date:</span>
        <span class="details-value">${date}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Category:</span>
        <span class="details-value">${donation.category}</span>
      </div>
      ${donation.notes ? `
      <div class="details-row">
        <span class="details-label">Notes:</span>
        <span class="details-value">${donation.notes}</span>
      </div>
      ` : ''}
    </div>

    <div class="amount-section">
      <div class="amount-label">Total Amount Donated</div>
      <div class="amount-value">₹${donation.amount.toLocaleString('en-IN')}</div>
    </div>

    <div class="thank-you">Thank You for Your Support!</div>
    <p style="text-align: center; color: #666;">Your contribution makes a difference in our community.</p>

    <div class="footer">
      <p>This is a computer-generated receipt and does not require a signature.</p>
      <p>For any queries, please contact us at support@ngo.org</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function downloadReceipt(donation: Donation, donor: Donor): void {
  const html = generateReceiptHTML(donation, donor);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-${donation.receipt_id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printReceipt(donation: Donation, donor: Donor): void {
  const html = generateReceiptHTML(donation, donor);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
