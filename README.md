# 🔍 CortexLog - Advanced Log Analysis & Threat Detection System

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Active%20Development-brightgreen.svg)

**An intelligent log analysis platform powered by machine learning for real-time threat detection and security monitoring.**

[Features](#-features) • [Quick Start](#-quick-start) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

**CortexLog** is a comprehensive log analysis and threat detection system that combines the power of machine learning with intuitive web-based dashboards. It processes security logs, detects anomalies, identifies threats, and provides actionable insights through beautiful visualizations and real-time alerts.

Built for security teams and system administrators who need to monitor complex environments with ease and intelligence.

---

## ✨ Features

### 🎯 Core Capabilities
- **Real-time Log Processing** - Ingest and analyze logs from multiple sources
- **ML-Powered Threat Detection** - Advanced anomaly detection using scikit-learn
- **Interactive Dashboard** - Beautiful, real-time visualizations with ApexCharts
- **Threat Hunting** - Advanced search and analysis tools for security investigations
- **Report Generation** - Export comprehensive security reports as PDF/Excel
- **Alert System** - Instant Telegram notifications for critical threats

### 👥 Administration
- **User Management** - Role-based access control (RBAC)
- **Settings Configuration** - Customize system behavior and thresholds
- **Audit Logging** - Track all system actions and changes

### 📊 Analytics & Visualization
- **Anomaly Detection Charts** - Visual representation of suspicious patterns
- **Threat Distribution Analysis** - Understand threat landscape
- **Log Timeline Visualization** - Track events over time
- **Attack Pattern Analysis** - Identify attack methodologies
- **Performance Metrics** - Monitor system health and log processing speed

### 🔔 Notifications
- **Telegram Integration** - Real-time alerts to Telegram
- **Customizable Thresholds** - Configure alert sensitivity
- **Alert Management** - View and manage notifications

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with server-side rendering
- **UI Library**: React 19 with modern hooks
- **Styling**: Tailwind CSS 4 - Utility-first CSS framework
- **Charts**: ApexCharts - Interactive data visualization
- **Authentication**: JWT with secure token management
- **Export**: XLSX for Excel reports

### Backend
- **Framework**: FastAPI - Modern, fast Python web framework
- **ML/AI**: scikit-learn - Machine learning algorithms
- **Data Processing**: Pandas, NumPy - Data manipulation and analysis
- **Server**: Uvicorn - ASGI server
- **Validation**: Pydantic - Data validation and serialization

### Database
- **PostgreSQL** - Robust relational database
- **ORM**: SQLAlchemy (via FastAPI)

### Additional Technologies
- **Authentication**: bcryptjs - Password hashing
- **Alerts**: Telegram Bot API
- **Configuration**: dotenv - Environment management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- PostgreSQL 12+
- Git

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/QhodryAndra04/cortexlog-app.git
cd cortexlog-app
```

2. **Setup Frontend**
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

3. **Setup Backend**
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
cd api
pip install -r requirements.txt
```

4. **Configure Environment Variables**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
JWT_SECRET=your_secret_key

# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost/cortexlog
SECRET_KEY=your_secret_key
TELEGRAM_BOT_TOKEN=your_telegram_token
TELEGRAM_CHAT_ID=your_chat_id
```

5. **Start Development Servers**

**Terminal 1 - Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd api
uvicorn main:app --reload --port 8000
# Backend API runs on http://localhost:8000
```

---

## 📁 Project Structure

```
cortexlog-app/
├── app/                          # Next.js frontend application
│   ├── (admin)/                  # Protected admin routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── threat-hunting/       # Threat analysis tools
│   │   ├── reports/              # Report management
│   │   ├── user-management/      # User administration
│   │   ├── settings/             # System configuration
│   │   └── ...
│   ├── api/                      # Next.js API routes
│   │   ├── analyze-logs/         # Log analysis endpoint
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── dashboard/            # Dashboard statistics
│   │   ├── threat-hunting/       # Threat search
│   │   ├── reports/              # Report generation
│   │   └── ...
│   ├── components/               # Reusable React components
│   │   ├── LogsTable.js          # Log display component
│   │   ├── LogChart.js           # Chart visualizations
│   │   ├── Dashboard.js          # Dashboard layout
│   │   ├── AuthProvider.js       # Auth context provider
│   │   └── ...
│   └── globals.css               # Global styles
│
├── lib/                          # Shared utilities and services
│   ├── api.js                    # API client functions
│   ├── auth.js                   # Authentication helpers
│   ├── db.js                     # Database utilities
│   ├── middleware.js             # Express middleware
│   ├── services/                 # Business logic services
│   │   ├── authService.js
│   │   ├── dashboardService.js
│   │   ├── threatService.js
│   │   ├── reportService.js
│   │   └── ...
│   └── utils/                    # Utility functions
│       └── formatters.js
│
├── api/                          # Python FastAPI backend
│   ├── main.py                   # Application entry point
│   ├── cortex_agent.py           # ML agent for threat detection
│   ├── features.py               # Feature engineering
│   ├── ml_services.py            # ML model services
│   ├── patterns.py               # Pattern detection algorithms
│   ├── schemas.py                # Pydantic models
│   ├── models/                   # Trained ML models
│   └── requirements.txt          # Python dependencies
│
├── public/                       # Static assets
├── package.json                  # Node.js dependencies
├── next.config.mjs               # Next.js configuration
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── jsconfig.json                 # JavaScript configuration
```

---

## 🔌 API Documentation

### Authentication
```bash
# Register
POST /api/auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "secure_password",
  "username": "username"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### Log Analysis
```bash
# Analyze logs for threats
POST /api/analyze-logs
Authorization: Bearer <token>
Content-Type: application/json
{
  "logs": [...],
  "analyze_patterns": true,
  "detect_anomalies": true
}
```

### Dashboard
```bash
# Get dashboard statistics
GET /api/dashboard/stats
Authorization: Bearer <token>
```

### Threat Hunting
```bash
# Search and analyze threats
POST /api/threat-hunting
Authorization: Bearer <token>
{
  "query": "search terms",
  "filters": {...},
  "date_range": {...}
}
```

### Reports
```bash
# Generate and retrieve reports
GET /api/reports
POST /api/reports
GET /api/reports/:id
```

---

## 🛠️ Development

### Build for Production
```bash
# Frontend
npm run build
npm run start

# Backend
cd api
# Configure for production deployment
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Format code
npm run format
```

### Database Migrations
```bash
# Create initial schema
python -m alembic upgrade head
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

For support, questions, or feedback:
- 📧 Open an issue on GitHub
- 📖 Check the documentation
- 💬 Join our community discussions

---

## 🎯 Roadmap

- [ ] Enhanced ML models for better threat detection
- [ ] Kubernetes deployment support
- [ ] Advanced SIEM integration
- [ ] Multi-language UI support
- [ ] Mobile application
- [ ] Custom alert rules engine
- [ ] Advanced threat correlation

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [FastAPI](https://fastapi.tiangolo.com/)
- Charts powered by [ApexCharts](https://apexcharts.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- ML capabilities from [scikit-learn](https://scikit-learn.org/)

---

<div align="center">

Made with ❤️ by [QhodryAndra04](https://github.com/QhodryAndra04)

[⬆ Back to Top](#-cortexlog---advanced-log-analysis--threat-detection-system)

</div>
