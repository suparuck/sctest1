# Gmail SMTP Sample App

A minimal Node.js sample that sends email using Google's SMTP server via [Nodemailer](https://nodemailer.com/). Includes a small web form to compose and send an email, plus a one-shot CLI script.

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

   | Variable             | Description                                             |
   | --------------------- | -------------------------------------------------------- |
   | `GMAIL_USER`          | The Gmail address sending the email                      |
   | `GMAIL_APP_PASSWORD`  | The 16-character App Password (no spaces)                |
   | `MAIL_TO`             | Recipient used only by the CLI script (`npm run send`)   |

## Run the web app

```bash
npm start
```

Open http://localhost:3000, fill in the recipient, subject, and message, and click Send. The form posts to `POST /send`, which sends the email via Gmail SMTP and reports success/failure back in the page.

## Run the CLI script

```bash
npm run send
```

Sends a single hardcoded test email to `MAIL_TO` and prints the sent message's ID to the console.

## Docker

Build locally:

```bash
docker compose up --build
```

Exposes the web app on http://localhost:3000 (reads credentials from `.env`).

### Pull the prebuilt image instead of building

Every push to `claude/youthful-curie-5cjays` builds and publishes an image to
GitHub Container Registry via `.github/workflows/docker-image.yml`. Once a
build has run, pull and run it directly instead of building from source:

```bash
docker pull ghcr.io/suparuck/sctest1:latest
docker run --rm -p 3000:3000 --env-file .env ghcr.io/suparuck/sctest1:latest
```

The GHCR package is private by default (same visibility as the repo). If
`docker pull` fails with a permission error, either make the package public
under the repo's Packages settings on GitHub, or authenticate first:

```bash
echo <a GitHub PAT with read:packages> | docker login ghcr.io -u <your-github-username> --password-stdin
```

## Notes

- SMTP settings used: host `smtp.gmail.com`, port `587`, STARTTLS.
- Never commit your `.env` file or real App Password — `.env` is already git-ignored.
