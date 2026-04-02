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

    // Send message on Enter (but allow Shift+Enter for new line)
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

        // Add user message to UI
        addMessage(text, 'user');
        
        // Reset input
        userInput.value = '';
        userInput.style.height = 'auto';

        // Show typing indicator
        const typingId = showTypingIndicator();
        
        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                removeTypingIndicator(typingId);
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Remove typing indicator before showing response
            removeTypingIndicator(typingId);
            
            // Handle n8n response (adjusting based on typical n8n responses)
            // It might be a direct string or a JSON with { output: "..." }
            let responseContent = '';
            if (typeof data === 'string') {
                responseContent = data;
            } else if (data.output) {
                responseContent = data.output;
            } else if (Array.isArray(data) && data[0]?.output) {
                responseContent = data[0].output;
            } else if (data.text) {
                responseContent = data.text;
            } else {
                responseContent = JSON.stringify(data, null, 2);
            }

            addMessage(responseContent, 'ai');
        } catch (error) {
            console.error('Error fetching from n8n:', error);
            removeTypingIndicator(typingId);
            addMessage("I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.", 'ai');
        }
    }

    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        // Basic Markdown-like parsing for bold and code backticks
        // In a production environment, you might want to use a real markdown library like 'marked'
        let formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
            
        messageDiv.innerHTML = formattedContent;
        chatContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = id;
        typingDiv.classList.add('message', 'ai', 'typing');
        typingDiv.innerHTML = `
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        `;
        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // Controls Logic
    clearChatBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the chat?')) {
            chatContainer.innerHTML = `
                <div class="message ai">
                    Chat history cleared. How can I help you from here?
                </div>
            `;
        }
    });

    toggleFullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
            });
            app.classList.add('fullscreen');
            toggleFullscreenBtn.innerHTML = '<i data-lucide="minimize"></i>';
        } else {
            document.exitFullscreen();
            app.classList.remove('fullscreen');
            toggleFullscreenBtn.innerHTML = '<i data-lucide="maximize"></i>';
        }
        lucide.createIcons();
    });

    // Handle Esc key to exit fullscreen
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            app.classList.remove('fullscreen');
            toggleFullscreenBtn.innerHTML = '<i data-lucide="maximize"></i>';
            lucide.createIcons();
        }
    });
});
