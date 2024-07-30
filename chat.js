(() => {
    // Configuration
    const config = {
        apiUrl: 'http://localhost:8000'
    };

    // CSS styles
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        :root {
            --primary-color: #3498db;
            --secondary-color: #2980b9;
            --background-color: #f8f9fa;
            --text-color: #333;
            --border-color: #e0e0e0;
        }

        #chat-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 500px;
            background-color: var(--background-color);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            opacity: 0;
            transform: translateY(20px);
            animation: slide-in 0.5s forwards;
        }

        @keyframes slide-in {
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        #chat-widget-container.minimized {
            height: 60px;
        }

        #chat-widget-header {
            background-color: var(--primary-color);
            color: white;
            padding: 15px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        #chat-widget-header:hover {
            background-color: var(--secondary-color);
        }

        #chat-widget-header .minimize-icon {
            transition: transform 0.3s ease;
        }

        #chat-widget-container.minimized #chat-widget-header .minimize-icon {
            transform: rotate(180deg);
        }

        #chat-widget-messages {
            flex-grow: 1;
            overflow-y: auto;
            padding: 15px;
            background-color: white;
            transition: opacity 0.3s ease;
            scroll-behavior: smooth;
        }

        #chat-widget-messages::-webkit-scrollbar {
            width: 6px;
        }

        #chat-widget-messages::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        #chat-widget-messages::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
        }

        #chat-widget-messages::-webkit-scrollbar-thumb:hover {
            background: #555;
        }

        .chat-message {
            margin-bottom: 15px;
            padding: 10px 15px;
            border-radius: 18px;
            max-width: 85%;
            transition: all 0.3s ease;
            position: relative;
            opacity: 0;
            transform: translateY(20px);
            animation: message-in 0.3s forwards;
            line-height: 1.4;
            word-wrap: break-word;
        }

        @keyframes message-in {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .chat-message .timestamp {
            font-size: 0.7em;
            color: #999;
            margin-top: 5px;
            display: block;
            text-align: right;
        }

        .user-message {
            background-color: #e1f5fe;
            align-self: flex-end;
            margin-left: auto;
            border-bottom-right-radius: 5px;
        }

        .bot-message {
            background-color: #f1f0f0;
            align-self: flex-start;
            border-bottom-left-radius: 5px;
        }

        #typing-indicator {
            display: none;
            align-items: center;
            padding: 10px 15px;
            background-color: #f1f0f0;
            border-radius: 18px;
            margin-bottom: 15px;
            max-width: 85%;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        #typing-indicator.visible {
            display: flex;
            animation: fade-in 0.3s forwards;
        }

        @keyframes fade-in {
            to {
                opacity: 1;
            }
        }

        .typing-dot {
            width: 8px;
            height: 8px;
            background-color: #999;
            border-radius: 50%;
            margin: 0 3px;
            animation: typing-dot 1.4s infinite ease-in-out both;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing-dot {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        #chat-widget-input {
            display: flex;
            padding: 15px;
            background-color: white;
            border-top: 1px solid var(--border-color);
        }

        #chat-widget-input input {
            flex-grow: 1;
            padding: 10px 15px;
            border: 1px solid var(--border-color);
            border-radius: 20px;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        #chat-widget-input input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        #chat-widget-input button {
            padding: 10px 20px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 20px;
            margin-left: 10px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            font-weight: 600;
        }

        #chat-widget-input button:hover {
            background-color: var(--secondary-color);
        }

        #chat-widget-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1001;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        #chat-widget-toggle:hover {
            background-color: var(--secondary-color);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        #chat-widget-toggle:active {
            transform: scale(0.95);
        }

        .emoji-picker {
            position: absolute;
            bottom: 70px;
            right: 15px;
            background-color: white;
            border: 1px solid var(--border-color);
            border-radius: 5px;
            padding: 5px;
            display: none;
        }

        .emoji-picker.visible {
            display: block;
        }

        .emoji-picker button {
            background: none;
            border: none;
            font-size: 20px;
            padding: 5px;
            cursor: pointer;
        }

        #emoji-button {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            padding: 10px;
        }
    `;

    // Chat widget HTML
    const chatWidgetHTML = `
        <div id="chat-widget-container" class="minimized">
            <div id="chat-widget-header">
                <span>Chat Support</span>
                <span class="minimize-icon">−</span>
            </div>
            <div id="chat-widget-messages"></div>
            <div id="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <div id="chat-widget-input">
                <input type="text" placeholder="Type your message...">
                <button id="emoji-button">😊</button>
                <button>Send</button>
            </div>
            <div class="emoji-picker">
                <button>😊</button>
                <button>😂</button>
                <button>😍</button>
                <button>👍</button>
                <button>🎉</button>
            </div>
        </div>
        <button id="chat-widget-toggle">?</button>
    `;

    function initializeChatWidget() {
        // Inject CSS
        const styleElement = document.createElement('style');
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);

        // Inject HTML
        const chatWidgetContainer = document.createElement('div');
        chatWidgetContainer.innerHTML = chatWidgetHTML;
        document.body.appendChild(chatWidgetContainer);

        // Get DOM elements
        const container = document.getElementById('chat-widget-container');
        const header = document.getElementById('chat-widget-header');
        const messagesContainer = document.getElementById('chat-widget-messages');
        const typingIndicator = document.getElementById('typing-indicator');
        const inputElement = document.querySelector('#chat-widget-input input');
        const sendButton = document.querySelector('#chat-widget-input button:last-child');
        const toggleButton = document.getElementById('chat-widget-toggle');
        const emojiButton = document.getElementById('emoji-button');
        const emojiPicker = document.querySelector('.emoji-picker');

        // Toggle chat widget
        function toggleChatWidget() {
            container.classList.toggle('minimized');
            toggleButton.style.display = container.classList.contains('minimized') ? 'flex' : 'none';
        }

        header.addEventListener('click', toggleChatWidget);
        toggleButton.addEventListener('click', toggleChatWidget);

        // Send message function
        async function sendMessage() {
            const message = inputElement.value.trim();
            if (message) {
                addMessage(message, 'user');
                inputElement.value = '';
                showTypingIndicator();

                try {
                    const response = await fetch(`${config.apiUrl}/query`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ question: message }),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    hideTypingIndicator();
                    if (data.message) {
                        addMessage(data.message, 'bot');
                    } else {
                        addMessage('Sorry, I couldn\'t process your request.', 'bot');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    hideTypingIndicator();
                    addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
                }
            }
        }

        // Add message to chat
        function addMessage(message, sender) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message', `${sender}-message`);
            
            // Convert markdown to HTML (basic implementation)
            const formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\n/g, '<br>');
            
            messageElement.innerHTML = `
                <span>${formattedMessage}</span>
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
            `;
            messagesContainer.appendChild(messageElement);
            scrollToBottom();

            // Trigger animation
            setTimeout(() => messageElement.style.opacity = '1', 10);
        }

        // Show typing indicator
        function showTypingIndicator() {
            typingIndicator.classList.add('visible');
            scrollToBottom();
        }

        // Hide typing indicator
        function hideTypingIndicator() {
            typingIndicator.classList.remove('visible');
        }

        // Scroll to bottom of messages
        function scrollToBottom() {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Toggle emoji picker
        function toggleEmojiPicker() {
            emojiPicker.classList.toggle('visible');
        }

        // Add emoji to input
        function addEmoji(emoji) {
            inputElement.value += emoji;
            inputElement.focus();
        }

        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        emojiButton.addEventListener('click', toggleEmojiPicker);

        emojiPicker.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                addEmoji(button.textContent);
                toggleEmojiPicker();
            });
        });

        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!emojiPicker.contains(e.target) && e.target !== emojiButton) {
                emojiPicker.classList.remove('visible');
            }
        });

        // Initial message
        addMessage('Hello! How can I help you today?', 'bot');
    }

    // Run the initialization when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeChatWidget);
    } else {
        initializeChatWidget();
    }
})();