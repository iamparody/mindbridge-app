const crypto = require('crypto');

const PACKAGES = {
  starter:  { price_ksh: 50,  credits: 3,  amount_kobo: 5000  },
  standard: { price_ksh: 100, credits: 7,  amount_kobo: 10000 },
  plus:     { price_ksh: 200, credits: 15, amount_kobo: 20000 },
  support:  { price_ksh: 500, credits: 40, amount_kobo: 50000 },
};

async function initializeTransaction(email, amountKobo, metadata) {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, amount: amountKobo, metadata }),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || 'Paystack initialization failed');
  return data.data; // { authorization_url, access_code, reference }
}

function verifyWebhookSignature(rawBody, signature) {
  if (!signature) return false;
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
}

module.exports = { PACKAGES, initializeTransaction, verifyWebhookSignature };
