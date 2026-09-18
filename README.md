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
   | `GMAIL_USER`          | The sender address                                       |
   | `GMAIL_APP_PASSWORD`  | The sender's SMTP password (Gmail App Password if using Gmail) |
   | `MAIL_TO`             | Recipient used only by the CLI script (`npm run send`)   |
   | `SMTP_HOST`           | Optional. SMTP server host. Defaults to `smtp.gmail.com` |
   | `SMTP_PORT`           | Optional. SMTP server port. Defaults to `587`            |
   | `SMTP_SECURE`         | Optional. `true` for implicit TLS (e.g. port 465), `false` for STARTTLS. Defaults to `false` |

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
This also starts a local Mailpit SMTP test server (see below) — the app
doesn't use it unless `.env` points `SMTP_HOST` at it, but `docker compose up`
starts it regardless.

### Test without a real Gmail account (Mailpit)

`docker-compose.yml` includes [Mailpit](https://github.com/axllent/mailpit),
a local SMTP server that catches every email sent to it instead of actually
delivering it — useful for trying out the app without needing real Gmail
credentials or hitting account/2FA issues.

To use it, set these in `.env` (any non-empty `GMAIL_USER`/`GMAIL_APP_PASSWORD`
work, since Mailpit doesn't check credentials):

```
GMAIL_USER=test@example.com
GMAIL_APP_PASSWORD=test
SMTP_HOST=smtp
SMTP_PORT=1025
SMTP_SECURE=false
```

Then run `docker compose up --build`, send an email through the form at
http://localhost:3000, and view it at **http://localhost:8025** — Mailpit's
web UI shows every message it caught.

### Pull the prebuilt image instead of building

Every push to `main` builds and publishes an image to GitHub Container
Registry via `.github/workflows/docker-image.yml`. Once a build has run,
pull and run it directly instead of building from source:

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

## Using a different SMTP provider

By default the app talks to Gmail (`smtp.gmail.com:587` with STARTTLS). To use
a different provider instead, set `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE`
in `.env` (or the container's environment) and put that provider's own
username/password in `GMAIL_USER` / `GMAIL_APP_PASSWORD`. For example, for a
provider using implicit TLS on port 465:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
```

## Notes

- Default SMTP settings: host `smtp.gmail.com`, port `587`, STARTTLS.
- Never commit your `.env` file or real App Password — `.env` is already git-ignored.
