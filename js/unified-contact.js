// ==========================================
// UNIFIED CONTACT SYSTEM - SER AGRO
// Sistema de contacto unificado con 4 canales:
// 1. WhatsApp
// 2. Chat con Mavilda (IA)
// 3. Llamadas de voz con Vapi
// 4. Videollamada con D-ID
// ==========================================

import Vapi from "@vapi-ai/web";

// ==========================================
// CONFIGURACIÓN
// ==========================================
const CONFIG = {
    whatsappPhone: "5493465432688",
    whatsappMessage: "Hola, vengo desde el sitio de SER AGRO",
    vapiPublicKey: "5a29292f-d9cc-4a21-bb7e-ff8df74763cd",
    vapiAssistantId: "776543a0-f4a2-4ed7-ad7a-f1fe0f6fd4d4",
    dIdAgentUrl: "https://studio.d-id.com/agents/share?id=v2_agt_GvlTAw-a&utm_source=copy&key=WjI5dloyeGxNVzloZFhSb01ud3hNVGN6TmpFNU1qWTFNRE0wTkRnd05qWTBPREU2Y0c5MmMyUjRTWFpmUmpGUU9HSnZiWGxMYzNFdw==",
    primaryColor: "#2E7D32",
    secondaryColor: "#1B5E20",
    whatsappColor: "#25D366",
    videoCallColor: "#6B46C1",
};

// ==========================================
// VARIABLES GLOBALES
// ==========================================
let vapiClient = null;
let inCall = false;

// ==========================================
// DETECTAR DISPOSITIVO
// ==========================================
function isAndroidDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android/i.test(userAgent);
}

// ==========================================
// ESTILOS CSS
// ==========================================
const styles = `
    .unified-contact-main-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${CONFIG.primaryColor};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9998;
        transition: all 0.3s ease;
    }

    .unified-contact-main-button:hover {
        background: ${CONFIG.secondaryColor};
        transform: scale(1.1);
    }

    .unified-contact-menu {
        position: fixed;
        bottom: 90px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        padding: 12px;
        display: none;
        flex-direction: column;
        gap: 8px;
        z-index: 9999;
        min-width: 200px;
    }

    .unified-contact-menu.active {
        display: flex;
        animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .contact-option {
        padding: 12px 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 15px;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        color: white;
    }

    .contact-option:hover {
        transform: translateX(-3px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .option-whatsapp {
        background: ${CONFIG.whatsappColor};
    }

    .option-chat {
        background: ${CONFIG.primaryColor};
    }

    .option-call {
        background: #2196F3;
    }

    .option-video {
        background: ${CONFIG.videoCallColor};
    }

    /* Call Indicator Overlay */
    .call-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9997;
    }

    .call-overlay.active {
        display: block;
    }

    /* Call Indicator */
    .call-indicator {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 20px;
        padding: 30px 40px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 9999;
        display: none;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        min-width: 300px;
    }

    .call-indicator.active {
        display: flex;
    }

    .call-status {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        text-align: center;
    }

    .call-animation {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${CONFIG.primaryColor};
        animation: pulse 1.5s ease-in-out infinite;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.1);
            opacity: 0.8;
        }
    }

    /* Botón Colgar - PC e iPhone (rectangular blanco con texto) */
    .end-call-btn {
        padding: 12px 30px;
        background: white;
        color: #f44336;
        border: none;
        border-radius: 25px;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        letter-spacing: 0.5px;
    }

    .end-call-btn:hover {
        background: #f5f5f5;
        transform: scale(1.05);
    }

    /* Botón Colgar - Android (circular rojo con ícono) */
    .end-call-btn-circular {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #f44336;
        color: white;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .end-call-btn-circular:hover {
        background: #d32f2f;
    }

    /* Video Call Modal */
    .video-call-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        align-items: center;
        justify-content: center;
    }

    .video-call-modal.active {
        display: flex;
    }

    .video-call-content {
        position: relative;
        width: 90%;
        max-width: 800px;
        height: 80vh;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }

    .video-call-iframe {
        width: 100%;
        height: 100%;
        border: none;
    }

    .video-call-close {
        position: absolute;
        top: 15px;
        right: 15px;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 24px;
        font-weight: bold;
        color: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        transition: all 0.2s ease;
    }

    .video-call-close:hover {
        background: white;
        transform: scale(1.1);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .unified-contact-main-button {
            width: 55px;
            height: 55px;
        }

        .unified-contact-menu {
            right: 15px;
            bottom: 80px;
            min-width: 180px;
        }

        .contact-option {
            padding: 10px 14px;
            font-size: 14px;
        }

        .call-indicator {
            padding: 25px 30px;
            min-width: 280px;
        }

        .call-status {
            font-size: 16px;
        }

        .end-call-btn {
            font-size: 16px;
            padding: 10px 25px;
        }

        .end-call-btn-circular {
            width: 55px;
            height: 55px;
        }

        .end-call-btn-circular svg {
            width: 22px;
            height: 22px;
        }

        .video-call-content {
            width: 95%;
            height: 85vh;
        }
    }

    @media (max-width: 480px) {
        .unified-contact-main-button {
            width: 50px;
            height: 50px;
            bottom: 15px;
            right: 15px;
        }

        .unified-contact-menu {
            right: 10px;
            bottom: 75px;
            min-width: 160px;
        }

        .contact-option {
            padding: 9px 12px;
            font-size: 13px;
            gap: 8px;
        }

        .call-indicator {
            padding: 20px 25px;
            min-width: 260px;
        }

        .call-status {
            font-size: 15px;
        }

        .call-animation {
            width: 50px;
            height: 50px;
        }

        .end-call-btn {
            font-size: 15px;
            padding: 9px 20px;
        }

        .end-call-btn-circular {
            width: 50px;
            height: 50px;
        }

        .end-call-btn-circular svg {
            width: 20px;
            height: 20px;
        }

        .video-call-content {
            width: 100%;
            height: 100vh;
            border-radius: 0;
        }

        .video-call-close {
            width: 35px;
            height: 35px;
            font-size: 20px;
        }
    }
`;

// ==========================================
// FUNCIONES DEL MODAL DE VIDEOLLAMADA
// ==========================================
function openVideoCallModal() {
    const modal = document.getElementById('video-call-modal');
    const iframe = document.getElementById('video-call-iframe');
    
    if (modal) {
        modal.classList.add('active');
        // Recargar el iframe para iniciar una nueva sesión
        iframe.src = iframe.src;
        document.body.style.overflow = 'hidden';
    }
}

function closeVideoCallModal() {
    const modal = document.getElementById('video-call-modal');
    const iframe = document.getElementById('video-call-iframe');
    
    if (modal) {
        modal.classList.remove('active');
        // Limpiar el iframe al cerrar
        iframe.src = 'about:blank';
        setTimeout(() => {
            iframe.src = CONFIG.dIdAgentUrl;
        }, 100);
        document.body.style.overflow = '';
    }
}

// ==========================================
// INYECTAR ESTILOS
// ==========================================
function injectStyles() {
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

// ==========================================
// CREAR BOTÓN PRINCIPAL
// ==========================================
function createMainButton() {
    const button = document.createElement("button");
    button.id = "unified-contact-button";
    button.className = "unified-contact-main-button";
    button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            <circle cx="12" cy="8" r="1"/>
            <circle cx="12" cy="12" r="1"/>
            <circle cx="16" cy="8" r="1"/>
            <circle cx="8" cy="8" r="1"/>
            <circle cx="16" cy="12" r="1"/>
            <circle cx="8" cy="12" r="1"/>
        </svg>
    `;
    button.setAttribute("aria-label", "Opciones de contacto");

    button.addEventListener("click", toggleMenu);

    document.body.appendChild(button);
}

// ==========================================
// CREAR MENÚ
// ==========================================
function createMenu() {
    const menu = document.createElement("div");
    menu.id = "unified-contact-menu";
    menu.className = "unified-contact-menu";

    menu.innerHTML = `
        <button class="contact-option option-whatsapp" data-action="whatsapp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>WhatsApp</span>
        </button>

        <button class="contact-option option-chat" data-action="chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
            </svg>
            <span>Chat</span>
        </button>

        <button class="contact-option option-call" data-action="call">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
            <span>Llamar</span>
        </button>

        <button class="contact-option option-video" data-action="video">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
            <span>Videollamada</span>
        </button>
    `;

    // Event listeners para cada opción
    menu.querySelector('[data-action="whatsapp"]').addEventListener("click", handleWhatsAppClick);
    menu.querySelector('[data-action="chat"]').addEventListener("click", handleChatClick);
    menu.querySelector('[data-action="call"]').addEventListener("click", handleCallClick);
    menu.querySelector('[data-action="video"]').addEventListener("click", handleVideoCallClick);

    document.body.appendChild(menu);
}

// ==========================================
// CREAR INDICADOR DE LLAMADA
// ==========================================
function createCallIndicator() {
    const overlay = document.createElement("div");
    overlay.id = "call-overlay";
    overlay.className = "call-overlay";

    const indicator = document.createElement("div");
    indicator.id = "call-indicator";
    indicator.className = "call-indicator";

    const isAndroid = isAndroidDevice();

    // Versión para Android: botón circular con ícono
    if (isAndroid) {
        indicator.innerHTML = `
            <div class="call-animation">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
            </div>
            <div class="call-status">En llamada...</div>
            <button class="end-call-btn end-call-btn-circular" aria-label="Colgar llamada">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
                </svg>
            </button>
        `;
    } 
    // Versión para PC e iPhone: botón rectangular con texto "Colgar"
    else {
        indicator.innerHTML = `
            <div class="call-animation">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
            </div>
            <div class="call-status">En llamada...</div>
            <button class="end-call-btn">Colgar</button>
        `;
    }

    const endCallBtn = indicator.querySelector(".end-call-btn");
    endCallBtn.addEventListener("click", handleEndCall);

    document.body.appendChild(overlay);
    document.body.appendChild(indicator);
}

// ==========================================
// CREAR MODAL DE VIDEOLLAMADA
// ==========================================
function createVideoCallModal() {
    const modal = document.createElement('div');
    modal.id = 'video-call-modal';
    modal.className = 'video-call-modal';
    
    modal.innerHTML = `
        <div class="video-call-content">
            <button class="video-call-close" onclick="window.UnifiedContact.closeVideoCall()">✕</button>
            <iframe 
                id="video-call-iframe"
                class="video-call-iframe"
                src="${CONFIG.dIdAgentUrl}"
                allow="camera; microphone; autoplay; encrypted-media; fullscreen"
                allowfullscreen
            ></iframe>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ==========================================
// TOGGLE MENÚ
// ==========================================
function toggleMenu() {
    const menu = document.getElementById("unified-contact-menu");
    menu.classList.toggle("active");
}

function closeMenu() {
    const menu = document.getElementById("unified-contact-menu");
    menu.classList.remove("active");
}

// ==========================================
// HANDLERS DE ACCIONES
// ==========================================
function handleWhatsAppClick() {
    const url = `https://wa.me/${CONFIG.whatsappPhone}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
    window.open(url, "_blank");
    closeMenu();
}

function handleChatClick() {
    closeMenu();
    // Aquí se abre el modal del chat (Mavilda)
    // Esta función ya existe en tu código principal
    if (window.openChatModal) {
        window.openChatModal();
    }
}

async function handleCallClick() {
    if (inCall) {
        console.log("Ya hay una llamada en curso");
        return;
    }

    closeMenu();
    inCall = true;

    try {
        const client = getVapiClient();
        showCallIndicator();

        await client.start(CONFIG.vapiAssistantId);
        console.log("✅ Llamada iniciada");
    } catch (error) {
        console.error("❌ Error al iniciar llamada:", error);
        alert("No se pudo iniciar la llamada. Por favor, intentá de nuevo.");
        inCall = false;
        hideCallIndicator();
    }
}

function handleVideoCallClick() {
    closeMenu();
    openVideoCallModal();
}

async function handleEndCall() {
    if (!inCall) return;

    try {
        const client = getVapiClient();
        await client.stop();
        console.log("✅ Llamada finalizada");
    } catch (error) {
        console.error("❌ Error al finalizar llamada:", error);
    }

    inCall = false;
    hideCallIndicator();
}

// ==========================================
// INICIALIZAR CLIENTE VAPI
// ==========================================
function getVapiClient() {
    if (!vapiClient) {
        vapiClient = new Vapi(CONFIG.vapiPublicKey);

        vapiClient.on("call-start", () => {
            console.log("📞 Llamada conectada");
        });

        vapiClient.on("call-end", () => {
            console.log("📴 Llamada finalizada");
            inCall = false;
            hideCallIndicator();
        });

        vapiClient.on("error", (error) => {
            console.error("❌ Error en Vapi:", error);
            alert(
                "Hubo un error con la llamada. Por favor, intentá de nuevo.",
            );
            inCall = false;
            hideCallIndicator();
        });

        console.log("✅ Cliente Vapi inicializado");
    }
    return vapiClient;
}

// ==========================================
// MOSTRAR/OCULTAR INDICADOR DE LLAMADA
// ==========================================
function showCallIndicator() {
    const indicator = document.getElementById("call-indicator");
    const overlay = document.getElementById("call-overlay");
    const mainButton = document.getElementById("unified-contact-button");

    if (indicator) indicator.classList.add("active");
    if (overlay) overlay.classList.add("active");
    if (mainButton) mainButton.style.display = "none";

    // Bloquear scroll del body
    document.body.style.overflow = "hidden";
}

function hideCallIndicator() {
    const indicator = document.getElementById("call-indicator");
    const overlay = document.getElementById("call-overlay");
    const mainButton = document.getElementById("unified-contact-button");

    if (indicator) indicator.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    if (mainButton) mainButton.style.display = "flex";

    // Restaurar scroll del body
    document.body.style.overflow = "";
}

// ==========================================
// MOSTRAR/OCULTAR BOTÓN PRINCIPAL
// ==========================================
function hideMainButton() {
    const button = document.getElementById("unified-contact-button");
    if (button) {
        button.style.opacity = "0";
        button.style.pointerEvents = "none";
    }
}

function showMainButton() {
    const button = document.getElementById("unified-contact-button");
    if (button) {
        button.style.opacity = "1";
        button.style.pointerEvents = "all";
    }
}

// Exponer API para que otros módulos puedan ocultar/mostrar el botón
window.UnifiedContact = {
    hide: hideMainButton,
    show: showMainButton,
    closeVideoCall: closeVideoCallModal
};

// ==========================================
// LIMPIEZA DE CACHÉ
// ==========================================
function clearCacheAndServiceWorkers() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
                registration.unregister();
            }
        });
    }
    if ("caches" in window) {
        caches.keys().then(function (names) {
            for (let name of names) {
                caches.delete(name);
            }
        });
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
function init() {
    console.log("🚀 Inicializando Sistema de Contacto Unificado...");

    clearCacheAndServiceWorkers();
    injectStyles();
    createMainButton();
    createMenu();
    createCallIndicator();
    createVideoCallModal();

    // Cerrar menú al hacer clic fuera
    document.addEventListener("click", (e) => {
        const menu = document.getElementById("unified-contact-menu");
        const button = document.getElementById("unified-contact-button");

        if (menu && button && !menu.contains(e.target) && !button.contains(e.target)) {
            closeMenu();
        }
    });

    console.log("✅ Sistema de Contacto Unificado inicializado correctamente");
}

// ==========================================
// AUTO-INICIALIZAR
// ==========================================
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
