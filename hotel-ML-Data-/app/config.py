import os

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3002")

FIREBASE_ENABLED = os.environ.get("FIREBASE_ENABLED", "False").lower() in ("true", "1")

JWT_TOKEN = os.environ.get("JWT_TOKEN", "")

FIREBASE_KEY_PATH = os.environ.get("FIREBASE_KEY_PATH", "firebase_key.json")