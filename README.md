# OneBox MVP - Personal Information Organizer

OneBox is a modern, lightweight personal information organizer that lets you capture thoughts, notes, tasks, events, and deadlines. It allows extracting text from screenshots using Tesseract OCR and intelligently organizing unstructured content into actionable proposals using Google's **Gemini AI**.

---

## Project Structure

```text
onebox/
├── frontend/
│   ├── public/
│   │   └── logo.png              # OneBox branding icon
│   ├── src/
│   │   ├── App.tsx               # Dashboard, Quick Capture, Screenshot OCR, Gemini AI Review Panel
│   │   ├── api.ts                # REST API client (CRUD + OCR + Gemini AI endpoints)
│   │   ├── index.css             # Tailwind CSS & global styling
│   │   ├── main.tsx              # React root entrypoint
│   │   └── vite-env.d.ts         # Vite client type declarations
│   ├── index.html
│   ├── package.json              # React, Vite, Tailwind CSS, Lucide icons
│   ├── tailwind.config.js        # Navy & Blue design palette
│   └── vite.config.ts            # Vite bundler & reverse proxy configuration
├── backend/
│   ├── main.py                   # FastAPI REST API, validation, OCR, and AI endpoints
│   ├── database.py               # SQLAlchemy models and SQLite connection
│   ├── ocr.py                    # Tesseract OCR engine (Pillow + pytesseract)
│   ├── ai.py                     # Gemini AI intelligence engine (google-genai SDK)
│   ├── requirements.txt          # Python dependencies
│   ├── test_backend.py           # Automated backend test suite (Mocked AI + OCR + CRUD)
│   └── onebox.db                 # SQLite database (excluded from Git)
├── .gitignore
└── README.md
```

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons
- **Backend**: Python 3.10+, FastAPI, Uvicorn
- **Database**: SQLite (persisted at `backend/onebox.db`)
- **ORM**: SQLAlchemy 2.0
- **AI Intelligence**: Google Gemini API via official `google-genai` SDK (`gemini-3.5-flash`)
- **OCR Engine**: Tesseract OCR via `pytesseract` and `Pillow`
- **Communication**: REST API (with CORS support)
- **Environment**: Windows 10/11

---

## Environment Configuration

### Gemini AI Setup

Gemini integration reads the API key exclusively from the `GEMINI_API_KEY` environment variable.

In your PowerShell terminal before starting the backend:
```powershell
$env:GEMINI_API_KEY = "your_actual_gemini_api_key_here"

# (Optional) Model override (defaults to gemini-3.5-flash)
$env:GEMINI_MODEL = "gemini-3.5-flash"
```

*Note: If the key is not set, OneBox will return a clear `503 Service Unavailable` message informing the user that `GEMINI_API_KEY` is needed, while all existing text capture, OCR, and inbox capabilities remain operational.*

---

## Getting Started on Windows

### 1. Backend Setup

Open a PowerShell terminal:

```powershell
# Navigate to the backend directory
cd c:\Users\Lenovo\Desktop\Onebox\backend

# Set your Gemini API key:
$env:GEMINI_API_KEY = "API KEY"

# (Optional) Create and activate a Python virtual environment:
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install required Python dependencies:
pip install -r requirements.txt

# Run the automated backend test suite (Mocked Gemini + OCR + CRUD regression):
python test_backend.py

# Start the FastAPI backend server:
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- Backend API: **`http://127.0.0.1:8000`**
- Interactive Swagger Documentation: **`http://127.0.0.1:8000/docs`**

---

### 2. Frontend Setup

Open a second PowerShell terminal:

```powershell
# Navigate to the frontend directory
cd c:\Users\Lenovo\Desktop\Onebox\frontend

# Install node dependencies (use npm.cmd on Windows):
npm.cmd install

# Start the Vite development server:
npm.cmd run dev
```

- Open your browser at: **`http://localhost:5173`**

---

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/extract` | Extract structured title, category, summary, action items, dates, and clarification flags using Gemini |
| `GET` | `/api/ai/status` | Check if Gemini API key is configured and view active model |
| `POST` | `/api/ocr` | Upload a screenshot image (`multipart/form-data`) and extract raw text via OCR |
| `GET` | `/api/ocr/status` | Check if Tesseract executable is discovered and ready |
| `POST` | `/api/items` | Save an item to inbox (`title`, `content`, `category`) |
| `GET` | `/api/items` | List inbox items (supports `?search=<term>` and `?category=<NOTE\|TASK\|EVENT\|DEADLINE\|OTHER>`) |
| `GET` | `/api/items/{item_id}` | Retrieve a single item by ID |
| `PATCH` | `/api/items/{item_id}` | Edit an item (`title`, `content`, `category`) |
| `DELETE` | `/api/items/{item_id}` | Delete an item by ID (returns `204 No Content`) |

---

## Milestone 3: Gemini AI Workflow

1. **Enter or Extract Text**: Type a note, paste thoughts, or extract text from a screenshot with OCR.
2. **Organize with AI**: Click the **"Organize with AI"** button.
3. **Structured Review Panel**: Gemini analyzes the text and populates:
   - **Title**: Recommended concise title.
   - **Category**: Selects `DEADLINE`, `TASK`, `EVENT`, `NOTE`, or `OTHER`.
   - **Summary**: 1-2 sentence core takeaway.
   - **Action Items**: Discrete, actionable bullet points (editable: add/remove/edit items).
   - **Dates & Deadlines**: Explicit dates and times mentioned in the text (editable: add/remove).
   - **Clarification Flags**: Highlights any missing or ambiguous information (e.g. unspecified submission link, missing venue).
4. **User Control**: Review and modify any of the suggested fields.
5. **Save to Inbox**: Click **"Save Proposal to Inbox"** to persist the organized record into your SQLite database via the standard CRUD API.
