# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
# Install only production deps (devDependencies are still needed for the build)
RUN npm ci --ignore-scripts

COPY frontend/ ./
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ── Stage 2: Python runtime ───────────────────────────────────────────────────
FROM python:3.10-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=FarmMoo.settings

WORKDIR /app

# Build tools needed for psycopg2-binary and Pillow
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy project source
COPY . .

# Remove dev / local artefacts from the image
RUN rm -f .env && rm -rf frontend/node_modules || true

# Copy built frontend static assets into Django's static directory so that
# WhiteNoise / nginx can serve them without a separate frontend container.
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Pre-collect static files (WhiteNoise serves from staticfiles/)
RUN mkdir -p staticfiles \
    && python manage.py collectstatic --noinput

EXPOSE 8000

# 2 workers is a safe default for < 2 GB RAM.  Override with GUNICORN_WORKERS env var.
CMD ["sh", "-c", "gunicorn FarmMoo.wsgi:application \
     --bind 0.0.0.0:8000 \
     --workers ${GUNICORN_WORKERS:-2} \
     --timeout 120 \
     --access-logfile - \
     --error-logfile -"]
