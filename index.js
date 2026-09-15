require('dotenv').config();
const nodemailer = require('nodemailer');

async function main() {
  const { GMAIL_USER, GMAIL_APP_PASSWORD, MAIL_TO } = process.env;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !MAIL_TO) {
    console.error(
      'Missing required environment variables. Copy .env.example to .env and fill in GMAIL_USER, GMAIL_APP_PASSWORD, and MAIL_TO.'
    );
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // upgrades to TLS via STARTTLS when false on port 587
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: GMAIL_USER,
    to: MAIL_TO,
    subject: 'Hello from the SMTP sample app',
    text: 'This is a plain-text test email sent via SMTP and Nodemailer.',
    html: '<p>This is a <b>test email</b> sent via SMTP and Nodemailer.</p>',
  });

  console.log('Message sent:', info.messageId);
}

main().catch((err) => {
  console.error('Failed to send email:', err.message);
  process.exit(1);
});
