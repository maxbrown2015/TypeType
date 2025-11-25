# Type Type Deployment Guide

This guide covers how to deploy Type Type to production with multiplayer support.

## Option 1: Solo Play Only (Vercel)

Easiest deployment - frontend only, no backend needed.

### Steps:
1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project" → Import your repo
4. Deploy (no environment variables needed)

**Result**: `https://your-project.vercel.app` - works for single player only

---

## Option 2: Full Multiplayer (Recommended)

Frontend on Vercel + Backend on Railway/Render

### 2A: Deploy Frontend to Vercel

```bash
# Add .env.local
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

Then push to GitHub and deploy via Vercel dashboard.

### 2B: Deploy Backend to Railway

1. Visit [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your TypeType repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Port**: `3001`

5. Add Environment Variables in Railway Dashboard:
   ```
   PORT=3001
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```

6. Deploy

**Note**: Railway gives you a free tier with some monthly credits.

### 2C: Deploy Backend to Render

1. Visit [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: typetype-server
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free (or Starter for production)

5. Add Environment Variables:
   ```
   PORT=3001
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```

6. Deploy

**Note**: Render automatically assigns a URL like `https://typetype-server.onrender.com`

---

## Testing the Deployment

1. Frontend: Visit `https://your-project.vercel.app`
2. Click "Play Online"
3. Create a room (get room code)
4. Open another browser tab/incognito window
5. Join the same room
6. Both players should be able to type and play

---

## Troubleshooting

### Multiplayer not working
- Check `NEXT_PUBLIC_SOCKET_URL` is set correctly (should match backend URL)
- Verify backend is running (check service logs)
- Test backend health: `curl https://your-backend.railway.app/health`

### CORS errors
- Update `CLIENT_URL` in server.js environment to match your frontend URL
- Restart backend

### Slow connection
- Enable compression in server.js (add `compress: true` to socket.io options)
- Use CDN for static assets

---

## Cost Breakdown

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Vercel | 100GB/month | Generous for frontend |
| Railway | $5/month credit | Good for backend |
| Render | Free + paid | Limited free tier |

**Estimated monthly cost**: $0-5 for hobbyist use

---

## Monitoring

### Vercel Dashboard
- View analytics and performance
- Check error logs

### Railway/Render Logs
```bash
# View backend logs in real-time
# Available in service dashboard
```

---

## Scaling Tips

If you need to handle many players:

1. **Database**: Add PostgreSQL to store rooms and scores
2. **Load Balancing**: Scale backend to multiple instances
3. **CDN**: Cache static assets with Vercel Automatic CDN
4. **Redis**: Cache game state for faster sync

These can be added later as needed.

---

## Custom Domain

### Vercel
- Go to Project Settings → Domains
- Add custom domain (requires DNS changes)

### Railway/Render  
- Similar process in service settings
- Point your custom domain to service URL

---

## Questions?

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
