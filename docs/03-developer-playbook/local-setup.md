# 03-Developer Playbook — Local Environment Setup & Configuration

This guide walks through configuring a local development environment, provisioning MySQL and Redis, setting environment variables, and starting the Threadly TypeScript Server.

---

## 1. System Prerequisites

| Tool | Version | Verification Command | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>=20.x` | `node -v` | Core JavaScript runtime with native ESM and test runner support. |
| **npm** | `>=10.x` | `npm -v` | Package dependency manager. |
| **MySQL Server** | `8.x` | `mysql --version` | Primary relational database engine. |
| **Redis Server** | `6.x+` or Docker | `redis-cli ping` | In-memory session and OTP cache. |
| **Docker** | Latest | `docker --version` | Containerized database and production build testing. |

---

## 2. Environment Configuration (`.env`)

Create a `.env` file in the root of the server repository (`Server_typescript_migration/server/.env`):

```ini
# Server Configuration
PORT=8001
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=threadly

# Redis Cache Configuration
REDIS_URL=redis://127.0.0.1:6379

# Cryptography & Security Secrets
JWT_SECRET=super_secret_jwt_key_threadly_2026
ADMIN_JWT_SECRET=super_secret_admin_key_threadly_admin

# Cloudinary CDN Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# EazyOTP / SMS Provider
EAZYOTP_KEY=your_eazyotp_secret_key

# Firebase Cloud Messaging Service Account (JSON string or path)
FIREBASE_SERVICE_ACCOUNT_JSON={"type": "service_account", ...}
```

---

## 3. Database Initialization

1. Connect to your local MySQL instance:
   ```bash
   mysql -u root -p
   ```
2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS threadly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE threadly;
   ```
3. Import the official schema:
   ```bash
   # From Server_typescript_migration/server directory
   mysql -u root -p threadly < schema.txt
   ```

---

## 4. Installation & Local Development Commands

```bash
# 1. Install all dependencies
npm install

# 2. Start development server with hot-reload (tsx + nodemon)
npm run dev

# Console Output:
# [nodemon] starting `tsx src/server.ts`
# connected to database
# running on server port 8001

# 3. Compile TypeScript to JavaScript (dist/)
npm run build

# 4. Run production build locally
npm start

# 5. Execute all test suites
npm test

# 6. Run unit tests only
npm run test:unit

# 7. Run integration tests only
npm run test:integration
```

---

## 5. Docker Containerized Setup

A minimal `Dockerfile` is provided in the repository root:
```bash
# Build the Docker image
docker build -t threadly-server .

# Run container with environment file
docker run -d -p 8001:8001 --env-file .env --name threadly-backend threadly-server
```
