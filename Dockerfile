FROM python:3.11-slim

WORKDIR /app

# Set unbuffered output for real-time logging in Render console
ENV PYTHONUNBUFFERED=1
ENV PORT=10000

# Copy all application assets and precomputed catalog data
COPY . /app

EXPOSE 10000

# Run the standard library Python server
CMD ["python3", "server.py"]
