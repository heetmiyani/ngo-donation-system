export function generateReceiptHTML(donation, donor) {
    const date = new Date(donation.donation_date).toLocaleDateString("en-IN");
  
    return `
    <html>
    <head>
      <style>
        body {
          font-family: Arial;
          padding: 20px;
          color: #333;
        }
        .receipt {
          border: 2px solid #10b981;
          padding: 20px;
          border-radius: 10px;
        }
        .title {
          text-align: center;
          color: #10b981;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .row {
          margin: 10px 0;
        }
        .amount {
          font-size: 28px;
          color: #10b981;
          text-align: center;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="title">Donation Receipt</div>
  
        <div class="row"><strong>Receipt ID:</strong> ${donation.receipt_id}</div>
        <div class="row"><strong>Name:</strong> ${donor.name}</div>
        <div class="row"><strong>Email:</strong> ${donor.email}</div>
        <div class="row"><strong>Date:</strong> ${date}</div>
        <div class="row"><strong>Category:</strong> ${donation.category}</div>
  
        <div class="amount">₹${donation.amount}</div>
  
        <p style="text-align:center;">Thank you for your support ❤️</p>
      </div>
    </body>
    </html>
    `;
  }