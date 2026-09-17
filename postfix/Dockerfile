FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends postfix ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /entrypoint.sh
# Strip Windows CRLF line endings in case Git checked this out with them
# (e.g. core.autocrlf=true on Windows) — a CRLF shebang line makes the
# container fail with "exec /entrypoint.sh: no such file or directory".
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 25

ENTRYPOINT ["/entrypoint.sh"]
