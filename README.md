# CareIQ — Healthcare RAG Demo

AI-powered patient monitoring dashboard. Care teams ask natural language questions instead of navigating filters.

## Quick Start

### 1. Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate

# Install dependencies (use legacy resolver to avoid resolution-too-deep errors)
python3 -m pip install -r requirements.txt --use-deprecated=legacy-resolver

# Add your Groq API key (or other LLM provider key) to a .env file
echo "GROQ_API_KEY=your-key-here" >> .env

# Start the API server
python3 -m uvicorn main:app --reload --port 8000
```

> **Note:** Do not use `pip install` or `python` directly — use `python3 -m pip` and `python3` to ensure the venv interpreter is used.

The backend seeds 8 demo patients and ingests the RAG knowledge base on first run.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## Demo Flow

1. **Dashboard** (/) — See 8 patients with statuses, filters, and the chat panel on the right
   - Ask: *"Show me patients with abnormal patterns"*
   - Ask: *"Who needs attention right now?"*

2. **Patient Detail** (/patients/1) — Click Sarah Mitchell (Critical)
   - Live vitals update every 2 seconds via WebSocket
   - Ask: *"Why is this patient flagged?"*
   - Ask: *"Summarize the last 24h vitals"*
   - Ask: *"Is the current SpO₂ concerning?"*

3. **Architecture** (/architecture) — Click each step to see how RAG works
   - Shows: Question → Embed → ChromaDB → Context Assembly → Claude → Streaming Response

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui, Recharts |
| Backend | FastAPI, SQLite, SQLAlchemy, WebSockets |
| RAG | LangChain, ChromaDB, all-MiniLM-L6-v2 embeddings |
| LLM | Claude claude-sonnet-4-6 (Anthropic) with streaming |

## Demo Patients

| Patient | Condition | Status |
|---------|-----------|--------|
| Sarah Mitchell | Sepsis Early-Warning | Critical |
| James Okafor | Post-Op Cardiac | Stable |
| Maria Gonzalez | COPD Exacerbation | Warning |
| Robert Hawkins | Hypertensive Emergency | Warning |
| Eleanor Voss | Pneumonia | Stable |
| Daniel Park | DKA — Resolving | Stable |
| Patricia Wu | NSTEMI Post-Cath | Warning |
| Thomas Reed | Post-Op Appendectomy | Stable |
