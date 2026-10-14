# 🚀 Deploying Full-Stack Codeethos to a Hostinger VPS with Custom Domain

This guide provides end-to-end instructions for deploying your **Codeethos** platform (FastAPI backend + SQLite database + Vite SPA frontend) onto an Ubuntu/Debian Hostinger VPS with Nginx, HTTPS (Let's Encrypt), and automatic background services.

---

## 📋 Architecture on VPS

```
Internet (HTTPS 443)
       │
       ▼
 ┌─────────── Nginx (Reverse Proxy & Static Web Server) ───────────┐
 │                                                                 │
 │   /api/*  ──────────────►  Uvicorn / FastAPI (:8000)            │
 │                            ├── SQLite Database (WAL mode)       │
 │                            └── JWT Authentication               │
 │                                                                 │
 │   /*      ──────────────►  Vite Production Static SPA Bundle    │
 │                            (In-Browser Code Execution Engine)   │
 └─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites
1. **Hostinger VPS** (e.g., Ubuntu 22.04 or 24.04 LTS).
2. **Domain Name** (purchased through Hostinger, Namecheap, Cloudflare, etc.).
3. **VPS IP Address** (found in your Hostinger VPS Dashboard, e.g., `123.45.67.89`).

---

## 🌐 Step 1: Point Your Domain DNS to Your VPS

In your domain registrar's DNS management console, create two **A Records**:

| Type | Host / Name | Value / Points to | TTL |
|---|---|---|---|
| **A** | `@` (root) | `YOUR_VPS_IP` | Automatic / 300s |
| **A** | `www` | `YOUR_VPS_IP` | Automatic / 300s |

*(DNS propagation usually takes 5 to 30 minutes).*

---

## 💻 Step 2: Connect to Your VPS via SSH & Install Packages

Open PowerShell or terminal on your local machine:

```bash
ssh root@YOUR_VPS_IP
```

Update your server and install required packages (Python 3, Nginx, Node.js, Git, UFW):

```bash
# Update repositories
sudo apt update && sudo apt upgrade -y

# Install Python 3, venv, Git, Nginx, and UFW
sudo apt install -y python3 python3-pip python3-venv nginx git ufw curl sqlite3

# Install Node.js 22 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify your installed versions:
```bash
python3 --version
node -v
npm -v
nginx -v
```

---

## 📦 Step 3: Clone Codebase & Set Up Python Virtual Environment

Clone your project to `/var/www/codeethos`:

```bash
cd /var/www
git clone <YOUR_GIT_REPO_URL> codeethos
cd /var/www/codeethos
```

Create and configure the Python virtual environment for FastAPI:

```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Verify the database initializes properly:

```bash
python3 -c "from server.database import init_db; init_db(); print('Database OK!')"
deactivate
```

---

## ⚙️ Step 4: Configure Systemd Service for FastAPI API

Create a dedicated systemd service so the FastAPI backend runs continuously and restarts automatically on reboot or crashes:

```bash
sudo nano /etc/systemd/system/codeethos-api.service
```

Paste the following definition:

```ini
[Unit]
Description=Codeethos FastAPI Backend Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/codeethos
Environment="PATH=/var/www/codeethos/venv/bin"
ExecStart=/var/www/codeethos/venv/bin/uvicorn server.main:app --host 127.0.0.1 --port 8000 --workers 2

Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Assign appropriate file ownership to `www-data`:

```bash
sudo chown -R www-data:www-data /var/www/codeethos/server
sudo chmod -R 775 /var/www/codeethos/server
```

Start and enable the service:

```bash
sudo systemctl daemon-reload
sudo systemctl start codeethos-api
sudo systemctl enable codeethos-api
sudo systemctl status codeethos-api
```

---

## 🔨 Step 5: Build the Frontend Production Assets

Enter the `web` directory, install packages, and build the static SPA:

```bash
cd /var/www/codeethos/web
npm install
npm run build
```

The production assets will be generated in `/var/www/codeethos/web/dist`.

Ensure permissions for the web server:
```bash
sudo chown -R www-data:www-data /var/www/codeethos/web/dist
sudo chmod -R 755 /var/www/codeethos/web/dist
```

---

## 🌐 Step 6: Configure Nginx with Reverse Proxy & SPA Routing

Create a new Nginx server configuration:

```bash
sudo nano /etc/nginx/sites-available/codeethos
```

Paste the following configuration (replace `yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/codeethos/web/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;

    # Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static Assets Cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # SPA Client-Side Routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the configuration and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/codeethos /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Step 7: Enable Free SSL (HTTPS) with Certbot

Install Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtain and configure the SSL certificate:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

- Enter your email address for certificate alerts.
- Choose to automatically redirect HTTP traffic to HTTPS.

Certbot automatically schedules auto-renewals in systemd:
```bash
sudo systemctl status certbot.timer
```

---

## 🛡️ Step 8: Configure Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

---

## 💾 Step 9: Automated Daily Database Backups (Cron)

Set up a daily automated backup of your SQLite database:

```bash
sudo crontab -e
```

Add this line to back up the database every day at 3:00 AM:

```cron
0 3 * * * sqlite3 /var/www/codeethos/server/codeethos.db ".backup '/var/backups/codeethos_$(date +\%Y\%m\%d).db'"
```

---

## 🔄 Zero-Downtime Updates (Future Deployments)

To update your production site with new code, language tracks, or lessons:

```bash
cd /var/www/codeethos
git pull
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart codeethos-api

cd web
npm install
npm run build
sudo systemctl reload nginx
```
