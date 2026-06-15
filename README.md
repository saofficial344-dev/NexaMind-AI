# AI Content Generator (MERN-ready)

A simple full-stack app for generating **summaries**, **product/service descriptions**, and **emails** using the Anthropic Claude API.

## Structure

```
ai-content-generator/
├── backend/      # Express server (calls Claude API)
└── frontend/     # React (Vite) app
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_api_key_here
PORT=5000
```

Get an API key from https://console.anthropic.com

Run the server:

```bash
npm run dev
```

Server runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`.

## How it works

- The React frontend has 3 tabs: **Summary**, **Description**, **Email**.
- Each tab sends a request to `POST /api/generate` with:
  ```json
  {
    "type": "summary" | "description" | "email",
    "prompt": "user input text",
    "tone": "optional tone/style"
  }
  ```
- The backend picks the right system prompt based on `type`, calls Claude, and returns the generated text.

## Customization ideas

- Add more content types (e.g., `social_post`, `blog_intro`) by adding entries to `SYSTEM_PROMPTS` in `backend/server.js` and a new tab in `frontend/src/App.jsx`.
- Add conversation history / chat-style UI for follow-up edits.
- Add streaming responses for longer content.
- Connect to MongoDB to save generated content history per user.
- Add authentication so users have their own saved content.

## Notes

- Never expose your API key in frontend code — it stays in the backend `.env`.
- Update `API_URL` in `frontend/src/components/ContentGenerator.jsx` if you deploy the backend elsewhere.
