# CareBridge – React Application

Clinical AI Chatbot with OpenAI GPT + FHIR R4 API integration. Migrated from vanilla JS to React with best practices.

## Tech Stack

- **React 18** + **Vite 5**
- **marked** for Markdown rendering
- FHIR R4 APIs for patient data
- OpenAI API for AI chat

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/       # React components
│   ├── LoginScreen.jsx
│   ├── ApiKeyModal.jsx
│   ├── HomeScreen.jsx
│   └── ChatWidget/
├── context/          # AuthContext
├── hooks/            # useChat
├── services/         # API, FHIR, OpenAI, system prompt
├── constants/        # Config, knowledge bases
├── utils/            # Markdown, format helpers
├── App.jsx
├── main.jsx
└── styles.css        # Original styles preserved
```

## Assets

Images and chatbot assets are in `public/`:
- `public/images/LogoRsi.png`
- `public/images/ChatBigIcon.png`
- `public/chatbot_image/chatbot.png`

## Next Steps (Spring Boot Backend)

When migrating to Spring Boot:
- Move OpenAI API key to `application.yml`
- Proxy FHIR calls through backend
- Move chat/agent logic to backend services
