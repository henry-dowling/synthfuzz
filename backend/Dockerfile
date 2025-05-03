FROM python:3.11-slim

# Allow statements and log messages to immediately appear in the logs
ENV PYTHONUNBUFFERED True

# Set Python path to include the src directory
ENV PYTHONPATH=/app/src

# Copy local code to the container image
WORKDIR /app
COPY requirements.txt .
COPY src ./src

# Install production dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run the web service on container startup using gunicorn
CMD cd src && exec gunicorn --bind :$PORT --workers 4 --worker-class uvicorn.workers.UvicornWorker api:app 