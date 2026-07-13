# syntax=docker/dockerfile:1

# ---- Stage 1: build do frontend Vue 3 ----
# O vite.config.ts tem outDir = ../src/static/dist, então o build cai
# em /app/src/static/dist e é copiado para o runtime no estágio 2.
FROM node:20-slim AS frontend
WORKDIR /app
COPY frontend/ ./frontend/
RUN cd frontend && npm ci && npm run build

# ---- Stage 2: runtime FastAPI ----
FROM python:3.13-slim AS runtime
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Dependências Python
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Código da aplicação
COPY . .

# Frontend buildado vindo do estágio 1
COPY --from=frontend /app/src/static/dist ./src/static/dist

EXPOSE 8000

# Render injeta a porta em $PORT; localmente cai em 8000
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
