# 🌾 Farm Connect

A modern **microservices-based platform** that connects farmers, advisors, and the agricultural marketplace. Farm Connect streamlines farm management, enables direct marketplace transactions, and provides real-time advisory services to empower farmers with data-driven decisions.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Services](#services)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Farm Connect** is an integrated agricultural platform designed to bridge the gap between farmers and modern market opportunities. The platform leverages microservices architecture to provide scalability, independence, and resilience across different business domains.

### Vision
Empower farmers with technology by providing:
- 📊 Real-time farm management tools
- 🏪 Direct marketplace access without intermediaries
- 💡 Expert agricultural advisory services
- 📱 Seamless communication and notifications
- 💳 Integrated payment processing (M-Pesa)
- 🖼️ Media management and storage

---

## ✨ Key Features

### 👥 User Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Secure password management
- Multi-user support (Farmers, Advisors, Buyers)

### 🌾 Farm Management
- Farm profile creation and management
- Crop tracking and monitoring
- Farm operations management
- Weather-based advisory integration

### 🛒 Marketplace
- Direct buying and selling platform
- Product listings and management
- Order processing
- **M-Pesa payment integration** for seamless transactions
- Transaction history

### 📞 Advisory Services
- Expert advisory requests and responses
- Real-time notifications
- Redis-cached advisory data
- Kafka-based event streaming for advisories

### 🎬 Media Management
- Image and file uploads
- MinIO S3-compatible storage
- Media streaming and retrieval

### 🔔 Notifications
- Real-time alert system
- Multi-channel notification delivery
- Email notifications via Gmail
- SMS notifications via Africa's Talking API

### 📡 API Gateway
- Centralized request routing
- JWT token validation
- Rate limiting via Redis
- Service discovery

---

## 🏗️ Architecture

Farm Connect uses a **microservices architecture** with the following components:

```
┌─────────────────────────────────────────────────────┐
│           React Frontend (Agriconnect UI)           │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│         API Gateway (Request Router & Auth)          │
└────┬──────────┬──────────┬──────────┬───────────────┘
     │          │          │          │
  ┌──▼──┐  ┌───▼──┐  ┌───▼──┐  ┌───▼───┐
  │Auth │  │Farm  │  │Market│  │Advisory
  │Svc  │  │Mgmt  │  │Svc   │  │Svc
  └──┬──┘  └───┬──┘  └───┬──┘  └───┬───┘
     │         │         │         │
  ┌──▼──┐  ┌──▼──┐  ┌──▼──┐  ┌──▼──┐
  │Media│  │Notif│  │Redis│  │Kafka
  │Svc  │  │Svc  │  │     │  │
  └─────┘  └─────┘  └─────┘  └─────┘

      ┌─────────────┬─────────────┐
      │ PostgreSQL  │   MongoDB   │
      │  (Primary)  │   (Docs)    │
      └─────────────┴─────────────┘
```

### Service Communication
- **Synchronous**: REST APIs via API Gateway
- **Asynchronous**: Kafka event streaming
- **Caching**: Redis for performance optimization

---

## 🛠️ Tech Stack

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3.2.4
- **Cloud**: Spring Cloud (2023.0.1)
- **Security**: Spring Security + JWT (JJWT 0.12.5)
- **Messaging**: Apache Kafka
- **Caching**: Redis
- **Build**: Maven

### Frontend
- **Framework**: React 19.2.6
- **Build Tool**: Vite 8.0.12
- **Styling**: TailwindCSS 4.2
- **HTTP Client**: Axios 1.16.1
- **State Management**: Zustand 5.0.13
- **Routing**: React Router DOM 7.15.1
- **UI Icons**: Heroicons React 2.2.0

### Databases & Storage
- **PostgreSQL 16**: Relational database for auth & marketplace
- **MongoDB 7.0**: NoSQL database for farm operations
- **Redis 7.2**: Cache and session store
- **MinIO**: S3-compatible object storage

### Infrastructure & APIs
- **Containerization**: Docker & Docker Compose
- **Message Queue**: Apache Kafka + Zookeeper
- **Payment**: M-Pesa (Daraja API)
- **Notifications**: 
  - Gmail API (Email)
  - Africa's Talking API (SMS)
- **Weather**: OpenWeather API
- **File Storage**: MinIO

---

## 📁 Project Structure

```
farm-connect/
├── agriconnectui/                 # React Frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── api-gateway/                   # API Gateway Service
│   └── pom.xml
│
├── user-auth-service/             # Authentication & Authorization
│   └── pom.xml
│
├── farm-management-service/       # Farm Operations & Management
│   └── pom.xml
│
├── marketplace-service/           # Buy/Sell & Transactions
│   └── pom.xml
│
├── advisory-service/              # Expert Advisory & Recommendations
│   └── pom.xml
│
├── media-service/                 # Media Upload & Management
│   └── pom.xml
│
├── notification-service/          # Alerts & Notifications
│   └── pom.xml
│
├── common/                        # Shared Utilities & Models
│   └── pom.xml
│
├── pom.xml                        # Root POM for multi-module build
├── docker-compose.dev.yml         # Development environment setup
├── start-all.sh                   # Script to start all services
├── init-db.sql                    # Database initialization
└── .env.example                   # Environment variables template
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java 21+** - [Download](https://www.oracle.com/java/technologies/downloads/#java21)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Maven 3.8+** - [Download](https://maven.apache.org/download.cgi)
- **Docker & Docker Compose** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)

### Optional APIs (for full functionality)
- M-Pesa Daraja API credentials
- OpenWeather API key
- Africa's Talking API key
- Gmail App Password

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/MAROOTS/farm-connect.git
cd farm-connect
```

### 2. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

See [Environment Configuration](#environment-configuration) for detailed setup.

### 3. Start Infrastructure Services

```bash
# Start all Docker services (PostgreSQL, MongoDB, Redis, Kafka, MinIO)
docker-compose -f docker-compose.dev.yml up -d

# Verify services are running
docker-compose -f docker-compose.dev.yml ps
```

### 4. Build Backend Services

```bash
# Build all Java modules
mvn clean install -DskipTests

# Or with tests
mvn clean install
```

### 5. Start All Services

```bash
# Make script executable
chmod +x start-all.sh

# Run all services
./start-all.sh
```

**Or manually start each service:**

```bash
# Terminal 1: API Gateway
cd api-gateway && mvn spring-boot:run

# Terminal 2: Auth Service
cd user-auth-service && mvn spring-boot:run

# Terminal 3: Farm Management
cd farm-management-service && mvn spring-boot:run

# Terminal 4: Marketplace
cd marketplace-service && mvn spring-boot:run

# Terminal 5: Advisory
cd advisory-service && mvn spring-boot:run

# Terminal 6: Media Service
cd media-service && mvn spring-boot:run

# Terminal 7: Notification Service
cd notification-service && mvn spring-boot:run
```

### 6. Start Frontend

```bash
cd agriconnectui

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 🔧 Development Setup

### IDE Configuration (IntelliJ IDEA)

1. Open project root as project
2. Mark `src` folders as **Source Roots**
3. Mark `target` folders as **Excluded**
4. Install Lombok plugin
5. Enable annotation processing: **Settings → Build → Compiler → Annotation Processors → Enable**

### Code Quality

```bash
# Run ESLint on frontend
cd agriconnectui && npm run lint

# Run tests
mvn test
```

### Hot Reload
- **Frontend**: Vite HMR enabled by default
- **Backend**: Use Spring DevTools for automatic restart

---

## 🌐 Environment Configuration

### .env File Setup

```dotenv
# JWT Configuration
JWT_SECRET=your_256_bit_secret_key_here

# Email Service (Gmail)
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_16_char_app_password

# SMS Service (Africa's Talking)
AT_API_KEY=your_africastalking_sandbox_key

# File Storage (MinIO)
MINIO_ACCESS_KEY=agriconnect
MINIO_SECRET_KEY=agriconnect123

# Weather Service
OPENWEATHER_API_KEY=your_openweathermap_key

# Payment Gateway (M-Pesa)
MPESA_CONSUMER_KEY=your_daraja_consumer_key
MPESA_CONSUMER_SECRET=your_daraja_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.dev/api/marketplace/mpesa/callback
```

### Database Configuration

| Service | Database | Host | Port | Default Creds |
|---------|----------|------|------|---|
| PostgreSQL | agriconnect_auth | localhost | 5432 | agriconnect/agriconnect123 |
| MongoDB | agriconnect_farm | localhost | 27017 | agriconnect/agriconnect123 |
| Redis | N/A | localhost | 6379 | N/A |

---

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication
All endpoints (except login/register) require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints by Service

#### User Auth Service
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/profile` - Get current user profile

#### Farm Management Service
- `POST /farms` - Create new farm
- `GET /farms` - List user's farms
- `GET /farms/{farmId}` - Get farm details
- `PUT /farms/{farmId}` - Update farm

#### Marketplace Service
- `POST /marketplace/products` - List products
- `POST /marketplace/orders` - Create order
- `GET /marketplace/orders` - List user's orders
- `POST /marketplace/mpesa/callback` - M-Pesa payment callback

#### Advisory Service
- `GET /advisories/experts` - List experts
- `POST /advisories/requests` - Create advisory request
- `GET /advisories/requests` - List requests

#### Media Service
- `POST /media/upload` - Upload media file
- `GET /media/{fileId}` - Download file

#### Notification Service
- `GET /notifications` - Get user notifications
- `PUT /notifications/{notifId}/read` - Mark as read

---

## 🏢 Services

### 1. **API Gateway** (Port: 8080)
- Request routing to microservices
- JWT validation
- Rate limiting
- Service discovery

### 2. **User Auth Service** (Port: 8081)
- User registration and login
- JWT token generation
- Password encryption
- Role management

### 3. **Farm Management Service** (Port: 8082)
- Farm profile management
- Crop information
- Farm operations
- Weather integration

### 4. **Marketplace Service** (Port: 8083)
- Product listings
- Order management
- Payment processing (M-Pesa)
- Transaction history

### 5. **Advisory Service** (Port: 8084)
- Expert advisory network
- Real-time recommendations
- Redis-cached data
- Kafka event stream

### 6. **Media Service** (Port: 8085)
- File upload/download
- MinIO integration
- Media validation
- Storage management

### 7. **Notification Service** (Port: 8086)
- Email notifications (Gmail)
- SMS notifications (Africa's Talking)
- Real-time alerts
- Kafka message consumer

---

## 💾 Database Schema

### PostgreSQL (Authentication & Marketplace)
```
Tables:
- users (id, email, password, role, created_at)
- orders (id, user_id, product_id, amount, status)
- payments (id, order_id, mpesa_ref, status)
- products (id, seller_id, name, description, price)
```

### MongoDB (Farm & Advisory Data)
```
Collections:
- farms (farm_id, owner_id, location, crops, area)
- advisory_requests (request_id, user_id, expert_id, query, response)
- crop_data (farm_id, crop_type, planting_date, yield)
- weather_data (location, temperature, humidity, forecast)
```

---

## 🤝 Contributing

We welcome contributions! Follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Follow Google Java Style Guide
- Use meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/MAROOTS/farm-connect/issues)
- **Owner**: [@MAROOTS](https://github.com/MAROOTS)

---

## 🙏 Acknowledgments

- Spring Boot & Spring Cloud communities
- React and Vite communities
- All contributors and testers

---

**Made with ❤️ for farmers everywhere** 🌾
