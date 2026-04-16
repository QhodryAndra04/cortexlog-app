import numpy as np
from datetime import datetime
from .patterns import (
    SQL_KEYWORDS,
    XSS_PATTERNS,
    DIR_TRAVERSAL_PATTERNS,
    BRUTEFORCE_PATTERNS,
    BRUTEFORCE_UA_PATTERNS,
)

FEATURE_COLS = [
    "url_length", "param_count", "special_char_count",
    "has_sql_keywords", "has_xss_pattern", "has_dir_traversal",
    "status_code", "response_size",
    "request_count", "error_count", "login_attempts", "failed_auth",
    "hour",
]

SPECIAL_CHARS = ["'", '"', "<", ">", ";", "--", "/*", "*/", "(", ")", "="]

def extract_features(log_dict: dict) -> np.ndarray:
    """Mengekstrak 13 fitur dari satu log entry."""
    url        = str(log_dict.get("url", ""))
    user_agent = str(log_dict.get("user_agent", "") or "")
    timestamp  = str(log_dict.get("timestamp", "") or "")
    status_code    = int(log_dict.get("status_code", 200))
    response_size  = float(log_dict.get("response_size", 0))
    request_count  = int(log_dict.get("request_count", 1))
    error_count    = int(log_dict.get("error_count", 0))
    login_attempts = int(log_dict.get("login_attempts", 0))
    failed_auth    = int(log_dict.get("failed_auth", 0))

    url_l = url.lower()
    ua_l  = user_agent.lower()

    # URL-based features
    url_length         = len(url)
    param_count        = url.count("=")
    special_char_count = sum(url.count(c) for c in SPECIAL_CHARS)

    # Attack pattern features
    has_sql = int(any(kw.lower() in url_l for kw in SQL_KEYWORDS))
    has_xss = int(any(p.lower()  in url_l for p in XSS_PATTERNS))
    has_dir = int(any(p.lower()  in url_l for p in DIR_TRAVERSAL_PATTERNS))
    has_bf  = int(
        any(p.lower() in url_l for p in BRUTEFORCE_PATTERNS) or
        any(p.lower() in ua_l  for p in BRUTEFORCE_UA_PATTERNS)
    )

    # Temporal feature
    try:
        dt   = datetime.strptime(timestamp.split()[0], "%d/%b/%Y:%H:%M:%S")
        hour = dt.hour
    except Exception:
        hour = 12

    return np.array([[
        url_length, param_count, special_char_count,
        has_sql, has_xss, has_dir,
        status_code, response_size,
        request_count, error_count, login_attempts, failed_auth,
        hour,
    ]], dtype=float)
