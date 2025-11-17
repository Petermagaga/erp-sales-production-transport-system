from decouple import config
from pathlib import Path
from datetime import timedelta
import os
import dj_database_url


BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("SECRET_KEY", default="django-insecure-dev-key")

DEBUG = config("DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = [
    "*",
    config("RENDER_EXTERNAL_HOSTNAME", default=""),
]

INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'django_filters',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework.authtoken',
    'corsheaders',

    'sales',
    'accounts',
    'production',
    'transport',
    'warehouse',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "https://erpUnibrain.com",
]

AUTH_USER_MODEL = 'accounts.User'

ROOT_URLCONF = 'Erp.urls'

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

if config("RENDER", default=False, cast=bool):
    DATABASES = {
        "default": dj_database_url.config(
            default=config("DATABASE_URL"),
            conn_max_age=600,
            ssl_require=True
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": config("DB_NAME", default="unibrain_erm"),
            "USER": config("DB_USER", default="unibrain_admin"),
            "PASSWORD": config("DB_PASS", default="adminunibrain"),
            "HOST": config("DB_HOST", default="localhost"),
            "PORT": config("DB_PORT", default="5432"),
        }
    }

STATIC_URL = "/static/"
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

JAZZMIN_SETTINGS = {
    "site_title": "Unibrain ERP Admin",
    "site_header": "Unibrain ERP",
    "site_brand": "Unibrain ERP",
    "welcome_sign": "Welcome to Unibrain ERP Admin",
    "copyright": "Unibrain Industries © 2025",
    "site_logo": "img/unibrain_logo.png",
    "custom_css": "css/unibrain_theme.css",
    "show_sidebar": True,
    "hide_apps": [],
    "order_with_respect_to": ["auth", "warehouse", "production"],

    # 🎨 Colors
    "theme": "default",
    "dark_mode_theme": None,

    "custom_css": None,
    "custom_js": None,

    "site_logo_classes": "img-circle",
    "related_modal_active": True,

    "show_ui_builder": False,

    # 🟩🟨 Unibrain color scheme
    "button_classes": {
        "primary": "btn-success",
        "secondary": "btn-outline-success",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
    },

    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index", "permissions": ["auth.view_user"]},
    ],

    # Sidebar colors
    "navigation_expanded": True,
    "custom_links": {
        "Production": [
            {"name": "Production Analytics", "url": "/admin/warehouse/analytics/", "icon": "fa-chart-line"},
        ],
    },
}

JAZZMIN_UI_TWEAKS = {
    "navbar": "navbar-success",           # Green top navbar
    "sidebar": "sidebar-dark-success",    # Green sidebar
    "brand_colour": "navbar-success",
    "accent": "accent-success",           # Green highlights instead of yellow
    "theme": "default",

    # ✅ Make all buttons green (Bootstrap-valid)
    "button_classes": {
        "primary": "btn-success",
        "secondary": "btn-outline-success",
        "info": "btn-success",
        "warning": "btn-warning",
        "danger": "btn-danger",
    },

    "actions_sticky_top": True,
}
