"""
main.py — Entry point for the Hotel ML FastAPI server

Run with:
    python main.py
    OR
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

API Docs available at:
    http://localhost:8000/docs       (Swagger UI)
    http://localhost:8000/redoc      (ReDoc)
"""

import uvicorn
from app.ml_api import app

if __name__ == "__main__":

    uvicorn.run(
        "app.ml_api:app",
        host="127.0.0.1",
        port=8001,
        reload=True
    )
