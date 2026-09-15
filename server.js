require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTransporter(gmailUser, gmailPassword) {
  const user = gmailUser || process.env.GMAIL_USER;
  const pass = gmailPassword || process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      'Gmail address and App Password are required, either in the form or via GMAIL_USER/GMAIL_APP_PASSWORD in .env.'
    );
  }
  return {
    user,
    transporter: nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass },
    }),
  };
}

app.post('/send', async (req, res) => {
  const to = (req.body.to || '').trim();
  const subject = (req.body.subject || '').trim();
  const message = (req.body.message || '').trim();
  const gmailUser = (req.body.gmailUser || '').trim();
  const gmailPassword = req.body.gmailPassword || '';

  if (!to || !subject || !message) {
    return res.status(400).json({ error: 'to, subject, and message are all required.' });
  }

  try {
    const { user, transporter } = getTransporter(gmailUser, gmailPassword);
    const info = await transporter.sendMail({
      from: user,
      to,
      subject,
      text: message,
      html: `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    });
    res.json({ messageId: info.messageId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Web app listening on http://localhost:${PORT}`);
});
