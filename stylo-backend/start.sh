#!/bin/sh
set -e

echo "=== STYLO Backend starting ==="
echo "PORT=${PORT:-7860}"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo YES || echo NO)"
echo "SERPAPI_KEY set: $([ -n "$SERPAPI_KEY" ] && echo YES || echo NO)"

exec python -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-7860}"
