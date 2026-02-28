FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for psycopg2 compilation
# as well as libgl1-mesa-glx for OpenCV (headless).
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# Copy the rest of the app code
COPY . .

# Start the FastAPI application via uvicorn
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
