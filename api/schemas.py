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
    # IP-aggregation features (opsional)
    request_count:  int             = Field(1,     description="Total request dari IP ini")
    error_count:    int             = Field(0,     description="Jumlah error 5xx dari IP ini")
    login_attempts: int             = Field(0,     description="Upaya login dari IP ini")
    failed_auth:    int             = Field(0,     description="Gagal auth (401/403) dari IP ini")

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
                "failed_auth":   80,
                "login_attempts":45,
                "error_count":   5,
            }
        }
    }

class BatchLogEntry(BaseModel):
    logs: List[LogEntry]
