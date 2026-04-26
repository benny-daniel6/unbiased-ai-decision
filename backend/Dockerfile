# Use official Python runtime as a parent image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Command to run on container start
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
