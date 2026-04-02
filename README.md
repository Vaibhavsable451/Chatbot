# AI Chatbot Website

A premium, full-screen AI chatbot interface designed with a focus on Gemini, Groq, and OpenRouter integration.

## Features
- **Modern UI**: Glassmorphism and dark mode aesthetics.
- **Multimodal**: Connects to an n8n webhook (`https://vaibhavds.app.n8n.cloud/webhook/chatbot`).
- **Interactive**: Bubble messages, typing indicators, and real-time responses.
- **Full-Screen Mode**: Immersive AI interaction experience.
- **Responsive**: Fully optimized for desktop and mobile devices.

## How to Run
Simply open `index.html` in any modern web browser.

## Customization
- **Backend**: The chatbot currently connects to the production n8n webhook. You can modify the `N8N_WEBHOOK_URL` in `script.js` to point to a different endpoint.
- **Styling**: Update `style.css` to change the color palette (using CSS variables).
- **Icons**: Uses Lucide icons (included via CDN).

## AI Models
- **Google Gemini**: Integrated for multi-turn reasoning and advanced creative tasks.
- **Groq**: Integrated for ultra-fast response times and low latency.
- **OpenRouter**: Integrated for versatile model access and broad model support.
