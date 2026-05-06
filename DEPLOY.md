# FarmMoo — Deployment Guide

## Architecture

```
Browser → nginx (:80/443)
              ├─ GET /         → React SPA (static files)
              ├─ /api/*        → Django + Gunicorn (:8000)
              ├─ /admin/*      → Django Admin
              ├─ /static/*     → WhiteNoise (Django)
              └─ /media/*      → Local volume  OR  Amazon S3
```

---

## Local development (no Docker required)

```bash
# 1. Clone and set up Python env
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS/Linux

pip install -r requirements.txt

# 2. Create local config
copy .env.example .env          # Windows
cp .env.example .env            # macOS/Linux
# Edit .env — defaults work as-is for SQLite

# 3. Run migrations and start Django
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# 4. Start frontend dev server
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Option A — Docker Compose (full stack)

### First-time setup

```bash
# 1. Create production env file
cp .env.example .env.prod
# Edit .env.prod — set DEBUG=False, strong SECRET_KEY, PostgreSQL creds, S3 vars

# 2. Build and start
docker compose -f docker-compose.prod.yml up -d --build

# 3. Apply migrations (first deploy only)
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# 4. Create admin user
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### Updates

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Useful commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f nginx

# Django shell
docker compose -f docker-compose.prod.yml exec backend python manage.py shell

# Restart a single service
docker compose -f docker-compose.prod.yml restart backend
```

---

## Option B — VPS / bare metal (no Docker)

### Prerequisites

```bash
sudo apt update && sudo apt install -y python3.10 python3.10-venv \
    libpq-dev gcc nginx certbot python3-certbot-nginx postgresql postgresql-client
```

### PostgreSQL setup

```bash
sudo -u postgres psql <<EOF
CREATE DATABASE farmmoo;
CREATE USER farmmoo WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE farmmoo TO farmmoo;
ALTER DATABASE farmmoo OWNER TO farmmoo;
EOF
```

### Application setup

```bash
git clone <repo-url> /srv/farmmoo
cd /srv/farmmoo
python3.10 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env.prod
# Fill in .env.prod with production values

# Set env file for this session
export $(cat .env.prod | xargs)

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### Gunicorn systemd service

```ini
# /etc/systemd/system/farmmoo.service
[Unit]
Description=FarmMoo Django API
After=network.target postgresql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/srv/farmmoo
EnvironmentFile=/srv/farmmoo/.env.prod
ExecStart=/srv/farmmoo/.venv/bin/gunicorn \
    FarmMoo.wsgi:application \
    --bind unix:/run/farmmoo.sock \
    --workers 3 \
    --timeout 120 \
    --access-logfile /var/log/farmmoo/access.log \
    --error-logfile /var/log/farmmoo/error.log
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo mkdir -p /var/log/farmmoo
sudo chown www-data /var/log/farmmoo
sudo systemctl daemon-reload
sudo systemctl enable --now farmmoo
```

### nginx site config

```nginx
# /etc/nginx/sites-available/farmmoo
server {
    listen 80;
    server_name farmmoo.com www.farmmoo.com;

    location / {
        root /srv/farmmoo/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://unix:/run/farmmoo.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin/  { proxy_pass http://unix:/run/farmmoo.sock; include proxy_params; }
    location /static/ { proxy_pass http://unix:/run/farmmoo.sock; expires 1y; }
    location /media/  { alias /srv/farmmoo/media/; }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/farmmoo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# TLS via Let's Encrypt
sudo certbot --nginx -d farmmoo.com -d www.farmmoo.com
```

---

## Switching to PostgreSQL

1. Update `.env` (dev) or `.env.prod` (prod):
   ```env
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=farmmoo
   DB_USER=farmmoo
   DB_PASSWORD=your-strong-password
   DB_HOST=localhost        # or db (Docker) or managed host
   DB_PORT=5432
   DB_SSLMODE=require       # for managed cloud DBs
   ```

2. Run migrations: `python manage.py migrate`

3. (Optional) Migrate data from SQLite using `django-dbbackup` or `pg_restore`.

---

## Enabling S3 media storage

1. Create an S3 bucket with **Block Public Access disabled** for the `media/` prefix, or configure a bucket policy granting public `s3:GetObject`.

2. Create an IAM user with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on the bucket.

3. Set env vars:
   ```env
   USE_S3=True
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_STORAGE_BUCKET_NAME=farmmoo-media
   AWS_S3_REGION_NAME=ap-southeast-1
   ```

4. Restart Django. New uploads go to S3; existing local files are NOT migrated automatically.
   Use `aws s3 sync media/ s3://farmmoo-media/media/` to migrate existing files.

---

## TLS / HTTPS (Docker Compose)

```bash
# 1. Install Certbot (host)
sudo apt install certbot

# 2. Temporarily expose port 80 for the ACME challenge, then:
sudo certbot certonly --standalone -d farmmoo.com

# 3. Copy certs to the nginx volume:
sudo cp /etc/letsencrypt/live/farmmoo.com/fullchain.pem nginx/certs/
sudo cp /etc/letsencrypt/live/farmmoo.com/privkey.pem  nginx/certs/

# 4. Uncomment the HTTPS server block in nginx/default.conf, then:
docker compose -f docker-compose.prod.yml restart nginx
```

---

## Backup recommendations

### Database

```bash
# PostgreSQL — daily automated dump (add to cron)
pg_dump -U farmmoo farmmoo | gzip > /backups/farmmoo-$(date +%F).sql.gz

# Retain 30 days:
find /backups -name "farmmoo-*.sql.gz" -mtime +30 -delete

# Docker variant:
docker compose -f docker-compose.prod.yml exec db \
    pg_dump -U farmmoo farmmoo | gzip > /backups/farmmoo-$(date +%F).sql.gz
```

### Media files (when USE_S3=False)

```bash
# Sync to S3 as off-site backup even if not using S3 as primary storage:
aws s3 sync /srv/farmmoo/media/ s3://farmmoo-backups/media/
```

### Restore

```bash
gunzip -c /backups/farmmoo-2026-05-06.sql.gz | psql -U farmmoo farmmoo
```

---

## Security checklist

| # | Check | Command / action |
|---|-------|-----------------|
| 1 | Strong `SECRET_KEY` | `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| 2 | `DEBUG=False` in production | Set in `.env.prod` |
| 3 | `ALLOWED_HOSTS` locked to domain | e.g. `farmmoo.com,www.farmmoo.com` |
| 4 | HTTPS enforced | Certbot + `SECURE_SSL_REDIRECT=True` |
| 5 | DB not exposed to internet | No `ports:` on `db` in prod compose |
| 6 | S3 bucket policy scoped | Least-privilege IAM policy |
| 7 | Daily DB backups | Cron + retention policy |
| 8 | Dependency scanning | `pip-audit -r requirements.txt` |
| 9 | CORS restricted | Only your frontend domain(s) in `CORS_ALLOWED_ORIGINS` |
| 10 | Admin URL obscured (optional) | Change `/admin/` to a non-obvious path |

---

## Frontend production build (standalone)

```bash
cd frontend
cp .env.example .env.production
# Edit VITE_API_URL to match your backend domain
npm run build
# Output: frontend/dist/  — deploy to any static host (S3, Vercel, Netlify, nginx)
```
