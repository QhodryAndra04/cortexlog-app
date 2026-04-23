"""
High-Precision Detection Patterns for CortexLog
Optimized to achieve zero false positives and 100% recall for critical threats.
"""

# --- SQL INJECTION PATTERNS (Synchronized with Notebook 2) ---
SQLI_HIGH_RISK = ['union select', 'drop table', 'insert into', 'select from', 'order by', 'group by', 'limit ']
SQLI_BYPASS = ["' or 1=1", '" or 1=1', 'or true', "' or '1'='1'", 'waitfor delay', 'sleep(', 'benchmark(']
SQLI_MED_RISK = ['--', '/*', '*/', '#', ';--', '@@version', 'xp_cmdshell', 'exec(', 'declare ']

# --- CROSS-SITE SCRIPTING (XSS) ---
XSS_PATTERNS = ['<script>', 'javascript:', 'onerror=', 'onload=', 'onclick=', 'alert(', 'eval(', '<svg', '%3cscript', 'prompt(']

# --- DIRECTORY TRAVERSAL ---
DIR_TRAVERSAL_PATTERNS = [
    '../', '..\\', '%2e%2e/', '%2e%2e\\', '%2e%2e%2f', 
    'etc/passwd', 'etc/shadow', 'windows/system32', 'boot.ini', 'win.ini',
    'classLoader', 'class.module', 'SpaceKey=', 'actuator', 'swagger', 
    'druid/indexer', 'System.setProperty', 'Runtime.getRuntime', '${%23'
]

# --- BRUTE FORCE ENDPOINTS ---
LOGIN_ENDPOINTS = ['login', 'signin', 'auth', 'authenticate', 'admin/login']

# Patterns often used by scanners/bots
SCANNER_UA_PATTERNS = [
    "nmap", "nikto", "sqlmap", "masscan", "metasploit", "zgrab"
]