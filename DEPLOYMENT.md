# 🚀 Deployment Guide - Render.com

This guide will help you deploy the Smart Room Booking System to Render.com.

---

## Prerequisites

1. A [Render.com](https://render.com) account (free tier available)
2. Your code pushed to GitHub/GitLab
3. An [Upstash Redis](https://upstash.com) account (for free Redis)

---

## Step 1: Deploy PostgreSQL Database

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Configure:
   - **Name**: `meeting-room-db`
   - **Database**: `meeting_room_db`
   - **User**: `postgres` (or custom)
   - **Region**: Choose closest to you
   - **Plan**: Free
3. Click **Create Database**
4. Wait for it to provision (~2 minutes)
5. Copy the **Internal Database URL** (starts with `postgresql://`)

### Initialize the Database

1. Go to the database's **Shell** tab in Render
2. Paste and run the contents of `backend/schema.sql`
3. Verify tables were created:
   ```sql
   \dt
   ```

---

## Step 2: Set Up Redis (Upstash)

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a new Redis database
3. Copy the **Redis URL** (format: `rediss://default:password@host:port`)

---

## Step 3: Deploy Backend

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `meeting-room-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Plan**: Free

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   
   DB_HOST=<from Step 1 - extract host from Internal URL>
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=<from Step 1>
   DB_NAME=meeting_room_db
   
   REDIS_HOST=<from Step 2 - extract host>
   REDIS_PORT=<from Step 2 - extract port>
   REDIS_PASSWORD=<from Step 2>
   
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM="Smart Room Booking <noreply@smartbooking.com>"
   
   JWT_SECRET=<generate a random 32+ character string>
   JWT_EXPIRES_IN=1h
   REFRESH_TOKEN_SECRET=<generate another random string>
   REFRESH_TOKEN_EXPIRES_IN=7d
   ```

5. Click **Create Web Service**
6. Wait for deployment (~5 minutes)
7. Copy the backend URL (e.g., `https://meeting-room-backend.onrender.com`)

---

## Step 4: Deploy Frontend

### Option A: Static Site (Recommended - Faster & Free)

1. Go to Render Dashboard → **New** → **Static Site**
2. Connect your repository
3. Configure:
   - **Name**: `meeting-room-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://meeting-room-backend.onrender.com
   ```

5. Click **Create Static Site**

### Option B: Docker Web Service (If you need server-side features)

1. Go to Render Dashboard → **New** → **Web Service**
2. Configure:
   - **Name**: `meeting-room-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `frontend/Dockerfile`

3. Click **Create Web Service**

---

## Step 5: Update Backend CORS

After frontend is deployed:

1. Go to your backend service in Render
2. Update `CORS_ORIGIN` environment variable to your frontend URL
3. Click **Save Changes** (this will redeploy)

---

## Step 6: Configure Frontend API URL

Create a `.env.production` file in `frontend/`:

```env
VITE_API_URL=https://meeting-room-backend.onrender.com
```

Commit and push this file to trigger a redeploy.

---

## Important Notes

### Free Tier Limitations
- **Backend/Database sleep after 15 minutes of inactivity**
- First request after sleep takes ~30 seconds to wake up
- 750 hours/month of runtime (enough for 1 service running 24/7)

### Upgrade Recommendations
For production use:
- Upgrade to **Starter Plan** ($7/month per service) to avoid sleep
- Use **Render's Redis** when available, or **Redis Cloud** paid tier

### WebSocket Support
Render's free tier supports WebSockets, but connections may drop during sleep. Consider:
- Adding reconnection logic (already in your `SocketContext`)
- Upgrading to paid tier for production

---

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure database is accessible

### Frontend can't connect to backend
- Check CORS_ORIGIN matches frontend URL exactly
- Verify VITE_API_URL is correct
- Check browser console for errors

### Database connection fails
- Use **Internal Database URL** (not External)
- Verify DB credentials in environment variables

---

## Alternative: Deploy Everything with Docker Compose

If you want to deploy to a VPS (DigitalOcean, AWS, etc.):

1. SSH into your server
2. Install Docker and Docker Compose
3. Clone your repository
4. Update `docker-compose.yaml` with production values
5. Run:
   ```bash
   docker-compose up -d
   ```

---

## Post-Deployment Checklist

- [ ] Database initialized with schema
- [ ] Backend is running and accessible
- [ ] Frontend is deployed and loads
- [ ] Can register a new user
- [ ] Can login
- [ ] Can view rooms
- [ ] Can create a booking
- [ ] WebSocket updates work
- [ ] Email notifications work (if configured)

---

## Monitoring

Render provides:
- **Logs**: View real-time logs in dashboard
- **Metrics**: CPU, Memory, Request count
- **Alerts**: Set up email alerts for downtime

For production, consider:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Uptime monitoring** (UptimeRobot, Pingdom)
