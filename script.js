document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const clearChatBtn = document.getElementById('clear-chat');
    const toggleFullscreenBtn = document.getElementById('toggle-fullscreen');
    const app = document.getElementById('app');

    // Production Webhook URL
    const N8N_WEBHOOK_URL = 'https://vaibhavds.app.n8n.cloud/webhook/chatbot';

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    });

    // Send message on Enter
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        userInput.value = '';
        userInput.style.height = 'auto';

        const typingId = showTypingIndicator();
        
        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                removeTypingIndicator(typingId);
                const errorData = await response.text();
                console.error('n8n Error:', errorData);
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();
            removeTypingIndicator(typingId);
            
            // Handle multiple responses (array) or single response
            if (Array.isArray(data)) {
                for (const item of data) {
                    const content = item.output || item.text || JSON.stringify(item);
                    await addMessageWithDelay(content, 'ai');
                }
            } else {
                const content = data.output || data.text || (typeof data === 'string' ? data : JSON.stringify(data));
                addMessage(content, 'ai');
            }

        } catch (error) {
            console.error('Fetch Error:', error);
            removeTypingIndicator(typingId);
            
            let errMsg = "I'm sorry, I'm having trouble connecting to my brain. ";
            if (error.message.includes('Failed to fetch')) {
                errMsg += "This is likely a CORS issue in n8n. Please ensure 'Allowed Origins' is set to '*' in your n8n Webhook node.";
            } else {
                errMsg += "Technical Error: " + error.message;
            }
            addMessage(errMsg, 'ai');
        }
    }

    async function addMessageWithDelay(content, sender) {
        return new Promise(resolve => {
            setTimeout(() => {
                addMessage(content, sender);
                resolve();
            }, 500);
        });
    }

    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        // Smart Formatting for combined model responses
        if (sender === 'ai' && content.includes('**')) {
            messageDiv.innerHTML = formatAiResponse(content);
        } else {
            messageDiv.innerHTML = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        }
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function formatAiResponse(content) {
        // Detect if content has model headers
        const sections = content.split(/\*\*(OpenRouter|Groq|Gemini|AI):\*\*/gi).filter(s => s.trim());
        
        if (sections.length > 1) {
            let html = '';
            for (let i = 0; i < sections.length; i += 2) {
                const title = sections[i];
                const text = sections[i+1] || "";
                if (text.trim()) {
                    html += `
                        <div class="ai-response-card">
                            <div class="model-tag">${title}</div>
                            <div class="model-content">${text.trim().replace(/\n/g, '<br>')}</div>
                        </div>
                    `;
                }
            }
            return html;
        }
        return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = id;
        typingDiv.classList.add('message', 'ai', 'typing');
        typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // Toggle Fullscreen
    toggleFullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            app.classList.add('fullscreen');
        } else {
            document.exitFullscreen();
            app.classList.remove('fullscreen');
        }
    });

    clearChatBtn.addEventListener('click', () => {
        if (confirm('Clear chat?')) {
            chatContainer.innerHTML = '<div class="message ai">History cleared. How can I help?</div>';
        }
    });
});
