#!/bin/bash
set -e

SERVER="root@107.174.147.10"
MOLTIVERSE_DOMAIN="myskills2026.ddttupupo.buzz"
BLITZ_DOMAIN="myskillsboss2026.ddttupupo.buzz"
DEPLOY_DIR="/var/www/myskills-frontend"
FRONTEND_DIR="/Volumes/Kingstone/workspace/rebel-agent-skills/frontend"

echo "========================================="
echo "Deploying MySkills Frontend"
echo "========================================="
echo "Moltiverse: $MOLTIVERSE_DOMAIN"
echo "Blitz Pro: $BLITZ_DOMAIN"
echo "Server: $SERVER"
echo ""

# 1. Create deployment package
echo "Creating deployment package..."
mkdir -p /tmp/myskills-frontend-deploy

# Copy Next.js build output
cp -r $FRONTEND_DIR/.next /tmp/myskills-frontend-deploy/
cp -r $FRONTEND_DIR/public /tmp/myskills-frontend-deploy/
cp -r $FRONTEND_DIR/node_modules /tmp/myskills-frontend-deploy/
cp $FRONTEND_DIR/package.json /tmp/myskills-frontend-deploy/
cp -r $FRONTEND_DIR/app /tmp/myskills-frontend-deploy/
cp -r $FRONTEND_DIR/components /tmp/myskills-frontend-deploy/
cp -r $FRONTEND_DIR/lib /tmp/myskills-frontend-deploy/
cp $FRONTEND_DIR/next.config.ts /tmp/myskills-frontend-deploy/
cp $FRONTEND_DIR/tsconfig.json /tmp/myskills-frontend-deploy/
cp $FRONTEND_DIR/postcss.config.mjs /tmp/myskills-frontend-deploy/
cp $FRONTEND_DIR/tailwind.config.ts /tmp/myskills-frontend-deploy/ 2>/dev/null || true

# Copy database
cp -r /Volumes/Kingstone/workspace/rebel-agent-skills/database /tmp/myskills-frontend-deploy/

echo "✓ Package created"

# 2. Upload to server
echo "Uploading to server..."
ssh $SERVER "mkdir -p $DEPLOY_DIR"

rsync -avz --delete \
  --exclude 'node_modules/.prisma' \
  /tmp/myskills-frontend-deploy/ $SERVER:$DEPLOY_DIR/

echo "✓ Upload complete"

# 3. Setup server environment
echo "Configuring server..."
ssh $SERVER << ENDSSH
cd $DEPLOY_DIR

# Install production dependencies only
npm ci --production

# Create logs directory
mkdir -p logs

# Setup PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Stop existing service
pm2 delete myskills-frontend 2>/dev/null || true

# Start Next.js in production mode
NODE_ENV=production pm2 start npm --name myskills-frontend -- start

# Save PM2 config
pm2 save
pm2 startup
ENDSSH

echo "✓ Server configured"

# 4. Configure Nginx
echo "Configuring Nginx..."
ssh $SERVER "cat > /etc/nginx/sites-available/myskills-frontend << 'NGINX_EOF'
# Moltiverse (Feb 15 submission)
server {
    listen 80;
    server_name $MOLTIVERSE_DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
}

# Blitz Pro (Feb 28 submission)  
server {
    listen 80;
    server_name $BLITZ_DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/myskills-frontend /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
"

echo "✓ Nginx configured"

# 5. SSL setup prompt
echo ""
echo "========================================="
echo "SSL Certificate Setup"
echo "========================================="
echo "Run these commands to setup SSL:"
echo ""
echo "ssh $SERVER 'certbot --nginx -d $MOLTIVERSE_DOMAIN'"
echo "ssh $SERVER 'certbot --nginx -d $BLITZ_DOMAIN'"
echo ""

# Cleanup
rm -rf /tmp/myskills-frontend-deploy

echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Access your sites:"
echo "  Moltiverse: http://$MOLTIVERSE_DOMAIN"
echo "  Blitz Pro:   http://$BLITZ_DOMAIN"
echo ""
echo "View logs: ssh $SERVER 'pm2 logs myskills-frontend'"
echo "Restart:    ssh $SERVER 'pm2 restart myskills-frontend'"
echo ""
