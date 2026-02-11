#!/bin/bash
set -e

SERVER="root@107.174.147.10"
FRONTEND_DIR="/Volumes/Kingstone/workspace/rebel-agent-skills/frontend"

echo "Quick deploy to server..."

# Stop PM2 app
ssh $SERVER "pm2 delete myskills 2>/dev/null || true"

# Create target directory
ssh $SERVER "mkdir -p /var/www/myskills"

# Copy frontend files (excluding node_modules initially)
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.next' \
  $FRONTEND_DIR/ $SERVER:/var/www/myskills/

# Upload the .next directory separately
echo "Uploading .next build..."
rsync -avz $FRONTEND_DIR/.next/ $SERVER:/var/www/myskills/.next/

# Install dependencies on server
ssh $SERVER << 'ENDSSH'
cd /var/www/myskills
npm install --legacy-peer-deps --production 2>&1 | tail -10
ENDSSH

# Start app
ssh $SERVER << 'ENDSSH'
cd /var/www/myskills
NODE_ENV=production pm2 start "npx next start -p 3000" --name myskills
pm2 save
pm2 list
ENDSSH

echo "Deploy complete!"
