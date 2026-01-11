# BeautyGPT

La tua consulente skincare AI personale. Trova i prodotti perfetti per la tua pelle con l'aiuto dell'intelligenza artificiale.

## Features

- Chat AI con consigli personalizzati
- Database di 50+ prodotti skincare curati
- Link diretti Amazon per acquisti
- Interfaccia mobile-friendly
- Risposte in italiano

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python
- **AI**: Groq API (Llama 3.3 70B)
- **Deploy**: Vercel (frontend) + Render (backend)

## Setup Locale

### Backend
```bash
cd backend
pip install -r requirements.txt
export GROQ_API_KEY="your_key"
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deploy

### Backend (Render)
1. Crea nuovo Web Service su render.com
2. Connetti il repo GitHub
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Aggiungi environment variable: `GROQ_API_KEY`

### Frontend (Vercel)
1. Importa il repo su vercel.com
2. Root directory: `frontend`
3. Aggiungi environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`

## Autore

Orazio Oztas - [GitHub](https://github.com/oraziooztas)
