# Smart Room Booking System

A real-time, high-concurrency room booking solution built with Node.js, TypeScript, PostgreSQL, and Redis. This system is designed to handle complex booking logic, prevent double-bookings through distributed locking, and provide a seamless experience for both admins and users.

---

## Key Features

### 1. Authentication & Security
- **JWT-based Authentication**: Highly scalable and stateless authentication.
- **Follow refresh and access token strategy**: Enhance system safety and user experience.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `Admin` and `User`.
- **Comprehensive Testing**: Robust unit tests for the authentication module.

### 2. Real-time Booking Engine
- **Intelligent Availability Engine**: Logic-driven room availability checks.
- **Race Condition Protection**: Implementation of **Optimistic Locking** at the database level.
- **Business Rule Validation**: Automated checks for overlapping bookings and operational hours.
- **Real-time Status Updates**: **Socket.io** integration to push room status changes to the frontend without page refreshes.
- **Quality Assurance**: Integrated Unit & Integration tests for the booking flow.

### 3. Advanced Management & Search
- **Full Lifecycle Management**: APIs to create, view, update, and cancel bookings.
- **Time-Range Queries**: Find available rooms based on specific time slots.
- **Optimization**: Server-side pagination, advanced filtering, and database indexing optimization.

### 4. High Performance & Scalability
- **Redis Caching**: Ultra-fast retrieval of available rooms.
- **Distributed Locking**: Redlock implementation to prevent double-booking in a clustered environment.
- **Performance Testing**: Load testing using **Artillery** and **JMeter**.
- **Performance Tuning**: Continuous monitoring and optimization of bottlenecks.

### 5. Real-time Notifications & Background Jobs
- **Reminder**: Notify the user shortly before the booking starts.
- **Queue-based Emails**: Scalable email notifications using a background message queue.

---

## 🛠 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) 
- **Database**: [PostgreSQL](https://www.postgresql.org/) 
- **Cache & Concurrency**: [Redis](https://redis.io/) 
- **Real-time Engine**: [Socket.io](https://socket.io/)
- **Deployment**: [Docker](https://www.docker.com/) 
- **Testing**: Artillery, JMeter, Jest

---

## Getting Started

### Prerequisites
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- That's it! No Node.js installation required when using Docker.

### Installation & Running the Application

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NguyenTienKhoa2004/Smart_Room_Booking.git
   cd Smart-Room-Booking
   ```

2. **Setup environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   **Important:** Edit `backend/.env` and update the email configuration:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: Your Gmail app password ([How to create](https://support.google.com/accounts/answer/185833))
   - (Optional) Update JWT secrets for production

3. **Start all services with Docker:**
   ```bash
   docker-compose up -d
   ```
   
   This will start:
   - PostgreSQL database (port 5433)
   - Redis cache (port 6379)
   - Backend API (port 5000)
   - Frontend app (port 3000)

4. **Access the application:**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:5000

5. **View logs (optional):**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   ```

6. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Applying Code Changes with Docker

When you edit code while using Docker, you need to rebuild the containers to apply the changes:

**For Backend changes:**
```bash
docker-compose down
docker-compose up -d --build backend
```

**For Frontend changes:**
```bash
docker-compose down
docker-compose up -d --build frontend
```

**For changes in both:**
```bash
docker-compose down
docker-compose up -d --build
```

> **Note:** Docker builds a production version of your app, so changes require rebuilding (takes 1-3 minutes). For faster development with instant hot reload, see the "Local Development" section below.

---

### Alternative: Local Development (Without Docker)

If you prefer to run the backend/frontend locally for development:

**Prerequisites:**
- Node.js (v18 or higher)
- Docker Desktop (for PostgreSQL & Redis only)

**Steps:**
1. Start only the database services:
   ```bash
   docker-compose up -d postgres redis
   ```

2. Install and run backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. Install and run frontend (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Project Structure

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
