document.addEventListener('DOMContentLoaded', () => {

    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const clearChatBtn = document.getElementById('clear-chat');
    const toggleFullscreenBtn = document.getElementById('toggle-fullscreen');
    const app = document.getElementById('app');

    // Production Webhook URL
    const N8N_WEBHOOK_URL = 'https://vaibhavds.app.n8n.cloud/webhook/chatbot';

    // Auto resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    });


    // High-priority Enter key listener (Priority: True for captures)
    userInput.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, true);


    sendBtn.addEventListener('click', sendMessage);


    async function sendMessage() {

        const text = userInput.value.trim();
        if (!text) return;

        // Disable input while sending
        userInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.style.opacity = '0.5';

        addMessage(text, 'user');

        userInput.value = '';
        userInput.style.height = 'auto';

        const typingId = showTypingIndicator();

        try {

            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text
                })
            });

            if (!response.ok) {

                removeTypingIndicator(typingId);

                const errorData = await response.text();
                throw new Error(`Server error: ${response.status}`);
            }

            let data;

            try {
                data = await response.json();
            } catch {
                data = await response.text();
            }

            removeTypingIndicator(typingId);


            // Handle array OR object response
            const items = Array.isArray(data) ? data : [data];


            for (const item of items) {

                const content =
                    typeof item === "string" ?
                    item :
                    item.output ||
                    item.text ||
                    item.response ||
                    item.message ||
                    item.data?.output ||
                    item.data?.text ||
                    JSON.stringify(item);

                await addMessageWithDelay(content, 'ai');
            }

        } catch (error) {

            console.error("Fetch Error:", error);

            removeTypingIndicator(typingId);

            let errMsg = "⚠️ Network issue. ";

            if (error.message.includes("Failed to fetch")) {
                errMsg += "Check if n8n has 'Allowed Origins: *' set.";
            } else {
                errMsg += error.message;
            }

            addMessage(errMsg, 'ai');
        } finally {
            // Re-enable input
            userInput.disabled = false;
            sendBtn.disabled = false;
            sendBtn.style.opacity = '1';
            userInput.focus();
        }
    }


    async function addMessageWithDelay(content, sender) {

        return new Promise(resolve => {

            setTimeout(() => {

                addMessage(content, sender);

                resolve();

            }, 400);

        });
    }



    function addMessage(content, sender) {

        const messageDiv = document.createElement('div');

        messageDiv.classList.add('message', sender);


        // FIX newline rendering
        const cleanContent = String(content).replace(/\\n/g, '\n');


        // Detect multi-model formatted response
        if (
            sender === 'ai' &&
            /\*\*(OpenRouter|Groq|Gemini|AI):\*\*/i.test(cleanContent)
        ) {

            messageDiv.innerHTML = formatAiResponse(cleanContent);

        } else {

            messageDiv.innerHTML = cleanContent
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        }


        chatContainer.appendChild(messageDiv);

        chatContainer.scrollTop = chatContainer.scrollHeight;
    }



    function formatAiResponse(content) {

        const sections = content
            .split(/\*\*(OpenRouter|Groq|Gemini|AI):\*\*/gi)
            .filter(s => s.trim());


        if (sections.length > 1) {

            let html = "";


            for (let i = 0; i < sections.length; i += 2) {

                const title = sections[i];
                const text = sections[i + 1] || "";


                if (text.trim()) {

                    html += `
                        <div class="ai-response-card">

                            <div class="model-tag">
                                ${title}
                            </div>

                            <div class="model-content">

                                ${text.trim()
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/`(.*?)`/g, '<code>$1</code>')
                                    .replace(/\n/g, '<br>')}

                            </div>

                        </div>
                    `;
                }
            }

            return html;
        }


        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }



    function showTypingIndicator() {

        const id = "typing-" + Date.now();

        const typingDiv = document.createElement("div");

        typingDiv.id = id;

        typingDiv.classList.add("message", "ai", "typing");

        typingDiv.innerHTML =
            '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';

        chatContainer.appendChild(typingDiv);

        chatContainer.scrollTop = chatContainer.scrollHeight;

        return id;
    }



    function removeTypingIndicator(id) {

        const el = document.getElementById(id);

        if (el) el.remove();
    }



    toggleFullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            app.classList.add("fullscreen");
        } else {
            document.exitFullscreen();
            app.classList.remove("fullscreen");
        }
    });

    clearChatBtn.addEventListener("click", () => {
        if (confirm("Clear chat?")) {
            chatContainer.innerHTML =
                '<div class="message ai">History cleared. How can I help?</div>';
        }
    });

});
