# sentimen/app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sentimen_route import router as sentimen_router

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tambahkan router
app.include_router(sentimen_router)
