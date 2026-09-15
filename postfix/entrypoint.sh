#!/bin/sh
set -e

# Send-only relay: no local mailboxes, no incoming mail for local users,
# delivers straight to each recipient's MX (no smarthost).
postconf -e "myhostname = ${MYHOSTNAME:-mail.localdomain}"
postconf -e "mydestination ="
postconf -e "relayhost ="
postconf -e "inet_interfaces = all"
postconf -e "inet_protocols = ipv4"

# Only accept mail from inside the Docker network — never expose this
# container's port 25 to the host/internet, or it becomes an open relay.
postconf -e "mynetworks = ${MYNETWORKS:-172.16.0.0/12 192.168.0.0/16 10.0.0.0/8}"
postconf -e "smtpd_relay_restrictions = permit_mynetworks, reject_unauth_destination"

# Log to stdout instead of syslog, so `docker compose logs postfix` actually
# shows delivery attempts, deferrals, and bounces.
postconf -e "maillog_file = /dev/stdout"

# This relay is never exposed outside the Docker network, so there's no
# real TLS boundary to protect on the incoming (client-facing) side. Debian's
# postfix package auto-enables opportunistic STARTTLS with a self-signed
# cert by default, which Nodemailer then aborts on (it rejects self-signed
# certs), producing "lost connection after STARTTLS". Disabling it avoids
# that failure entirely for this internal-only use case.
postconf -e "smtpd_tls_security_level = none"

exec postfix start-fg
