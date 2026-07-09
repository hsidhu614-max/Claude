# Punjabi ↔ English Voice Translator

A real-time, face-to-face voice translator. Two people hold a phone between
them — one speaks Punjabi, the other English — and each half of the screen
shows the transcription and translation, reading the result aloud to the
other person.

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS (`frontend/`)
- **Backend**: Express + TypeScript (`backend/`)
- **AI**: OpenAI Whisper for transcription, Anthropic Claude for translation

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in ANTHROPIC_API_KEY and OPENAI_API_KEY
npm run dev             # starts on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev              # starts on http://localhost:5173, proxies /api to the backend
```

Open `http://localhost:5173` on a phone (or resize your browser to a phone
viewport) and grant microphone access.

## How it works

1. Tap the mic on your half of the screen and speak.
2. Tap it again to stop — the audio is sent to the backend as base64.
3. The backend transcribes it with Whisper, then asks Claude to translate it.
4. Your transcription appears on your half; the translation appears on the
   other half and is read aloud there via the Web Speech API (unless muted).
5. Use the replay button to re-read a half's text, and the mute button to
   toggle auto-read-aloud for that half.
