# Deployment Guide

This guide covers deploying the Production Tracking System to a production environment.

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- PostgreSQL 14+
- Node.js 18+
- Nginx or Caddy (for reverse proxy)
- Domain name (optional but recommended)

## Server Setup

### 1. Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Database Setup

### 1. Create Database and User
```bash
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE production_tracker;
CREATE USER tracker_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE production_tracker TO tracker_user;
\q
```

### 2. Configure PostgreSQL for Remote Connections (if needed)
Edit `/etc/postgresql/14/main/postgresql.conf`:
```
listen_addresses = 'localhost'
```

Edit `/etc/postgresql/14/main/pg_hba.conf`:
```
local   production_tracker    tracker_user                     md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Application Deployment

### 1. Clone and Setup
```bash
# Create application directory
sudo mkdir -p /var/www/production-tracker
sudo chown $USER:$USER /var/www/production-tracker
cd /var/www/production-tracker

# Clone repository
git clone <your-repo-url> .

# Install dependencies
npm install
```

### 2. Configure Environment
```bash
# Backend environment
cp backend/.env.example backend/.env
nano backend/.env
```

Update with production values:
```env
PORT=3000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=production_tracker
DB_USER=tracker_user
DB_PASSWORD=your_secure_password

CORS_ORIGIN=https://yourdomain.com
```

### 3. Run Database Migrations
```bash
npm run migrate --workspace=backend
```

### 4. Seed Initial Data (Optional)
```bash
npm run seed --workspace=backend
```

### 5. Build Frontend
```bash
npm run build --workspace=frontend
```

## Process Management with PM2

### 1. Install PM2
```bash
sudo npm install -g pm2
```

### 2. Create PM2 Ecosystem File
Create `ecosystem.config.cjs`:
```javascript
module.exports = {
  apps: [{
    name: 'production-tracker',
    cwd: '/var/www/production-tracker/backend',
    script: 'src/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/production-tracker-error.log',
    out_file: '/var/log/pm2/production-tracker-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
}
```

### 3. Start Application
```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start application
pm2 start ecosystem.config.cjs

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup systemd
# Run the command it outputs
```

### 4. Monitor Application
```bash
# View logs
pm2 logs

# Check status
pm2 status

# Monitor resources
pm2 monit
```

## Nginx Configuration

### 1. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/production-tracker
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend static files
    root /var/www/production-tracker/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
```

### 2. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/production-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificate (Optional but Recommended)

### Using Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

Certbot will automatically configure Nginx for HTTPS.

## Firewall Configuration

```bash
# Allow SSH (if not already allowed)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable
```

## Database Backups

### 1. Create Backup Script
```bash
sudo nano /usr/local/bin/backup-production-tracker.sh
```

Add script:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/production-tracker"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U tracker_user -h localhost production_tracker | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-production-tracker.sh
```

### 2. Schedule Daily Backups
```bash
sudo crontab -e

# Add line for daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-production-tracker.sh
```

## Monitoring and Maintenance

### Application Logs
```bash
# PM2 logs
pm2 logs production-tracker

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Health Checks
```bash
# Check application health
curl http://localhost:3000/health

# Check Nginx status
sudo systemctl status nginx

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Resource Monitoring
```bash
# CPU and memory usage
htop

# Disk usage
df -h

# Database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('production_tracker'));"
```

## Updating the Application

### 1. Pull Latest Changes
```bash
cd /var/www/production-tracker
git pull origin main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Migrations (if any)
```bash
npm run migrate --workspace=backend
```

### 4. Rebuild Frontend
```bash
npm run build --workspace=frontend
```

### 5. Restart Backend
```bash
pm2 restart production-tracker
```

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
pm2 logs production-tracker

# Check environment variables
pm2 env production-tracker

# Test database connection
psql -U tracker_user -h localhost -d production_tracker
```

### Frontend Not Loading
```bash
# Check Nginx configuration
sudo nginx -t

# Check file permissions
ls -la /var/www/production-tracker/frontend/dist

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE datname='production_tracker';"

# Check pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

### High Memory Usage
```bash
# Restart PM2 processes
pm2 restart all

# Check memory limits in ecosystem.config.js
# Adjust max_memory_restart if needed
```

## Security Checklist

- [ ] PostgreSQL uses strong password
- [ ] Firewall configured (UFW)
- [ ] SSL certificate installed
- [ ] Application runs as non-root user
- [ ] Regular backups configured
- [ ] Environment variables secured (.env not in git)
- [ ] Nginx configured with security headers
- [ ] PostgreSQL not exposed to internet
- [ ] Regular system updates scheduled

## Performance Tuning

### PostgreSQL Configuration
Edit `/etc/postgresql/14/main/postgresql.conf`:
```
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
max_connections = 100
```

### Node.js Process Count
Adjust `instances` in `ecosystem.config.cjs` based on CPU cores:
```javascript
instances: 2  // Use CPU count - 1
```

### Nginx Caching
Add to Nginx configuration for static assets:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Support

For issues or questions during deployment:
1. Check application logs
2. Review this deployment guide
3. Contact system administrator
