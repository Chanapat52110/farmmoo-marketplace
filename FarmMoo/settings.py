"""
FarmMoo Django settings.

All configuration is driven by environment variables so the same codebase runs
in development (SQLite, DEBUG=True) and production (PostgreSQL, DEBUG=False, S3)
without code changes.  Copy .env.example → .env for local development.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file when present (local dev).  In production env vars come from
# the container / process environment directly.
load_dotenv(BASE_DIR / '.env')


# ── Helpers ────────────────────────────────────────────────────────────────────

def _env(key: str, default: str = '') -> str:
    return os.environ.get(key, default)


def _env_bool(key: str, default: bool = False) -> bool:
    val = os.environ.get(key)
    if val is None:
        return default
    return val.strip().lower() in ('1', 'true', 'yes', 'on')


def _env_list(key: str, default: str = '') -> list[str]:
    raw = os.environ.get(key, default)
    return [v.strip() for v in raw.split(',') if v.strip()]


# ── Core ───────────────────────────────────────────────────────────────────────

SECRET_KEY = _env('SECRET_KEY', 'django-insecure-change-me-in-production')
DEBUG = _env_bool('DEBUG', default=True)
ALLOWED_HOSTS = _env_list('ALLOWED_HOSTS', '127.0.0.1,localhost')

# ── Application ────────────────────────────────────────────────────────────────

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Local apps
    'products',
    'users',
    'orders',
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

# django-storages only needed when S3 is active; avoids hard dependency in dev
USE_S3 = _env_bool('USE_S3', default=False)
if USE_S3:
    INSTALLED_APPS.append('storages')

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # WhiteNoise serves compressed static files efficiently (no separate CDN needed for static)
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'FarmMoo.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'FarmMoo.wsgi.application'

# ── Database ───────────────────────────────────────────────────────────────────
# Default: SQLite (dev).  Set DB_ENGINE=django.db.backends.postgresql + DB_*
# variables to switch to PostgreSQL without touching this file.

_db_engine = _env('DB_ENGINE', 'django.db.backends.sqlite3')
_db_name = _env('DB_NAME', str(BASE_DIR / 'db.sqlite3'))

_db_options: dict = {}
if 'postgresql' in _db_engine and _env('DB_SSLMODE'):
    _db_options = {'sslmode': _env('DB_SSLMODE')}

DATABASES = {
    'default': {
        'ENGINE': _db_engine,
        'NAME': _db_name,
        'USER': _env('DB_USER'),
        'PASSWORD': _env('DB_PASSWORD'),
        'HOST': _env('DB_HOST'),
        'PORT': _env('DB_PORT'),
        # Keep connections alive in production to reduce overhead
        'CONN_MAX_AGE': 0 if DEBUG else int(_env('DB_CONN_MAX_AGE', '60')),
        'OPTIONS': _db_options,
    }
}

# ── Password Validation ────────────────────────────────────────────────────────

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ── Internationalisation ───────────────────────────────────────────────────────

LANGUAGE_CODE = 'th'
TIME_ZONE = 'Asia/Bangkok'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Static Files ───────────────────────────────────────────────────────────────

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
# WhiteNoise: serve compressed + hashed static files from STATIC_ROOT
STORAGES = {
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

# ── Media Files / File Storage ─────────────────────────────────────────────────
# USE_S3=True  → files uploaded to Amazon S3 (or compatible)
# USE_S3=False → files saved to local MEDIA_ROOT (default for dev)

if USE_S3:
    AWS_ACCESS_KEY_ID = _env('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = _env('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = _env('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = _env('AWS_S3_REGION_NAME', 'ap-southeast-1')
    AWS_DEFAULT_ACL = None              # inherit bucket policy (no public-read ACL)
    AWS_S3_FILE_OVERWRITE = False       # preserve originals on name collision
    AWS_QUERYSTRING_AUTH = False        # public media URLs (no signed expiry)
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    _bucket = AWS_STORAGE_BUCKET_NAME
    _region = AWS_S3_REGION_NAME
    _custom_domain = _env('AWS_S3_CUSTOM_DOMAIN', f'{_bucket}.s3.{_region}.amazonaws.com')
    STORAGES['default'] = {'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage'}
    MEDIA_URL = f'https://{_custom_domain}/media/'
    MEDIA_ROOT = ''
else:
    STORAGES['default'] = {'BACKEND': 'django.core.files.storage.FileSystemStorage'}
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'

# ── Django REST Framework ──────────────────────────────────────────────────────

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'EXCEPTION_HANDLER': 'FarmMoo.exception_handler.custom_exception_handler',
}

# ── JWT ────────────────────────────────────────────────────────────────────────

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ── CORS ───────────────────────────────────────────────────────────────────────

# Development: Allow localhost
# Production: Set CORS_ALLOWED_ORIGINS env var with Vercel domain:
#   CORS_ALLOWED_ORIGINS=https://farmmoo.vercel.app
_cors_default = 'http://localhost:5173,http://127.0.0.1:5173'
CORS_ALLOWED_ORIGINS = _env_list('CORS_ALLOWED_ORIGINS', _cors_default)
CORS_ALLOW_CREDENTIALS = True

# ── Security hardening (production only) ──────────────────────────────────────
# These settings are intentionally off in DEBUG mode so local dev isn't affected.

if not DEBUG:
    SECURE_HSTS_SECONDS = 31_536_000        # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = _env_bool('SECURE_SSL_REDIRECT', default=True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
