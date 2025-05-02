FROM python:3.11-slim

# Allow statements and log messages to immediately appear in the logs
ENV PYTHONUNBUFFERED True

# Copy local code to the container image
WORKDIR /app
COPY requirements.txt .
COPY backend/src ./src

# Install production dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run the web service on container startup using gunicorn
CMD exec gunicorn --bind :$PORT --workers 4 --worker-class uvicorn.workers.UvicornWorker src.api:app 