import numpy as np
import re
from urllib.parse import unquote
from datetime import datetime
from .patterns import (
    SQLI_HIGH_RISK,
    SQLI_BYPASS,
    SQLI_MED_RISK,
    XSS_PATTERNS,
    DIR_TRAVERSAL_PATTERNS,
    LOGIN_ENDPOINTS
)

# Full 22-feature list synchronized with stabilized research
FEATURE_COLS = [
    "url_length", "param_count", "special_char_count", "status_code", "response_size",
    "sqli_score", "has_sqli_high_risk", "has_xss", "has_dir_traversal",
    "request_count", "request_rate", "session_duration", "avg_interval", "std_interval",
    "status_4xx_count", "status_5xx_count", "is_login_request", "login_request_count",
    "failed_login_count", "failed_login_ratio", "unique_ua_count", "hour"
]

SPECIAL_CHARS = ["'", '"', "<", ">", ";", "--", "/*", "*/", "(", ")", "="]

def calculate_sqli_score(url: str) -> float:
    """Menghitung skor risiko SQL Injection secara akumulatif (Notebook 2 logic)."""
    url_l = url.lower()
    score = 0.0
    
    for p in SQLI_HIGH_RISK:
        if p.lower() in url_l: score += 2.0
    for p in SQLI_BYPASS:
        if p.lower() in url_l: score += 2.0
    for p in SQLI_MED_RISK:
        if p.lower() in url_l: score += 1.0
        
    return score

def extract_features(log_dict: dict) -> np.ndarray:
    """Mengekstrak 22 fitur untuk deteksi ancaman berpresisi tinggi."""
    # 0. Decode URL to catch encoded attacks (e.g., %2e%2e%2f -> ../)
    url = unquote(str(log_dict.get("url", "")))
    url_l = url.lower()

    # 1. URL Basics
    url_length = len(url)
    param_count = url.count("=")
    special_char_count = sum(url.count(c) for c in SPECIAL_CHARS)
    
    # 2. Risk Signatures
    sqli_score    = calculate_sqli_score(url)
    has_sqli_high = int(any(p.lower() in url_l for p in SQLI_HIGH_RISK))
    has_xss       = int(any(p.lower() in url_l for p in XSS_PATTERNS))
    has_dir       = int(any(p.lower() in url_l for p in DIR_TRAVERSAL_PATTERNS))

    status_code    = int(log_dict.get("status_code", 200))
    response_size  = float(log_dict.get("response_size", 0))
    timestamp      = str(log_dict.get("timestamp", ""))
    request_count       = int(log_dict.get("request_count", 1))
    request_rate        = float(log_dict.get("request_rate", 0.0))
    session_duration    = float(log_dict.get("session_duration", 0.0))
    avg_interval        = float(log_dict.get("avg_interval", 0.0))
    std_interval        = float(log_dict.get("std_interval", 0.0))
    status_4xx_count    = int(log_dict.get("status_4xx_count", 0))
    status_5xx_count    = int(log_dict.get("status_5xx_count", 0))
    
    # 4. Context Logic: Brute Force Detection
    is_login_req        = int(any(p.lower() in url_l for p in LOGIN_ENDPOINTS))
    login_request_count = int(log_dict.get("login_request_count", 0))
    failed_login_count  = int(log_dict.get("failed_login_count", 0))
    failed_login_ratio  = float(log_dict.get("failed_login_ratio", 0.0))
    unique_ua_count     = int(log_dict.get("unique_ua_count", 1))
    
    # 5. Temporal
    try:
        # Expected format: 15/Apr/2026:10:30:00
        time_str = timestamp.split()[0] if " " in timestamp else timestamp
        dt = datetime.strptime(time_str, "%d/%b/%Y:%H:%M:%S")
        hour = dt.hour
    except:
        hour = datetime.now().hour
        
    return np.array([[
        url_length, param_count, special_char_count, status_code, response_size,
        sqli_score, has_sqli_high, has_xss, has_dir,
        request_count, request_rate, session_duration, avg_interval, std_interval,
        status_4xx_count, status_5xx_count, is_login_req, login_request_count,
        failed_login_count, failed_login_ratio, unique_ua_count, hour
    ]], dtype=float)
