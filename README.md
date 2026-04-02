# 🤖 Multi-AI Chatbot Agent Website  
### Gemini + Groq + OpenRouter + n8n Workflow Automation

A modern **Multi-AI Agent Chatbot Web Application** that integrates multiple LLM providers (Gemini, Groq, OpenRouter) using **n8n workflow orchestration** and a custom frontend interface.

This project demonstrates how to build a **production-ready AI agent system** capable of routing prompts across multiple AI models and returning structured responses to a web interface.

---

# 🚀 Features

✅ Multi-model AI integration  
✅ Gemini Agent support  
✅ Groq Agent support  
✅ OpenRouter Agent support  
✅ n8n workflow orchestration  
✅ Webhook-based real-time communication  
✅ Model response formatting system  
✅ Multi-response card UI rendering  
✅ Glassmorphism modern UI design  
✅ Typing animation UX  
✅ Fullscreen chat mode  
✅ Production webhook deployment (n8n cloud)

---

# 🧠 Architecture Overview

User Input (Website)
↓
Webhook Trigger (n8n)
↓
Groq Agent
Gemini Agent
OpenRouter Agent
↓
Combine Responses Node
↓
Format Combined Response
↓
Respond to Webhook
↓
Frontend Chat UI Rendering

---

# 🏗 Tech Stack

## Frontend
- HTML5
- CSS3 (Glassmorphism UI)
- Vanilla JavaScript

## Backend Orchestration
- n8n Workflow Automation
- Webhook API Integration

## AI Providers
- Google Gemini
- Groq LLM
- OpenRouter Models

---

# 📂 Workflow Pipeline (n8n)

Webhook → Multi-Agent Execution → Response Merge → Output Formatting → Webhook Response

This workflow enables:

• parallel AI execution  
• structured output formatting  
• fallback handling  
• response validation  

---

# 🌐 Live Chat Flow Example

User Input:
