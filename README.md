# PolyMind Monorepo

This repository is now structured as a single-root monorepo for Netlify deployment.

## Project Structure

- **`src/`**: React frontend source code.
- **`api/`**: Python FastAPI backend (including legacy `app` code).
- **`public/`**: Public assets.
- **`manifest.json` / `vite.config.js`**: Frontend configuration.
- **`netlify.toml`**: Deployment configuration.

## Prerequisites

- Node.js (v18+)
- Python (v3.9+)

## Getting Started

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
pip install -r api/requirements.txt
```

### 2. Run Locally

Start both the frontend and backend servers with a single command:

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000` (proxied via `/api`)

## Deployment

The project is configured for seamless deployment on Netlify.
Simply connect this repository to your Netlify account, and it will automatically detect the `netlify.toml` configuration.
