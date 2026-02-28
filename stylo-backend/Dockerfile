FROM python:3.11-slim

WORKDIR /app

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app code
COPY . .

COPY start.sh .
RUN chmod +x start.sh
CMD ["sh", "start.sh"]
