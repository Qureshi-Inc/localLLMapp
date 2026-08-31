FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

COPY casevault/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /var/lib/casevault/storage

COPY . .

# casevault package lives at /app/casevault/
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "casevault.app:app", "--host", "0.0.0.0", "--port", "8000"]
