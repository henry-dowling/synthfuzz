FROM python:3.11-slim

# Allow statements and log messages to immediately appear in the logs
ENV PYTHONUNBUFFERED True

# Set Python path to include the src directory
ENV PYTHONPATH=/app/src

# Create and set working directory
WORKDIR /app

# Install dependencies first
# This layer will be cached unless requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
# This layer changes whenever the source code changes
COPY src ./src

# Run the web service on container startup using gunicorn
CMD cd src && exec gunicorn --bind :$PORT --workers 4 --worker-class uvicorn.workers.UvicornWorker api:app 