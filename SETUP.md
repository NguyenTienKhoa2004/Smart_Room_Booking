# 🚀 Quick Setup Guide

This guide will help you get the Smart Room Booking system running on your machine in minutes.

## Prerequisites

You only need **one thing**:
- ✅ **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)

**That's it!** No Node.js, PostgreSQL, or Redis installation required.

---

## Setup Steps (5 minutes)

### 1️⃣ Clone the Project
```bash
git clone https://github.com/NguyenTienKhoa2004/Smart_Room_Booking.git
cd Smart-Room-Booking
```

### 2️⃣ Configure Email (Optional but Recommended)
```bash
# Copy the example environment file
cp backend/.env.example backend/.env
```

Then edit `backend/.env` and update these lines:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

> 💡 **Note:** To get a Gmail app password, follow [this guide](https://support.google.com/accounts/answer/185833)

> ⚠️ **Skip this step** if you just want to test the app without email functionality.

### 3️⃣ Start Everything
```bash
docker-compose up -d
```

This single command will:
- ✅ Create and start PostgreSQL database
- ✅ Create and start Redis cache
- ✅ Build and start the backend API
- ✅ Build and start the frontend React app
- ✅ Automatically initialize the database with tables

**Wait 30-60 seconds** for all services to start (first time takes longer due to building images).

### 4️⃣ Access the Application
Open your browser and visit:
- 🌐 **Frontend:** http://localhost:3000
- 🔌 **Backend API:** http://localhost:5000
- 📊 **Health Check:** http://localhost:5000/health

---

## Useful Commands

### View logs
```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend
```

### Stop the application
```bash
docker-compose down
```

### Restart a specific service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild after code changes
```bash
# Rebuild specific service
docker-compose up -d --build backend

# Rebuild everything
docker-compose up -d --build
```

### Remove everything (including database data)
```bash
docker-compose down -v
```

---

## Troubleshooting

### Port already in use
If you get an error like "port is already allocated":

**For Windows:**
```powershell
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

**For Mac/Linux:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Services not starting
Check the logs:
```bash
docker-compose logs
```

Common fixes:
- Make sure Docker Desktop is running
- Try rebuilding: `docker-compose up -d --build`
- Remove old containers: `docker-compose down -v` then `docker-compose up -d`

### Database connection errors
The backend waits for PostgreSQL to be ready using health checks. If you still see errors:
```bash
# Restart the backend
docker-compose restart backend
```

---

## Alternative: Local Development

If you're a developer and want to run the backend/frontend **locally** (not in Docker):

**Prerequisites:**
- Node.js v18 or higher
- Docker Desktop (for database only)

**Steps:**
```bash
# 1. Start only database services
docker-compose up -d postgres redis

# 2. Run backend locally
cd backend
npm install
npm run dev

# 3. In another terminal, run frontend locally
cd frontend
npm install
npm run dev
```

Then access:
- Frontend: http://localhost:5173 (Vite default)
- Backend: http://localhost:5000

---

## Next Steps

1. **Create an admin account** - You may need to run a seed script
2. **Explore the API** - Check `http://localhost:5000/health`
3. **Test the booking flow** - Create rooms and make bookings
4. **Check the WebSocket connection** - Real-time updates should work automatically

---

Need help? Check the main [README.md](./README.md) for more detailed information.
