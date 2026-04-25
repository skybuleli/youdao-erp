#!/bin/bash
# Setup local D1 database for development
set -e

cd "$(dirname "$0")/.."

echo "🗄️  Setting up local D1 database..."

# Apply migrations
echo "📦 Applying migrations..."
npx wrangler d1 migrations apply youdao-erp-db --local

# Check if admin user exists
SEED_SQL="INSERT INTO users (username, password_hash, name, role) VALUES ('admin', '\$2a\$10\$iVJ343sWn8fCRRbZjMiRve28wqrb2X8zR1jsAvH2DY4C.U9B/t.Ni', '管理员', 'admin')"

echo "🌱 Seeding data (safe to re-run)..."
npx wrangler d1 execute youdao-erp-db --local --command="INSERT OR IGNORE INTO users (username, password_hash, name, role) VALUES ('admin', '\$2a\$10\$iVJ343sWn8fCRRbZjMiRve28wqrb2X8zR1jsAvH2DY4C.U9B/t.Ni', '管理员', 'admin')"

echo "🎉 Local database setup complete!"
echo "   Login: admin / admin123"
