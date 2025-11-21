// ==========================================
// CONFIGURACIÓN
// ==========================================
const CONFIG = {
    webhookUrl:
        "https://primary-production-396f31.up.railway.app/webhook/mavilda-chat",
    position: "bottom-right",
    primaryColor: "#2E7D32",
    secondaryColor: "#1B5E20",
    autoGreeting: true,
};

let isOpen = false;
let sessionId = null;
let hasGreeted = false;

// ==========================================
// GENERAR SESSION ID
// ==========================================
function generateSessionId() {
    return (
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
}

// ==========================================
// CREAR ESTRUCTURA HTML (sin botón)
// ==========================================
function createChatWidget() {
    const widgetHTML = `
        <div id="mavilda-chat-container">
            <!-- Ventana de chat -->
            <div id="mavilda-chat-window" style="display: none;">
                <div id="mavilda-chat-header">
                    <div class="header-content">
                        <img src="/imagenes/mavilda-logo.png" alt="Mavilda" class="chat-logo">
                        <div class="header-text">
                            <strong>Mavilda</strong>
                            <span>Ingeniera Agrónoma</span>
                        </div>
                    </div>
                    <button id="mavilda-chat-close" aria-label="Cerrar chat">✕</button>
                </div>

                <div id="mavilda-chat-messages"></div>

                <div id="mavilda-chat-input-container">
                    <input 
                        type="text" 
                        id="mavilda-chat-input" 
                        placeholder="Escribí tu mensaje..."
                        autocomplete="off"
                    />
                    <button id="mavilda-chat-send" aria-label="Enviar mensaje">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                            <path d="M2 10L18 2L12 18L10 12L2 10Z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", widgetHTML);
}

// ==========================================
// AGREGAR ESTILOS CSS
// ==========================================
function addStyles() {
    const styles = `
        #mavilda-chat-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            z-index: 100000;
        }

        #mavilda-chat-window {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 380px;
            max-width: calc(100vw - 40px);
            height: 600px;
            max-height: calc(100vh - 120px);
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            z-index: 100000;
            overflow: hidden;
        }

        #mavilda-chat-header {
            background: ${CONFIG.primaryColor};
            color: white;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .chat-logo {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: white;
            padding: 4px;
            object-fit: contain;
        }

        .header-text {
            display: flex;
            flex-direction: column;
        }

        .header-text strong {
            font-size: 16px;
        }

        .header-text span {
            font-size: 12px;
            opacity: 0.9;
        }

        #mavilda-chat-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
        }

        #mavilda-chat-close:hover {
            background: rgba(255,255,255,0.1);
        }

        #mavilda-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #f5f5f5;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
        }

        .chat-message {
            margin-bottom: 12px;
            display: flex;
            flex-direction: column;
        }

        .chat-message.user {
            align-items: flex-end;
        }

        .chat-message.bot {
            align-items: flex-start;
        }

        .message-bubble {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 16px;
            word-wrap: break-word;
            line-height: 1.4;
        }

        .chat-message.user .message-bubble {
            background: ${CONFIG.primaryColor};
            color: white;
            border-bottom-right-radius: 4px;
        }

        .chat-message.bot .message-bubble {
            background: white;
            color: #333;
            border-bottom-left-radius: 4px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .message-bubble strong {
            font-weight: 600;
        }

        .message-bubble ul, .message-bubble ol {
            margin: 8px 0;
            padding-left: 20px;
        }

        .message-bubble li {
            margin: 4px 0;
        }

        #mavilda-chat-input-container {
            display: flex;
            padding: 12px;
            background: white;
            border-top: 1px solid #e0e0e0;
            gap: 8px;
        }

        #mavilda-chat-input {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid #ddd;
            border-radius: 20px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }

        #mavilda-chat-input:focus {
            border-color: ${CONFIG.primaryColor};
        }

        #mavilda-chat-send {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: ${CONFIG.primaryColor};
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        #mavilda-chat-send:hover {
            background: ${CONFIG.secondaryColor};
            transform: scale(1.05);
        }

        #mavilda-chat-send:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 10px 14px;
        }

        .typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #999;
            animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% {
                transform: translateY(0);
            }
            30% {
                transform: translateY(-10px);
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            #mavilda-chat-window {
                width: calc(100vw - 32px);
                height: auto;
                max-height: calc(100vh - 200px);
                left: 50%;
                right: auto;
                transform: translateX(-50%);
                bottom: calc(90px + env(safe-area-inset-bottom, 0px));
            }
            
            #mavilda-chat-messages {
                max-height: calc(100vh - 320px);
                min-height: 200px;
            }
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// ==========================================
// MOSTRAR MENSAJE EN EL CHAT
// ==========================================
function mostrarMensaje(texto, esUsuario = false) {
    const chatMessages = document.getElementById("mavilda-chat-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${esUsuario ? "user" : "bot"}`;

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.innerHTML = formatearMensaje(texto);

    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==========================================
// FORMATEAR MENSAJE (negrita, bullets)
// ==========================================
function formatearMensaje(texto) {
    texto = texto.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    texto = texto.replace(/^[•\-]\s/gm, "• ");
    texto = texto.replace(/\n/g, "<br>");
    return texto;
}

// ==========================================
// MOSTRAR INDICADOR DE ESCRITURA
// ==========================================
function mostrarEscribiendo() {
    const chatMessages = document.getElementById("mavilda-chat-messages");
    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-message bot";
    typingDiv.id = "typing-indicator";

    const typingBubble = document.createElement("div");
    typingBubble.className = "typing-indicator";
    typingBubble.innerHTML =
        '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

    typingDiv.appendChild(typingBubble);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function ocultarEscribiendo() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// ==========================================
// ENVIAR MENSAJE A N8N
// ==========================================
async function enviarMensaje(mensaje) {
    if (!mensaje.trim()) return;

    const chatInput = document.getElementById("mavilda-chat-input");
    const sendButton = document.getElementById("mavilda-chat-send");

    if (mensaje !== "Hola") {
        mostrarMensaje(mensaje, true);
    }

    chatInput.disabled = true;
    sendButton.disabled = true;

    mostrarEscribiendo();

    try {
        const response = await fetch(CONFIG.webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: mensaje,
                sessionId: sessionId,
            }),
        });

        const data = await response.json();

        ocultarEscribiendo();

        if (data.output) {
            mostrarMensaje(data.output);
        } else if (data.response) {
            mostrarMensaje(data.response);
        } else {
            mostrarMensaje(
                "Lo siento, hubo un error. ¿Podrías intentar de nuevo?",
            );
        }
    } catch (error) {
        console.error("Error al enviar mensaje:", error);
        ocultarEscribiendo();
        mostrarMensaje(
            "Ups, hubo un problema de conexión. Por favor intentá de nuevo.",
        );
    } finally {
        chatInput.value = "";
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
}

// ==========================================
// ENVIAR SALUDO AUTOMÁTICO
// ==========================================
function enviarSaludoAutomatico() {
    if (!hasGreeted && CONFIG.autoGreeting) {
        hasGreeted = true;
        setTimeout(() => {
            enviarMensaje("Hola");
        }, 500);
    }
}

// ==========================================
// ABRIR/CERRAR CHAT (API Pública)
// ==========================================
function openChat() {
    const chatWindow = document.getElementById("mavilda-chat-window");

    if (!isOpen) {
        isOpen = true;
        window.isChatOpen = true;
        chatWindow.style.display = "flex";
        document.getElementById("mavilda-chat-input").focus();

        // Deshabilitar botón de presentación para evitar clicks automáticos de Safari/iPhone
        const presentacionBtn = document.getElementById("ver-presentacion-btn");
        if (presentacionBtn) {
            presentacionBtn.disabled = true;
        }

        enviarSaludoAutomatico();
    }
}

function closeChat() {
    const chatWindow = document.getElementById("mavilda-chat-window");

    if (isOpen) {
        isOpen = false;
        window.isChatOpen = false;
        chatWindow.style.display = "none";

        // Habilitar botón de presentación nuevamente
        const presentacionBtn = document.getElementById("ver-presentacion-btn");
        if (presentacionBtn) {
            presentacionBtn.disabled = false;
        }

        // Mostrar botón principal de nuevo
        if (
            window.UnifiedContact &&
            typeof window.UnifiedContact.show === "function"
        ) {
            window.UnifiedContact.show();
        }
    }
}

// ==========================================
// INICIALIZAR EVENTOS
// ==========================================
function inicializarEventos() {
    const closeButton = document.getElementById("mavilda-chat-close");
    const chatInput = document.getElementById("mavilda-chat-input");
    const sendButton = document.getElementById("mavilda-chat-send");

    closeButton.addEventListener("click", closeChat);

    sendButton.addEventListener("click", () => {
        const mensaje = chatInput.value;
        if (mensaje.trim()) {
            enviarMensaje(mensaje);
        }
    });

    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const mensaje = chatInput.value;
            if (mensaje.trim()) {
                enviarMensaje(mensaje);
            }
        }
    });
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
function init() {
    sessionId = generateSessionId();
    createChatWidget();
    addStyles();
    inicializarEventos();

    console.log("✅ Mavilda Chat Widget cargado correctamente");
    console.log("Session ID:", sessionId);
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// ==========================================
// API PÚBLICA
// ==========================================
window.MavildaChat = {
    open: openChat,
    close: closeChat,
};
