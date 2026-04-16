"""
Daftar Pola Serangan untuk Feature Extraction
File ini menyimpan kumpulan kamus pola serangan yang biasa ditemukan di web log.
"""

SQL_KEYWORDS = [
    "SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "UNION", "CREATE", "ALTER",
    "EXEC", "EXECUTE", "QUERY", "DECLARE", "CAST", "CONVERT",
    "OR", "AND", "NOT", "IN", "EXISTS", "BETWEEN",
    "--", ";--", "/*", "*/", "#", ";;",
    "' OR '", "' OR 1=1", "\" OR \"", "\" OR 1=1", "OR 1=1", "OR 1",
    "1=1", "1' AND '1'='1", "1\" AND \"1\"=\"1",
    "CONCAT", "SUBSTR", "SUBSTRING", "LENGTH", "CHAR", "ASCII", "HEX",
    "SLEEP", "BENCHMARK", "WAITFOR", "DBMS", "HAVING", "GROUP BY",
    "LOAD_FILE", "INTO OUTFILE", "INTO DUMPFILE", "EXTRACTVALUE", "UPDATEXML",
    "@@version", "xp_cmdshell", "sp_",
    "0x", "/*!50000", "/*!",
]

XSS_PATTERNS = [
    "<script", "</script>", "<style", "</style>", "<svg", "</svg>",
    "javascript:", "data:", "vbscript:",
    "onerror=", "onload=", "onclick=", "onmouseover=", "onmouseenter=",
    "onmouseleave=", "onmouseout=", "onchange=", "onblur=", "onfocus=",
    "onkeydown=", "onkeyup=", "onkeypress=", "onsubmit=", "onreset=",
    "ondblclick=", "oncontextmenu=", "onwheel=", "ondrag=", "ondrop=",
    "onpaste=", "oncopy=", "oncut=", "oninput=", "ontouchstart=",
    "ontouchend=", "onscroll=",
    "<img", "<body", "<iframe", "<embed", "<object", "<applet", "<link",
    "<form", "<input", "<frame", "<frameset", "<marquee", "<meta",
    "alert(", "eval(", "prompt(", "confirm(", "document.write", "innerHTML",
    "innerText", "textContent", "setAttribute", "createElement", "appendChild",
    "&lt;", "&#60;", "&#x3c;", "\\u003c", "%3c", "String.fromCharCode",
    "base64", "atob", "btoa", "encodeURI", "encodeURIComponent",
    "${", "#{", "<c:", "<fmt:", "<%", "<%=", "%>",
]

DIR_TRAVERSAL_PATTERNS = [
    "../", "..\\", "..%2f", "..%5c", "..%252f", "..%252e%252e",
    "..../", "....\\", ".%2e/", ".%2e\\",
    "%2e%2e", "%5c..", "..%c0%af", "..%c1%9c",
    "..%u2f", "..%u5c", "..%u252f", "..%u255c",
    "../%00", "../%0d", "../%0a",
    "..\\..\\", ".../", "...\\",
    "etc/passwd", "etc/shadow", "etc/hosts", "etc/sudoers",
    "windows/system32", "boot.ini", "web.config", "passwd", "shadow",
    "config.php", "config.xml", "database.yml", ".env", ".htaccess",
    "appsettings.json", "secrets.json", "credentials",
    "/etc/", "/windows/", "/winnt/", "/system32/", "/syswow64/",
    "/apache/", "/nginx/", "/application/", "/uploads/", "/admin/",
    "var/log", "/proc/self", "file:///", "unc:", "smb://",
]

BRUTEFORCE_PATTERNS = [
    "/login", "/signin", "/auth", "/authenticate", "/admin/login", "/user/login",
    "/api/login", "/api/auth", "/account/login", "/account/signin",
    "/security/login", "/index.php?login", "?login=", "&login=",
    "/authenticate.do", "/admin/", "/dashboard/login", "/member/login",
    "password=", "passwd=", "pwd=", "pass=", "credential=", "credentials=",
    "api_key=", "apikey=", "token=", "auth_token=", "access_token=",
    "secret=", "apitoken=", "authorization=", "x-api-key",
    "username=", "user=", "email=", "userid=", "user_id=", "uid=",
    "account=", "login_id=", "member=", "memberid=", "customer=",
    "/api/account", "/api/admin", "/api/user", "/api/session",
    "/oauth", "/openid", "/saml", "/cas", "grant_type=",
    "/password/reset", "/password/change", "/password/forgot",
    "auth_code=", "code=", "session", "sessionid=", "jsessionid=",
    "phpsessid=", "aspsessionid=", "asp.net_sessionid=", "cfid=", "cftoken=",
    "_ga=", "_gid=", "cookie=", "set-cookie", "authorization: bearer",
    "/v1/auth", "/v2/auth", "/oauth2/authorize", "/oauth2/token",
    "basic auth", "bearer ", "oauth_token=", "consumer_key=",
    "access_token_secret=", "oauth_signature=", "realm=",
    "invalid", "incorrect", "wrong", "failed", "error", "denied",
    "unauthorized", "401", "403", "forbidden", "access denied",
    "login failed", "authentication failed", "auth failed",
    "/admin/users", "/users/", "/members/", "/customers/",
    "/accounts/", "/profiles/", "/api/users/", "/api/members/",
    "sqlmap", "nikto", "nmap", "masscan", "metasploit",
    "curl", "wget", "python", "perl", "ruby",
    "bot", "scanner", "crawler", "spider", "scraper",
    "password=&", "password=null", "username=&", "username=null",
    "password=\"\"", "username=\"\"", "password=''", "username=''",
    "admin", "root", "test", "guest", "user", "demo",
    "default", "123456", "password", "admin123", "12345678",
    "test123", "guest123", "user123",
]

BRUTEFORCE_UA_PATTERNS = [
    "bot", "scanner", "crawler", "scraper", "sqlmap", "nikto", "nmap",
]
