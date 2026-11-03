# 03-Developer Playbook — Build, Packaging & Cloud Deployment

This guide outlines the TypeScript compilation process, containerization with Docker, and automated deployment pipelines for the Threadly TypeScript Server.

---

## 1. TypeScript Compilation & Packaging

The application compiles from ES Module TypeScript (`src/`) into production-ready JavaScript (`dist/`) using the native TypeScript compiler (`tsc`).

### A. Compiler Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "types": ["node"],
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### B. Build Commands
```bash
# 1. Typecheck and compile into dist/
npm run build

# 2. Verify compilation output
# dist/server.js
# dist/app.js
# dist/routes/...
# dist/controller/...
# dist/services/...
# dist/repo/...

# 3. Launch compiled production bundle
npm start
# Executes: node dist/server.js
```

---

## 2. Docker Containerization

The server packages into a production image based on the lightweight `node:22-slim` base image:

### A. Container Specification (`Dockerfile`)
```dockerfile
FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8001

CMD ["npm", "start"]
```

### B. Building & Running the Image
```bash
# Build the container image
docker build -t threadly-ts-server:latest .

# Run the container
docker run -d \
  --name threadly-server \
  -p 8001:8001 \
  --env-file .env \
  --restart unless-stopped \
  threadly-ts-server:latest

# Tail container logs
docker logs -f threadly-server
```

---

## 3. Cloud Deployment (Render Infrastructure)

The project configures Infrastructure-as-Code (IaC) via `render.yaml` for zero-downtime deployment on Render:

### A. Infrastructure Blueprint (`render.yaml`)
```yaml
services:
  - type: web
    name: threadly-server
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: node dist/server.js
    envVars:
      - key: NODE_ENV
        value: production
```

### B. Production Health Checks & Zero-Downtime Deploys
- **Health Check Endpoint**: `GET /` returns `"welcome"` (HTTP 200 OK).
- **Environment Variables**: Configure secrets (`DB_PASSWORD`, `JWT_SECRET`, `CLOUDINARY_API_SECRET`, `FIREBASE_SERVICE_ACCOUNT_JSON`) securely in the Render dashboard.
- **Port Binding**: Render injects the assigned external port into `process.env.PORT`, automatically picked up by `getPort()` in `src/utils/envValuesAccessInterface.ts`.
