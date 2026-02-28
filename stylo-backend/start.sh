#!/bin/sh
# Startup diagnostic — tests Python can import all modules BEFORE launching uvicorn.
# If there is a startup crash, this will print the exact error to Railway logs.
echo "=== STYLO Backend Startup ==="
echo "Python version: $(python --version)"
echo "Installed packages:"
pip list 2>&1 | grep -E 'fastapi|uvicorn|serpapi|google|dotenv|sqlalchemy|motor'

echo ""
echo "=== Testing imports ==="
python -c "
import os
print('DATABASE_URL set:', bool(os.environ.get('DATABASE_URL')))
print('SERPAPI_KEY set:', bool(os.environ.get('SERPAPI_KEY')))
print('GEMINI_API_KEY set:', bool(os.environ.get('GEMINI_API_KEY')))
try:
    import main
    print('All imports successful!')
except Exception as e:
    import traceback
    print('IMPORT ERROR:', e)
    traceback.print_exc()
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "STARTUP FAILED — check logs above"
    exit 1
fi

echo ""
echo "=== Starting uvicorn ==="
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
