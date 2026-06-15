FROM python:3.12-slim

WORKDIR /app

# System deps for DB drivers
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    python3-setuptools \
    libaio-dev \
    libpq-dev \
    unixodbc-dev \
    libssl-dev \
    libffi-dev \
    curl \
    cargo \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
