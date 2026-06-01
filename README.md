# 🚀 CryptoAgent Multi-Exchange AI - MVP

**Production-ready, enterprise-grade crypto trading assistant** with AI-powered insights, multi-exchange integration, and intelligent portfolio management.

![Version](https://img.shields.io/badge/version-1.0.0--MVP-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-18+-brightgreen)
![Flutter](https://img.shields.io/badge/flutter-3.10+-blue)
![Docker](https://img.shields.io/badge/docker-ready-blue)

---

## 🎯 Core Features

### 📊 Portfolio Management
- Real-time balance tracking across 5 exchanges
- Multi-asset P&L calculations
- Asset allocation & exposure analysis
- Historical performance tracking

### 🤖 AI Trading Assistant
- Natural language trading queries
- Intelligent trade suggestions with risk scoring
- Local vector embeddings for fast responses
- Redis caching (5-10 min precomputed analysis)
- Minimal token consumption (~80% reduction)

### 📈 Market Analysis
- Technical Indicators: RSI, MACD, EMA, SMA, Bollinger Bands
- Smart Money Concepts: Support/Resistance, Trend Detection
- Breakout & Pullback Signals
- Risk-adjusted entry/exit points

### 🔌 Multi-Exchange Integration
- **Binance** - Spot & Futures
- **Bybit** - Spot & Perpetuals
- **OKX** - Spot & Derivatives
- **KuCoin** - Spot & Futures
- **Kraken** - Spot & Margin

### ⚙️ Automated Trading Engine
- Order Types: Market, Limit, Stop Loss, Take Profit
- Execution Modes: Manual → Semi-Automatic
- Risk Management Rules
- Trade History & Analytics

### 🔔 Notifications
- Real-time push notifications
- Trade signals & executions
- Portfolio alerts
- Risk warnings

### 🔐 Enterprise Security
- JWT + OAuth 2.0 authentication
- 2FA with TOTP
- Device verification
- AES-256 encrypted API keys
- OWASP Top 10 compliance

---

## 📋 Project Structure

```
CryptoAgent-MVP/
├── backend/                    # NestJS Backend (Port 3000)
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── common/
│   │   ├── config/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── exchanges/
│   │   │   ├── portfolio/
│   │   │   ├── market/
│   │   │   ├── trading/
│   │   │   ├── ai-assistant/
│   │   │   ├── notifications/
│   │   │   ├── risk-management/
│   │   │   └── admin/
│   │   └── database/
│   ├── test/
│   ├── package.json
│   └── Dockerfile
├── frontend/                   # Flutter App
│   ├── lib/
│   ├── pubspec.yaml
│   └── Dockerfile
├── docker-compose.yml
├── kubernetes/
├── docs/
└── scripts/
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Flutter 3.10+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+

### Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Backend: `http://localhost:3000`

### Frontend Setup
```bash
cd frontend
flutter pub get
flutter run -d chrome    # Web
flutter run               # Mobile
```

### Full Stack (Docker)
```bash
docker-compose up -d
```

Services:
- Backend: `http://localhost:3000`
- Frontend Web: `http://localhost:80`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────┐
│   Flutter Multi-Platform Frontend       │
│  (Mobile iOS/Android, Web, Desktop)     │
└────────────────┬────────────────────────┘
                 │ REST API + WebSocket
┌────────────────▼────────────────────────┐
│       NestJS API Gateway (3000)         │
│  ┌────────────────────────────────────┐ │
│  │ Auth, Users, Exchanges, Portfolio  │ │
│  │ Market, Trading, AI, Notifications │ │
│  └────────────────────────────────────┘ │
└────────────────┬────────────────────────┘
     ┌───────────┼───────────┐
     │           │           │
┌────▼──┐   ┌────▼────┐  ┌──▼────┐
│PostgreSQL │ │ Redis  │  │Qdrant │
│ (Primary) │ │(Cache) │  │(Vectors)│
└───────────┘ └────────┘  └────────┘
```

---

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE.md)
- [Setup Guide](./docs/SETUP.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Security](./docs/SECURITY.md)

---

## 📱 Platform Support

| Platform | Status | Details |
|----------|--------|----------|
| iOS | ✅ | iOS 12.0+ |
| Android | ✅ | Android 5.0+ |
| Web | ✅ | Chrome, Firefox, Safari |
| Windows | ✅ | Desktop |
| macOS | ✅ | Desktop |
| Linux | ✅ | Desktop |

---

## 🛣️ Roadmap

### Phase 1 (MVP - Current)
- ✅ Multi-exchange portfolio aggregation
- ✅ AI-assisted trade suggestions
- ✅ Manual trade execution
- ✅ Real-time notifications
- ✅ Basic risk scoring

### Phase 2 (Month 2-3)
- 🔄 Semi-Automatic trading
- 🔄 Advanced technical analysis
- 🔄 Social sentiment integration
- 🔄 Custom strategy builder

### Phase 3 (Month 4+)
- 🔄 Fully automated strategies
- 🔄 Machine learning models
- 🔄 Institutional risk management
- 🔄 White-label solution

---

## 📄 License

MIT License © 2024 CryptoAgent

---

## 📞 Support

- Email: support@cryptoagent.io
- Docs: https://docs.cryptoagent.io

---

**Built with ❤️ for crypto traders worldwide**
