FROM python:3.11-slim

ENV PYTHONUNBUFFERED=True
ENV PYTHONPATH=/app
ENV PORT=8000

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire source code directly into /app
COPY src/ .  

# Run FastAPI app with uvicorn
CMD uvicorn api:app --host 0.0.0.0 --port $PORT
