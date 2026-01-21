# 🏨 Smart Room Booking System

A real-time, high-concurrency room booking solution built with Node.js, TypeScript, PostgreSQL, and Redis. This system is designed to handle complex booking logic, prevent double-bookings through distributed locking, and provide a seamless experience for both admins and users.

---

## 🔥 Key Features

### 🔐 1. Authentication & Security
- **JWT-based Authentication**: Secure stateless authentication.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `Admin` and `User`.
- **Comprehensive Testing**: Robust unit tests for the authentication module.

### 📅 2. Real-time Booking Engine
- **Intelligent Availability Engine**: Logic-driven room availability checks.
- **Race Condition Protection**: Implementation of **Optimistic Locking** at the database level.
- **Business Rule Validation**: Automated checks for overlapping bookings and operational hours.
- **Quality Assurance**: Integrated Unit & Integration tests for the booking flow.

### 🔍 3. Advanced Management & Search
- **Full Lifecycle Management**: APIs to create, view, update, and cancel bookings.
- **Time-Range Queries**: Find available rooms based on specific time slots.
- **Optimization**: Server-side pagination, advanced filtering, and database indexing optimization.

### ⚡ 4. High Performance & Scalability
- **Redis Caching**: Ultra-fast retrieval of available rooms.
- **Distributed Locking**: Redlock implementation to prevent double-booking in a clustered environment.
- **Performance Testing**: Load testing using **Artillery** and **JMeter**.
- **Performance Tuning**: Continuous monitoring and optimization of bottlenecks.

### 🔔 5. Real-time Notifications & Background Jobs
- **Live Updates**: Real-time room status updates via **WebSockets/SSE**.
- **Automated Cleanup**: Background jobs to auto-release expired or unconfirmed rooms.
- **Queue-based Emails**: Scalable email notifications using a background message queue.

### 📊 6. Monitoring & Administration
- **Admin Command Center**: Dedicated APIs for managing rooms and viewing system stats.
- **Professional Logging**: Structured logging with **Winston/Log4j**.
- **Metrics & Observability**: Prometheus-formatted metrics collection.
- **Reliability**: Integrated health check endpoints for zero-downtime monitoring.

---

## 🛠 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (TypeScript)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Data Persistence)
- **Cache & Concurrency**: [Redis](https://redis.io/) (Caching & Distributed Locks)
- **Deployment**: [Docker](https://www.docker.com/) & Docker Compose
- **Testing**: Artillery, JMeter, Jest

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL & Redis (if running locally without Docker)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NguyenTienKhoa2004/Smart_Room_Booking.git
   cd Smart-Room-Booking
   ```

2. **Setup environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your credentials
   ```

3. **Launch with Docker:**
   ```bash
   docker-compose up -d
   ```

4. **Install dependencies (local dev):**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

---

## 🏗 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/      # Database & Redis configs
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth & Validation
│   │   └── models/      # Data schemas
│   ├── tests/           # Unit & Integration tests
│   └── schema.sql       # Database migrations
├── docker-compose.yaml
└── README.md
```

---

## 📝 License

This project is licensed under the MIT License.
