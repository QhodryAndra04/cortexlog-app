"""
CortexLog FastAPI - Web Log Anomaly & Attack Detection API
=========================================================
File ini difokuskan sebagai HTTP Router. Logika ekstraksi fitur dan
prediksi Machine Learning dipisahkan ke dalam modul khusus untuk menjaga
keterbacaan dan kebersihan kode.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .schemas import LogEntry, BatchLogEntry
from .ml_services import load_models, check_models_health, MLPredictionService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eksekusi saat startup
    load_models()
    yield
    # Eksekusi saat shutdown (jika ada resources yg mau dibersihkan)

app = FastAPI(
    title="CortexLog Detection API",
    description=(
        "API untuk mendeteksi anomali dan jenis serangan pada web log "
        "menggunakan Isolation Forest dan Random Forest."
    ),
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "CortexLog Detection API",
        "version": "1.0.0",
        "endpoints": {
            "anomaly_detection":     "POST /predict/isolation-forest",
            "attack_classification": "POST /predict/random-forest",
            "combined":              "POST /predict/combined",
            "batch_anomaly":         "POST /predict/batch/isolation-forest",
            "batch_attack":          "POST /predict/batch/random-forest",
            "health":                "GET  /health",
            "docs":                  "GET  /docs",
        },
    }

@app.get("/health", tags=["Health"])
def health():
    """Cek status ketersediaan model."""
    status_models = check_models_health()
    return {
        "status": "ok",
        "models": status_models,
    }


# ── Single Predictions ────────────────────────────────────────────────────────

@app.post("/predict/isolation-forest", tags=["Isolation Forest"])
def predict_isolation_forest(log: LogEntry):
    if not MLPredictionService.is_iforest_ready():
        raise HTTPException(status_code=503, detail="Model Isolation Forest belum siap.")
    return MLPredictionService.predict_isolation_forest(log.model_dump())

@app.post("/predict/random-forest", tags=["Random Forest"])
def predict_random_forest(log: LogEntry):
    if not MLPredictionService.is_rf_ready():
        raise HTTPException(status_code=503, detail="Model Random Forest belum siap.")
    return MLPredictionService.predict_random_forest(log.model_dump())

@app.post("/predict/combined", tags=["Combined"])
def predict_combined(log: LogEntry):
    return MLPredictionService.predict_combined(log.model_dump())


# ── Batch Predictions ─────────────────────────────────────────────────────────

@app.post("/predict/batch/isolation-forest", tags=["Batch"])
def batch_isolation_forest(batch: BatchLogEntry):
    if not MLPredictionService.is_iforest_ready():
        raise HTTPException(status_code=503, detail="Model Isolation Forest belum siap.")
    return MLPredictionService.batch_isolation_forest(batch)

@app.post("/predict/batch/random-forest", tags=["Batch"])
def batch_random_forest(batch: BatchLogEntry):
    if not MLPredictionService.is_rf_ready():
        raise HTTPException(status_code=503, detail="Model Random Forest belum siap.")
    return MLPredictionService.batch_random_forest(batch)
