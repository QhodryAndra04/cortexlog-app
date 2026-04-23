from pydantic import BaseModel, Field
from typing import Optional, List

class LogEntry(BaseModel):
    ip:             Optional[str]   = Field(None,  description="Alamat IP client")
    method:         Optional[str]   = Field(None,  description="HTTP method (GET, POST, ...)")
    url:            str             = Field(...,   description="URL yang diakses")
    status_code:    int             = Field(200,   description="HTTP status code")
    response_size:  float           = Field(0.0,   description="Ukuran response (bytes)")
    user_agent:     Optional[str]   = Field("",    description="User-Agent string")
    timestamp:      Optional[str]   = Field(None,  description="Timestamp (dd/Mon/YYYY:HH:MM:SS)")
    referer:        Optional[str]   = Field(None,  description="Referer header")
    
    # --- Advanced Behavioral Metrics (Sync with 22-feature set) ---
    request_count:       int   = Field(1,   description="Total request dari IP ini")
    request_rate:        float = Field(0.0, description="Requests per second")
    error_count:         int   = Field(0,   description="Jumlah error server (5xx) dari IP ini")
    status_4xx_count:    int   = Field(0,   description="Jumlah client error (4xx) dari IP ini")
    status_5xx_count:    int   = Field(0,   description="Jumlah server error (5xx) dari IP ini")
    login_request_count: int   = Field(0,   description="Upaya login dari IP ini")
    failed_login_count:  int   = Field(0,   description="Gagal login dari IP ini")
    failed_login_ratio:  float = Field(0.0, description="Rasio gagal login")
    session_duration:    float = Field(0.0, description="Durasi sesi dalam detik")
    avg_interval:        float = Field(0.0, description="Rata-rata interval antar request")
    std_interval:        float = Field(0.0, description="Standar deviasi interval")
    unique_ua_count:     int   = Field(1,   description="Jumlah User-Agent unik dari IP ini")

    model_config = {
        "json_schema_extra": {
            "example": {
                "ip":            "192.168.1.100",
                "method":        "GET",
                "url":           "/admin/login?user=admin&password=1234",
                "status_code":   401,
                "response_size": 512.0,
                "user_agent":    "Mozilla/5.0",
                "timestamp":     "15/Apr/2026:10:30:00",
                "request_count": 150,
                "failed_login_count": 80,
                "login_request_count": 85,
                "request_rate": 2.5
            }
        }
    }

class BatchLogEntry(BaseModel):
    logs: List[LogEntry]
