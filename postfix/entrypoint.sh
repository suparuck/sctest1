#!/bin/sh
set -e

# Send-only relay: no local mailboxes, no incoming mail for local users,
# delivers straight to each recipient's MX (no smarthost).
postconf -e "myhostname = ${MYHOSTNAME:-mail.localdomain}"
postconf -e "mydestination ="
postconf -e "relayhost ="
postconf -e "inet_interfaces = all"
# "all" (not "ipv4") so this works whether the host's network gives the
# container working IPv4 connectivity, IPv6, or both — some VPNs leave only
# one of the two actually functional, and hardcoding ipv4 caused MX lookups
# to fail with "Host not found, try again" even for domains that resolve
# fine (e.g. gmail.com) when only IPv6 routing was actually working.
postconf -e "inet_protocols = all"

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

# Debian's postfix package runs the smtp (outbound delivery) service
# chrooted under /var/spool/postfix by default. That jail doesn't include
# /etc/resolv.conf, so Postfix's own DNS client can't see the nameserver
# config and every MX/A lookup fails with "Host not found, try again" —
# even though the same lookup works fine for any other process in the
# container (confirmed: `dig MX gmail.com` succeeds, Postfix's own lookup
# of the same record does not). Disabling chroot for smtp fixes this.
postconf -P smtp/unix/chroot=n

# Belt-and-suspenders: also mirror resolv.conf into the chroot directory,
# in case any other chrooted service still needs it or the chroot=n
# override above doesn't fully apply on some Postfix versions.
mkdir -p /var/spool/postfix/etc
cp -f /etc/resolv.conf /var/spool/postfix/etc/resolv.conf

exec postfix start-fg
