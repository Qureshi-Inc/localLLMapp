FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        tesseract-ocr \
        tesseract-ocr-eng \
        poppler-utils \
        curl \
        && rm -rf /var/lib/apt/lists/*

# Install worker deps
COPY worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend for shared casevault package (parsing + db + models)
COPY backend/ ./backend/

RUN mkdir -p /var/lib/casevault/storage

# CaseVault worker entrypoint
COPY worker/ingestion_worker.py .

ENV PYTHONPATH=/app/backend/casevault:/app/backend

ENTRYPOINT ["python", "ingestion_worker.py"]
