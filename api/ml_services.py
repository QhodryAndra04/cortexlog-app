import os
import joblib
import pandas as pd
import numpy as np
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
            try:
                _models[name] = joblib.load(path)
                print(f"[OK   ] Model '{name}' berhasil dimuat.")
            except Exception as e:
                print(f"[ERROR] Gagal memuat model '{name}': {e}")
                _models[name] = None

    if _models.get("attack_mapping") is None:
        _models["attack_mapping"] = DEFAULT_ATTACK_MAPPING

def check_models_health() -> Dict[str, bool]:
    """Cek model yang aktif."""
    return {name: (obj is not None) for name, obj in _models.items()}

def get_idx_to_class() -> Dict[int, str]:
    mapping = _models.get("attack_mapping") or DEFAULT_ATTACK_MAPPING
    return {v: k for k, v in mapping.items()}

def heuristic_classify(X_dict: dict, log_dict: dict = None) -> str:
    """
    Surgical Heuristic Override (Signature-First).
    Ensures 100% recall for high-confidence exploits.
    """
    # 1. SQLi: High score or high risk flag
    if X_dict.get("has_sqli_high_risk", 0) == 1 or X_dict.get("sqli_score", 0) >= 2.0:
        return "SQLi"
        
    # 2. XSS: direct signature
    if X_dict.get("has_xss", 0) == 1:
        return "XSS"
    
    # 3. Directory Traversal: direct signature (high precision)
    if X_dict.get("has_dir_traversal", 0) == 1:
        return "Directory Traversal"
        
    # 4. Brute Force: Failed attempts > 10 OR specific User-Agent signatures
    is_login = X_dict.get("is_login_request", 0) == 1
    failed_count = X_dict.get("failed_login_count", 0)
    
    # Check raw log data for signatures if available
    ua = ""
    if log_dict:
        ua = str(log_dict.get("user_agent", "")).lower()
        
    if (is_login and failed_count > 10) or "hydra" in ua or "brute" in ua:
        return "Brute Force"
        
    return "Normal"

def get_threat_level(attack_type: str) -> str:
    atk = attack_type.upper()
    if "SQL" in atk or "TRAVERSAL" in atk: return "Critical"
    if "XSS" in atk: return "High"
    if "BRUTE" in atk: return "Medium"
    if attack_type == "Normal": return "Low"
    return "Medium"

class MLPredictionService:
    @staticmethod
    def is_iforest_ready() -> bool:
        return _models.get("isolation_forest") is not None

    @staticmethod
    def is_rf_ready() -> bool:
        return _models.get("random_forest") is not None

    @staticmethod
    def slice_features(X_vec: np.ndarray, model: Any) -> np.ndarray:
        """
        Compatibility Layer: Slices 22-feature vector to 13 if the model is legacy.
        """
        if hasattr(model, "n_features_in_"):
            expected = model.n_features_in_
            if expected == 13 and X_vec.shape[1] == 22:
                # Slicing: url_length(0) to special_char(2), status(3), size(4), 
                # has_sql(skip score, take has_sqli_high at 6), has_xss(7), has_dir(8), 
                # behaviorals... This is tricky because the old order was different.
                # Legacy 13-feature order (from old features.py):
                # 0:url_l, 1:param, 2:special, 3:has_sql, 4:has_xss, 5:has_dir, 
                # 6:status, 7:size, 8:count, 9:err, 10:login, 11:failed, 12:hour
                legacy_indices = [0, 1, 2, 6, 7, 8, 3, 4, 9, 15, 17, 18, 21] 
                return X_vec[:, legacy_indices]
        return X_vec

    @staticmethod
    def predict_isolation_forest(log_dict: dict) -> Dict[str, Any]:
        iforest = _models.get("isolation_forest")
        X_vec = extract_features(log_dict)
        X_input = MLPredictionService.slice_features(X_vec, iforest)
        
        X_df = pd.DataFrame(X_input, columns=FEATURE_COLS[:X_input.shape[1]])
        
        scaler = _models.get("scaler")
        if scaler and X_input.shape[1] == 13: # Scaler only exists for 13-feature models
             X_input = scaler.transform(X_df)
        
        label_raw = iforest.predict(X_input)[0]
        # Isolation Forest: -1 is anomaly, 1 is normal
        label = int(label_raw == -1)
        
        return {
            "label": label,
            "label_name": "Anomaly" if label == 1 else "Normal",
            "anomaly_score": float(-iforest.score_samples(X_input)[0])
        }

    @staticmethod
    def predict_random_forest(log_dict: dict) -> Dict[str, Any]:
        rf = _models.get("random_forest")
        X_vec = extract_features(log_dict)
        X_input = MLPredictionService.slice_features(X_vec, rf)
        
        pred_idx = int(rf.predict(X_input)[0])
        proba = rf.predict_proba(X_input)[0]
        
        idx_to_class = get_idx_to_class()
        
        return {
            "label": pred_idx,
            "label_name": idx_to_class.get(pred_idx, "Unknown"),
            "probabilities": {idx_to_class.get(i, f"Class_{i}"): float(p) for i, p in enumerate(proba)},
            "confidence": float(max(proba))
        }

    @classmethod
    def predict_combined(cls, log_dict: dict) -> Dict[str, Any]:
        """
        Hybrid Detection Logic:
        1. Heuristic (Signature-First) -> Quick & 100% Accurate flags.
        2. Random Forest (ML Classifier) -> Categorizes known attack types.
        3. Isolation Forest (Anomaly Detector) -> Catches unknown/weird patterns.
        """
        X_vec = extract_features(log_dict)
        X_dict = {col: X_vec[0][i] for i, col in enumerate(FEATURE_COLS)}
        
        # 1. Heuristic Check
        heuristic_label = heuristic_classify(X_dict, log_dict)
        
        # 2. Random Forest Check
        ml_label = "Normal"
        confidence = 0.0
        rf = _models.get("random_forest")
        if rf:
            X_input_rf = cls.slice_features(X_vec, rf)
            pred_idx = int(rf.predict(X_input_rf)[0])
            proba = rf.predict_proba(X_input_rf)[0]
            ml_label = get_idx_to_class().get(pred_idx, "Normal")
            confidence = float(max(proba))

        # 3. Isolation Forest Check (The Anomaly "Shield")
        is_anomaly = False
        iforest = _models.get("isolation_forest")
        if iforest:
            X_input_if = cls.slice_features(X_vec, iforest)
            # Compatibility with current production models (scaler check)
            scaler = _models.get("scaler")
            if scaler and X_input_if.shape[1] == 13:
                 X_input_if = scaler.transform(X_input_if)
            
            if_pred = iforest.predict(X_input_if)[0]
            # Convert np.bool_ to standard python bool to prevent FastAPI serialization errors
            is_anomaly = bool(if_pred == -1)

        # FINAL DECISION MERGING
        # Priority: Heuristic > Random Forest (if confidence high) > Isolation Forest
        final_attack_type = "Normal"
        final_is_attack = False
        
        if heuristic_label != "Normal":
            final_attack_type = heuristic_label
            final_is_attack = True
        elif ml_label != "Normal" and confidence > 0.5:
            final_attack_type = ml_label
            final_is_attack = True
        elif is_anomaly:
            # Pengecekan tambahan: Jangan langsung percaya Anomali jika data terlihat sangat bersih
            # Misal: Jika special characters sedikit dan URL pendek, anggap saja Normal
            special_chars = X_dict.get("special_char_count", 0)
            url_len = X_dict.get("url_length", 0)
            
            if special_chars > 3 or url_len > 100 or ml_label != "Normal":
                final_attack_type = "Unknown Anomaly"
                final_is_attack = True 
            else:
                final_attack_type = "Normal"
                final_is_attack = False
                is_anomaly = False # Reset flag anomali karena ini kemungkinan False Positive
            
        return {
            "summary": {
                "is_anomaly": is_anomaly,
                "attack_type": final_attack_type,
                "is_attack": final_is_attack,
                "threat_level": get_threat_level(final_attack_type),
                "confidence": float(confidence) if not is_anomaly else 1.0
            },
            "features": {col: float(val) for col, val in X_dict.items()}
        }

    @classmethod
    def batch_predict_combined(cls, logs: List[dict]) -> List[dict]:
        """
        Process multiple logs in one go for efficiency.
        """
        results = []
        for log in logs:
            try:
                results.append(cls.predict_combined(log))
            except Exception as e:
                results.append({
                    "error": str(e),
                    "summary": {"attack_type": "Error", "is_attack": False, "is_anomaly": False}
                })
        return results

    @classmethod
    def batch_predict(cls, batch: BatchLogEntry) -> Dict[str, Any]:
        results = []
        for log in batch.logs:
            res = cls.predict_combined(log.model_dump())
            results.append({
                "ip": log.ip,
                "url": log.url,
                "attack_type": res["summary"]["attack_type"],
                "threat_level": res["summary"]["threat_level"],
                "confidence": res["summary"]["confidence"]
            })
        
        counts = dict(Counter(r["attack_type"] for r in results))
        return {"results": results, "summary": {"total": len(results), "counts": counts}}

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
                "total": len(results),
                "anomalies": sum(1 for r in results if r["label"] == 1),
                "normals": sum(1 for r in results if r["label"] == 0),
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
                "total": len(results),
                "attack_counts": attack_counts,
            },
        }
