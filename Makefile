SHELL := /bin/bash
export STORAGE_PATH ?= ./storage

.PHONY: up down logs build up-db down-db seed test test-backend migrate help clean

# ── Full stack ─────────────────────────────────────────────────

up:
	docker compose up --build -d
	@echo "Waiting for services to be healthy..."
	@sleep 5
	@echo "$(shell docker compose ps --format table)"

down:
	docker compose down --volumes --remove-orphans

restart: down up

logs:
	docker compose logs -f --tail=100

build:
	docker compose build --no-cache

# ── DB helpers ─────────────────────────────────────────────────

up-db:
	docker compose up -d postgres qdrant ollama

down-db:
	docker compose stop postgres qdrant ollama

migrate:
	@echo "Running Alembic migrations..."
	docker compose exec backend alembic upgrade head
	@echo "Migrations complete."

up-and-migrate: up migrate

# ── Development ────────────────────────────────────────────────

seed:
	@echo "Seeding demo data..."
	docker compose exec backend python -m casevault seed demo

test: test-backend

test-backend:
	@echo "Running backend tests..."
	docker compose exec backend python -m pytest src/casevault/tests/ -v --tb=short

test-quick:
	@echo "Running backend tests (quick mode)..."
	docker compose exec backend python -m pytest src/casevault/tests/ -v --tb=short -x

# ── Utils ──────────────────────────────────────────────────────

clean:
	docker compose down --volumes --remove-orphans
	rm -rf ${STORAGE_PATH} .venv __pycache__

help:
	@echo "Available targets:"
	@echo "  up               Build and start the full stack"
	@echo "  down             Stop and remove all containers + volumes"
	@echo "  restart          Full restart (down + up)"
	@echo "  logs             Follow all container logs"
	@echo "  build            Rebuild all images from scratch"
	@echo "  up-db            Start only Postgres, Qdrant, Ollama"
	@echo "  down-db          Stop infrastructure containers"
	@echo "  migrate          Run Alembic migrations"
	@echo "  up-and-migrate   Start stack + run migrations"
	@echo "  seed             Seed demo data"
	@echo "  test             Run all tests"
	@echo "  test-backend     Run backend test suite"
	@echo "  test-quick       Run quick test (fail on first error)"
	@echo "  clean            Remove containers + volumes + cache"
