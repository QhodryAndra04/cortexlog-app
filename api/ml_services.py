import os
import joblib
import pandas as pd
from typing import Dict, Any, List
from collections import Counter
from .features import extract_features, FEATURE_COLS
from .schemas import LogEntry, BatchLogEntry

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

MODEL_PATHS = {
    "isolation_forest": os.path.join(MODELS_DIR, "03_isolation_forest_model.pkl"),
    "scaler":           os.path.join(MODELS_DIR, "03_scaler.pkl"),
    "random_forest":    os.path.join(MODELS_DIR, "05_random_forest_model.pkl"),
    "attack_mapping":   os.path.join(MODELS_DIR, "04_attack_type_mapping.pkl"),
}

DEFAULT_ATTACK_MAPPING = {
    "Normal":               0,
    "SQLi":                 1,
    "XSS":                  2,
    "Brute Force":          3,
    "Directory Traversal":  4,
}

# In-memory storage untuk models
_models: Dict[str, Any] = {}

def load_models() -> None:
    """Muat model ke memory pada saat startup."""
    for name, path in MODEL_PATHS.items():
        if not os.path.exists(path):
            print(f"[INFO ] File model '{name}' tidak ditemukan: {path}")
            _models[name] = None
        else:
            _models[name] = joblib.load(path)
            print(f"[OK   ] Model '{name}' berhasil dimuat.")

    # Gunakan default mapping jika tidak disediakan user
    if _models.get("attack_mapping") is None:
        _models["attack_mapping"] = DEFAULT_ATTACK_MAPPING
        print("[INFO ] Menggunakan default attack_type_mapping.")

def check_models_health() -> Dict[str, bool]:
    """Cek model yang aktif."""
    return {name: (obj is not None) for name, obj in _models.items()}

def get_idx_to_class() -> Dict[int, str]:
    """Membalikkan map (misal: {0: 'Normal'})."""
    mapping = _models.get("attack_mapping") or DEFAULT_ATTACK_MAPPING
    return {v: k for k, v in mapping.items()}

def get_threat_level(is_anomaly: bool, attack_type: str) -> str:
    """Mengembalikan level ancaman berdasarkan tipe serangan dan anomali."""
    atk = attack_type.upper()
    
    if "SQL" in atk or "TRAVERSAL" in atk:
        return "CRITICAL"
    if "XSS" in atk:
        return "HIGH"
    if "BRUTE" in atk:
        return "MEDIUM"
    
    # Jika serangan tipe lain yang tidak terduga
    if attack_type not in ("Normal", "Unknown"):
        return "HIGH"
        
    # Anomali non-klasifikasi dari Isolation Forest
    if is_anomaly:
        return "MEDIUM"
        
    return "LOW"

class MLPredictionService:
    """Service layer untuk eksekusi Random Forest dan Isolation Forest."""

    @staticmethod
    def is_iforest_ready() -> bool:
        return _models.get("isolation_forest") is not None

    @staticmethod
    def is_rf_ready() -> bool:
        return _models.get("random_forest") is not None

    @staticmethod
    def predict_isolation_forest(log_dict: dict) -> Dict[str, Any]:
        iforest = _models.get("isolation_forest")
        
        X    = extract_features(log_dict)
        X_df = pd.DataFrame(X, columns=FEATURE_COLS)

        scaler = _models.get("scaler")
        if scaler:
            X_input = pd.DataFrame(scaler.transform(X_df), columns=FEATURE_COLS)
        else:
            X_input = X_df

        label_raw     = iforest.predict(X_input)[0]
        anomaly_score = float(-iforest.score_samples(X_input)[0])
        label         = int(label_raw == -1)

        return {
            "model":         "Isolation Forest",
            "label":         label,
            "label_name":    "Anomaly" if label == 1 else "Normal",
            "anomaly_score": round(anomaly_score, 6),
            "scaler_used":   scaler is not None,
            "input_features": {col: float(X[0][i]) for i, col in enumerate(FEATURE_COLS)},
        }

    @staticmethod
    def predict_random_forest(log_dict: dict) -> Dict[str, Any]:
        rf = _models.get("random_forest")
        idx_to_class = get_idx_to_class()

        X        = extract_features(log_dict)
        X_df     = pd.DataFrame(X, columns=FEATURE_COLS)
        pred_idx = int(rf.predict(X_df)[0])
        proba    = rf.predict_proba(X_df)[0]

        class_name    = idx_to_class.get(pred_idx, f"Class_{pred_idx}")
        probabilities = {
            idx_to_class.get(i, f"Class_{i}"): round(float(p), 6)
            for i, p in enumerate(proba)
        }

        return {
            "model":          "Random Forest",
            "label":          pred_idx,
            "label_name":     class_name,
            "probabilities":  probabilities,
            "confidence":     round(float(max(proba)), 6),
            "input_features": {col: float(X[0][i]) for i, col in enumerate(FEATURE_COLS)},
        }

    @classmethod
    def predict_combined(cls, log_dict: dict) -> Dict[str, Any]:
        results = {}

        if cls.is_iforest_ready():
            if_res = cls.predict_isolation_forest(log_dict)
            results["isolation_forest"] = {
                "label":         if_res["label"],
                "label_name":    if_res["label_name"],
                "anomaly_score": if_res["anomaly_score"],
            }
        else:
            results["isolation_forest"] = {"error": "Model tidak tersedia"}

        if cls.is_rf_ready():
            rf_res = cls.predict_random_forest(log_dict)
            results["random_forest"] = {
                "label":         rf_res["label"],
                "label_name":    rf_res["label_name"],
                "probabilities": rf_res["probabilities"],
                "confidence":    rf_res["confidence"],
            }
        else:
            results["random_forest"] = {"error": "Model tidak tersedia"}

        is_anomaly  = results.get("isolation_forest", {}).get("label", 0) == 1
        attack_type = results.get("random_forest", {}).get("label_name", "Unknown")
        is_attack   = attack_type not in ("Normal", "Unknown")

        results["summary"] = {
            "is_anomaly":  is_anomaly,
            "attack_type": attack_type,
            "is_attack":   is_attack,
            "threat_level": get_threat_level(is_anomaly, attack_type),
        }

        return results

    @classmethod
    def batch_isolation_forest(cls, batch: BatchLogEntry) -> Dict[str, Any]:
        results = []
        for log in batch.logs:
            res = cls.predict_isolation_forest(log.model_dump())
            results.append({
                "ip":            log.ip,
                "url":           log.url,
                "label":         res["label"],
                "label_name":    res["label_name"],
                "anomaly_score": res["anomaly_score"],
            })

        return {
            "results": results,
            "summary": {
                "total":    len(results),
                "anomalies": sum(1 for r in results if r["label"] == 1),
                "normals":   sum(1 for r in results if r["label"] == 0),
            },
        }

    @classmethod
    def batch_random_forest(cls, batch: BatchLogEntry) -> Dict[str, Any]:
        results = []
        for log in batch.logs:
            res = cls.predict_random_forest(log.model_dump())
            results.append({
                "ip":         log.ip,
                "url":        log.url,
                "label":      res["label"],
                "label_name": res["label_name"],
                "confidence": res["confidence"],
            })

        attack_counts = dict(Counter(r["label_name"] for r in results))

        return {
            "results": results,
            "summary": {
                "total":         len(results),
                "attack_counts": attack_counts,
            },
        }
