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
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // upgrades to TLS via STARTTLS
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: GMAIL_USER,
    to: MAIL_TO,
    subject: 'Hello from the Gmail SMTP sample app',
    text: 'This is a plain-text test email sent via Google SMTP and Nodemailer.',
    html: '<p>This is a <b>test email</b> sent via Google SMTP and Nodemailer.</p>',
  });

  console.log('Message sent:', info.messageId);
}

main().catch((err) => {
  console.error('Failed to send email:', err.message);
  process.exit(1);
});
