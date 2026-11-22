# OneBox — Personal Information Organizer

OneBox is a modern, lightweight personal information organizer that brings your notes, tasks, events, and deadlines into one unified inbox. Extract text from screenshots using Tesseract OCR, organize unstructured notes with Gemini AI, store actual files (notices, PDFs, screenshots) in AWS S3 with one-click downloads, and stay on top of schedules with smart reminders.

---

## Key Features

- 📝 **Notes & Tasks**: Fast capture with categorization (`NOTE`, `TASK`, `EVENT`, `DEADLINE`, `REMINDER`).
- 📷 **Screenshot OCR**: Extract text directly from uploaded or pasted (`Ctrl+V`) screenshots via Tesseract OCR.
- ✨ **Gemini AI Intelligence**: Auto-derive titles, structured summaries, actionable checklists, and detect missing details using `gemini-3.5-flash`.
- ⏰ **Smart Reminders & Deadlines**: Natural language date recognition, urgency filters (`Overdue`, `Due Today`, `Upcoming`), snooze options, audio chimes, and browser notifications.
- ☁️ **AWS S3 Object Storage**: Upload and store screenshots, notices, PDFs, and documents in AWS S3 with instant one-click downloading and metadata tracking in SQLite. Includes an automatic local storage fallback.
- 🎨 **SaaS Web Experience**: Responsive React interface with Tailwind CSS, Lucide icons, and smooth Motion animations.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Motion, Lucide React
- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy
- **Database**: SQLite (`backend/onebox.db`)
- **Cloud Storage**: AWS S3 via `boto3` (with local fallback)
- **AI & OCR**: Google Gemini API (`google-genai`), Tesseract OCR (`pytesseract`, Pillow)

---

## Quick Start

### 1. Environment Setup

Create a `.env` file in the project root (see [`.env.example`](file:///c:/Users/Lenovo/Desktop/Onebox/.env.example)):

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash

# AWS S3 Object Storage
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET=onebox-objects-ayush
```

### 2. Start the Backend

Open a terminal:

```cmd
cd backend
pip install -r requirements.txt
py -3.13 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- API Base: `http://127.0.0.1:8000`
- Swagger Documentation: `http://127.0.0.1:8000/docs`

### 3. Start the Frontend

Open a second terminal:

```cmd
cd frontend
npm install
npm run dev
```

- Frontend App: `http://localhost:5173`

---

## Testing & Build

Run the full automated backend test suite (testing OCR, Gemini AI, Reminders, and AWS S3 storage):

```cmd
py -3.13 backend/test_backend.py
```

Build the frontend for production:

```cmd
cd frontend
npm run build
```

---

## REST API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check & service availability (OCR, AI, S3) |
| `GET` | `/api/items` | List items (supports `?search=` and `?category=`) |
| `POST` | `/api/items` | Create a new item (with optional reminder date & S3 file metadata) |
| `PATCH` | `/api/items/{id}` | Edit title, content, category, reminder date, or attachment |
| `DELETE` | `/api/items/{id}` | Delete an item and remove its associated S3 object |
| `POST` | `/api/items/{id}/complete` | Toggle item completion status |
| `POST` | `/api/items/{id}/snooze` | Snooze a reminder by X minutes or set a custom time |
| `GET` | `/api/reminders/summary` | Summary counts of overdue, today, upcoming, and completed items |
| `GET` | `/api/reminders` | Retrieve items filtered by urgency (`overdue`, `today`, `upcoming`) |
| `POST` | `/api/upload` | Upload a file/screenshot to S3 (auto-runs OCR for images) |
| `GET` | `/api/items/{id}/download` | Stream and download an item's attached object |
| `GET` | `/api/items/{id}/presigned-url` | Generate a direct S3 presigned download URL |
| `GET` | `/api/s3/status` | Check AWS S3 connectivity and bucket status |
| `POST` | `/api/ai/extract` | Analyze unstructured text with Gemini AI |
| `GET` | `/api/ai/status` | Check Gemini AI configuration status |
| `POST` | `/api/ocr` | Extract raw text from an uploaded screenshot |
| `GET` | `/api/ocr/status` | Check Tesseract OCR installation status |

---

## Project Structure

```text
OneBox/
├── backend/
│   ├── main.py          # FastAPI endpoints & validation schemas
│   ├── database.py      # SQLAlchemy model, SQLite connection, auto-migrations
│   ├── s3.py            # AWS S3 client, stream downloader, local fallback
│   ├── ai.py            # Gemini AI integration (google-genai SDK)
│   ├── ocr.py           # Tesseract OCR engine (pytesseract + Pillow)
│   ├── smart_dates.py   # Natural language date parsing & urgency calculations
│   ├── test_backend.py  # Automated regression test suite
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/  # React components (Workspace, Landing Page sections)
│   │   ├── utils/       # Reminders, sound chimes, notification helpers
│   │   ├── api.ts       # Type-safe API client
│   │   └── App.tsx      # Main application router
│   ├── package.json
│   └── vite.config.ts
├── .env.example         # Environment variables template
├── .gitignore
└── README.md
```
