#!/usr/bin/env bash
# PostgreSQL lokal tanpa sudo (binary user-space di ~/.local/share/marketplace-pg).
# Pakai: scripts/local-postgres.sh start|stop|status|restart
set -euo pipefail

PGROOT="$HOME/.local/share/marketplace-pg"
PGDATA="$PGROOT/data"
LOGFILE="$PGROOT/server.log"
PORT="${PGPORT:-5432}"

if [ ! -x "$PGROOT/bin/pg_ctl" ]; then
  echo "Binary PostgreSQL tidak ditemukan di $PGROOT" >&2
  echo "Jalankan: npm run db:bootstrap" >&2
  exit 1
fi

start() {
  if "$PGROOT/bin/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1; then
    echo "PostgreSQL sudah berjalan di port $PORT"
    return 0
  fi
  "$PGROOT/bin/pg_ctl" -D "$PGDATA" -l "$LOGFILE" -o "-p $PORT -h 127.0.0.1" start
}

stop() {
  "$PGROOT/bin/pg_ctl" -D "$PGDATA" stop -m fast
}

status() {
  "$PGROOT/bin/pg_ctl" -D "$PGDATA" status || true
}

case "${1:-status}" in
  start) start ;;
  stop) stop ;;
  restart)
    stop || true
    start
    ;;
  status) status ;;
  *)
    echo "Pakai: $0 start|stop|status|restart" >&2
    exit 1
    ;;
esac