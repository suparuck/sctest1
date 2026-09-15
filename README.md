# Gmail SMTP Sample App

A minimal Node.js sample that sends an email using Google's SMTP server via [Nodemailer](https://nodemailer.com/).

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Enable 2-Step Verification on the sending Gmail account, then create an
   [App Password](https://myaccount.google.com/apppasswords). Gmail no longer
   accepts your regular account password for SMTP.

3. Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

   | Variable            | Description                                  |
   | ------------------- | --------------------------------------------- |
   | `GMAIL_USER`        | The Gmail address sending the email           |
   | `GMAIL_APP_PASSWORD`| The 16-character App Password (no spaces)     |
   | `MAIL_TO`           | The recipient's email address                 |

## Run

```bash
npm start
```

On success you'll see the sent message's ID printed to the console.

## Notes

- SMTP settings used: host `smtp.gmail.com`, port `587`, STARTTLS.
- Never commit your `.env` file or real App Password — `.env` is already git-ignored.
