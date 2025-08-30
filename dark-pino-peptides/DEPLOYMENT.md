# Deployment Guide for darkpinopeptides.com

## Domain Setup

Your domain: **www.darkpinopeptides.com**

## Quick Deployment Options

### Option 1: Vercel (Recommended - FREE)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy Frontend:**
   ```bash
   cd /Users/kevin/dark-pino-peptides
   vercel
   ```
   - Follow prompts
   - Set production domain to darkpinopeptides.com

3. **Deploy Backend (Serverless):**
   ```bash
   cd backend
   vercel
   ```

### Option 2: Netlify + Render

1. **Frontend on Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your frontend folder
   - Add custom domain: darkpinopeptides.com

2. **Backend on Render:**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repo
   - Set environment variables from .env.production

### Option 3: Traditional VPS (DigitalOcean, Linode)

1. **Get a VPS** ($5-10/month)
2. **Install Node.js & MongoDB**
3. **Use PM2 for process management**
4. **Setup Nginx as reverse proxy**
5. **Add SSL with Let's Encrypt**

## DNS Configuration

Add these records to your domain:

```
Type    Name    Value
A       @       Your-Server-IP
A       www     Your-Server-IP
CNAME   api     Your-Backend-URL
```

## Environment Variables to Update

Before deploying, update these in your code:

1. **Frontend (script.js, solana-payment-flow.js):**
   - API endpoints from localhost:5002 to api.darkpinopeptides.com
   - Already partially done

2. **Backend (.env.production):**
   - MONGODB_URI - Get from MongoDB Atlas (free)
   - JWT_SECRET - Generate a secure random string
   - CLIENT_URL - Set to https://www.darkpinopeptides.com

## MongoDB Atlas Setup (FREE)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create free cluster
3. Get connection string
4. Update MONGODB_URI in .env.production

## SSL Certificate

- **Vercel/Netlify:** Automatic SSL
- **VPS:** Use Certbot for Let's Encrypt

## Post-Deployment Checklist

- [ ] Domain pointing to hosting
- [ ] SSL certificate active
- [ ] MongoDB connected
- [ ] Environment variables set
- [ ] Admin panel accessible at /admin.html
- [ ] Solana payments working
- [ ] Order creation working
- [ ] Email notifications (optional)

## Monitoring

- Use [UptimeRobot](https://uptimerobot.com) for free monitoring
- Check MongoDB Atlas metrics
- Monitor Solana transactions on explorer

## Support

- Domain issues: Contact your registrar
- Hosting issues: Check provider documentation
- Payment issues: Check Solana network status

---

🚀 Your site will be live at: **https://www.darkpinopeptides.com**