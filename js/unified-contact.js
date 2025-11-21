import Vapi from "@vapi-ai/web";

// ==========================================
// CONFIGURACIÓN
// ==========================================
const CONFIG = {
    whatsappPhone: "5493401513895",
    whatsappMessage: "Hola, vengo desde el sitio de SER AGRO",
    vapiPublicKey: "5a29292f-d9cc-4a21-bb7e-ff8df74763cd",
    vapiAssistantId: "776543a0-f4a2-4ed7-ad7a-f1fe0f6fd4d4",
    // D-ID Config
    dIdClientKey:
        "Z29vZ2xlLW9hdXRoMnwxMTczNjE5MjY1MDM0NDgwNjY0ODE6cG92c2R4SXZfRjFQOGJvbXlLc3Ew",
    dIdAgentId: "v2_agt_GvlTAw-a",
    primaryColor: "#2E7D32",
    secondaryColor: "#1B5E20",
    whatsappColor: "#25D366",
    videoCallColor: "#9C27B0",
};

let menuOpen = false;
let vapiClient = null;
let inCall = false;
let dIdLoaded = false;

// ==========================================
// DETECTAR ANDROID Y AGREGAR CLASE AL BODY
// ==========================================
if (/Android/i.test(navigator.userAgent)) {
    if (document.body) {
        document.body.classList.add("is-android");
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            document.body.classList.add("is-android");
        });
    }
}

// ==========================================
// INICIALIZAR CLIENTE VAPI
// ==========================================
function initVapiClient() {
    if (!vapiClient) {
        vapiClient = new Vapi(CONFIG.vapiPublicKey);

        // Eventos del cliente Vapi
        vapiClient.on("call-start", () => {
            console.log("✅ Llamada iniciada");
            inCall = true;
            showCallIndicator();
        });

        vapiClient.on("call-end", () => {
            console.log("✅ Llamada finalizada");
            inCall = false;
            hideCallIndicator();
        });

        vapiClient.on("error", (error) => {
            console.error("❌ Error en Vapi:", error);
            alert(
                "Ocurrió un error durante la llamada. Por favor, intentá de nuevo.",
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

    if (indicator) {
        indicator.classList.add("active");
        indicator.style.display = "flex";
    }
    if (overlay) overlay.classList.add("active");
    if (mainButton) mainButton.style.display = "none";

    document.body.style.overflow = "hidden";
}

function hideCallIndicator() {
    const indicator = document.getElementById("call-indicator");
    const overlay = document.getElementById("call-overlay");
    const mainButton = document.getElementById("unified-contact-button");

    if (indicator) {
        indicator.classList.remove("active");
        indicator.style.display = "none";
    }
    if (overlay) overlay.classList.remove("active");
    if (mainButton) mainButton.style.display = "flex";

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

window.UnifiedContact = {
    hide: hideMainButton,
    show: showMainButton,
};

// ==========================================
// LIMPIEZA DE CACHÉ
// ==========================================
function clearCacheAndServiceWorkers() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .getRegistrations()
            .then(function (registrations) {
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
// D-ID VIDEO LLAMADA - CARGAR AGENTE
// ==========================================
function loadDIdAgent() {
    const modal = document.getElementById("did-video-modal");

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    if (dIdLoaded) {
        console.log("✅ D-ID ya estaba cargado");
        return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://agent.d-id.com/v2/index.js";
    script.setAttribute("data-mode", "full");
    script.setAttribute("data-client-key", CONFIG.dIdClientKey);
    script.setAttribute("data-agent-id", CONFIG.dIdAgentId);
    script.setAttribute("data-name", "did-agent");
    script.setAttribute("data-monitor", "true");
    script.setAttribute("data-target-id", "did-agent-container");

    script.onload = () => {
        console.log("✅ D-ID Agent cargado");
        dIdLoaded = true;
    };

    script.onerror = () => {
        console.error("❌ Error al cargar D-ID");
        closeDIdModal();
        alert("Error al cargar videollamada. Intentá nuevamente.");
    };

    document.body.appendChild(script);
}

function closeDIdModal() {
    const modal = document.getElementById("did-video-modal");
    const container = document.getElementById("did-agent-container");
    
    // PASO 1: Eliminar todos los scripts de D-ID del DOM
    const didScripts = document.querySelectorAll('script[src*="d-id.com"], script[data-name="did-agent"]');
    didScripts.forEach(script => script.remove());
    
    // PASO 2: Limpiar y recrear el contenedor completamente para forzar destrucción del agente
    if (container) {
        const parent = container.parentNode;
        const newContainer = document.createElement("div");
        newContainer.id = "did-agent-container";
        newContainer.className = "did-agent-container";
        parent.replaceChild(newContainer, container);
    }
    
    // PASO 3: Resetear el estado para permitir volver a cargar limpio
    dIdLoaded = false;
    
    // PASO 4: Ocultar modal y restaurar scroll
    modal.classList.remove("active");
    document.body.style.overflow = "";
    
    console.log("✅ D-ID Agent destruido completamente");
}

// ==========================================
// CREAR BOTÓN PRINCIPAL
// ==========================================
function createMainButton() {
    const button = document.createElement("button");
    button.id = "unified-contact-button";
    button.className = "unified-contact-main-button";
    button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style="flex-shrink: 0;">
            <circle cx="8" cy="12" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="16" cy="12" r="1.5"/>
            <path d="M12 2C6.48 2 2 6.48 2 12C2 13.93 2.60 15.72 3.64 17.19L2.5 21.5L7.08 20.38C8.46 21.24 10.17 21.75 12 21.75C17.52 21.75 22 17.27 22 11.75C22 6.23 17.52 2 12 2Z" opacity="0.3"/>
        </svg>
        <span>Hablá con nosotros</span>
    `;
    button.addEventListener("click", toggleMenu);
    document.body.appendChild(button);
}

// ==========================================
// CREAR MENÚ DE OPCIONES
// ==========================================
function createOptionsMenu() {
    const menu = document.createElement("div");
    menu.id = "unified-contact-menu";
    menu.className = "unified-contact-menu";

    const whatsappOption = document.createElement("button");
    whatsappOption.className = "contact-option whatsapp-option";
    whatsappOption.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span>WhatsApp</span>
    `;
    whatsappOption.addEventListener("click", handleWhatsAppClick);

    const telegramOption = document.createElement("button");
    telegramOption.className = "contact-option telegram-option";
    telegramOption.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
        </svg>
        <span>Telegram</span>
    `;
    telegramOption.addEventListener("click", handleTelegramClick);

    const chatOption = document.createElement("button");
    chatOption.className = "contact-option chat-option";
    chatOption.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            <circle cx="9" cy="10" r="1.5"/>
            <circle cx="12" cy="10" r="1.5"/>
            <circle cx="15" cy="10" r="1.5"/>
        </svg>
        <span>Chat</span>
    `;
    chatOption.addEventListener("click", handleChatClick);

    const callOption = document.createElement("button");
    callOption.className = "contact-option call-option";
    callOption.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
        </svg>
        <span>Llamar</span>
    `;
    callOption.addEventListener("click", handleCallClick);

    const videoCallOption = document.createElement("button");
    videoCallOption.className = "contact-option videocall-option";
    videoCallOption.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
        <span>Videollamada</span>
    `;
    videoCallOption.addEventListener("click", handleVideoCallClick);

    menu.appendChild(whatsappOption);
    menu.appendChild(telegramOption);
    menu.appendChild(chatOption);
    menu.appendChild(callOption);
    menu.appendChild(videoCallOption);
    document.body.appendChild(menu);
}

// ==========================================
// DETECTAR SOLO DISPOSITIVOS ANDROID
// ==========================================
function isAndroidDevice() {
    const userAgent = navigator.userAgent;
    return /Android/i.test(userAgent) || /Pixel/i.test(userAgent);
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

    // ✅ DISEÑO UNIFICADO: Botón rectangular blanco con texto "Colgar" para TODOS los dispositivos
    indicator.innerHTML = `
        <div class="call-animation">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
        </div>
        <div class="call-status">En llamada...</div>
        <button class="end-call-btn" id="end-call-btn">Colgar</button>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(indicator);

    document.getElementById("end-call-btn").addEventListener("click", endCall);
}

// ==========================================
// CREAR MODAL DE D-ID
// ==========================================
function createDIdModal() {
    const modal = document.createElement("div");
    modal.id = "did-video-modal";
    modal.className = "did-video-modal";
    modal.innerHTML = `
        <div class="did-modal-content">
            <button class="did-close-btn" id="did-close-btn">✕</button>
            <div id="did-agent-container" class="did-agent-container"></div>
        </div>
    `;
    document.body.appendChild(modal);

    document
        .getElementById("did-close-btn")
        .addEventListener("click", closeDIdModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeDIdModal();
        }
    });
}

// ==========================================
// ESTILOS CSS
// ==========================================
function addStyles() {
    const styles = `
        .unified-contact-main-button {
            position: fixed;
            bottom: calc(100px + env(safe-area-inset-bottom, 0px));
            right: 35px;
            background: linear-gradient(135deg, ${CONFIG.primaryColor} 0%, ${CONFIG.secondaryColor} 100%);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 16px 28px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(46, 125, 50, 0.4);
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 9998;
            font-family: 'Open Sans', sans-serif;
            animation: subtlePulse 2s ease-in-out infinite;
        }

        .unified-contact-main-button span {
            flex: 0 0 auto;
        }

        @keyframes subtlePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        @keyframes subtlePulseMobile {
            0%, 100% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.05); }
        }

        .unified-contact-main-button:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 6px 30px rgba(46, 125, 50, 0.5);
            animation: none;
        }

        .unified-contact-main-button.menu-open {
            background: linear-gradient(135deg, ${CONFIG.secondaryColor} 0%, #0d3f10 100%);
        }

        .unified-contact-menu {
            position: fixed;
            bottom: calc(180px + env(safe-area-inset-bottom, 0px));
            right: 35px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 9997;
        }

        .unified-contact-menu.show {
            opacity: 1;
            pointer-events: all;
            transform: translateY(0);
        }

        .contact-option {
            background: white;
            border: none;
            border-radius: 50px;
            padding: 14px 24px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Open Sans', sans-serif;
            opacity: 0;
        }

        .contact-option span {
            flex: 0 0 auto;
        }

        .unified-contact-menu.show .contact-option {
            animation: slideIn 0.4s ease-out forwards;
        }

        .unified-contact-menu.show .contact-option:nth-child(1) {
            animation-delay: 0.05s;
        }

        .unified-contact-menu.show .contact-option:nth-child(2) {
            animation-delay: 0.1s;
        }

        .unified-contact-menu.show .contact-option:nth-child(3) {
            animation-delay: 0.15s;
        }

        .unified-contact-menu.show .contact-option:nth-child(4) {
            animation-delay: 0.2s;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        .contact-option:hover {
            transform: translateX(-5px) scale(1.05);
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
        }

        .whatsapp-option {
            color: ${CONFIG.whatsappColor};
        }

        .whatsapp-option svg {
            fill: ${CONFIG.whatsappColor};
        }

        .telegram-option {
            color: #0088cc;
        }

        .telegram-option svg {
            fill: #0088cc;
        }

        .chat-option {
            color: ${CONFIG.primaryColor};
        }

        .chat-option svg {
            fill: ${CONFIG.primaryColor};
        }

        .call-option {
            color: #1976D2;
        }

        .call-option svg {
            fill: #1976D2;
        }

        .videocall-option {
            color: ${CONFIG.videoCallColor};
        }

        .videocall-option svg {
            fill: ${CONFIG.videoCallColor};
        }

        .did-video-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 100000;
            justify-content: center;
            align-items: center;
        }

        .did-video-modal.active {
            display: flex;
        }

        .did-modal-content {
            position: relative;
            width: 90%;
            max-width: 900px;
            height: 85vh;
            background: #000;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .did-agent-container {
            width: 100%;
            height: 100%;
        }

        .did-close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 28px;
            z-index: 100001;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 300;
        }

        .did-close-btn:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: rotate(90deg);
            border-color: rgba(255, 255, 255, 0.5);
        }

        .call-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            z-index: 99998;
            display: none;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }

        .call-overlay.active {
            display: block;
        }

        /* 🎯 DISEÑO PERFECTO DEL INDICADOR DE LLAMADA (del segundo archivo) */
        .call-indicator {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 20px;
            padding: 30px 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 99999;
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

        /* 🎯 Botón Colgar - PC e iPhone (rectangular blanco con texto) */
        .end-call-btn {
            padding: 12px 30px;
            background: white;
            color: #f44336;
            border: 2px solid #f44336;
            border-radius: 25px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 0.5px;
            font-family: 'Open Sans', sans-serif;
        }

        .end-call-btn:hover {
            background: #f5f5f5;
            transform: scale(1.05);
        }

        /* 🎯 Botón Colgar - Android (circular rojo con ícono) - DISEÑO PERFECTO */
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
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
        }

        .end-call-btn-circular:hover {
            background: #d32f2f;
            transform: scale(1.05);
        }

        .vapi-btn {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }

        @media (max-width: 768px) {
            .unified-contact-main-button {
                bottom: calc(100px + env(safe-area-inset-bottom, 0px));
                left: 50%;
                right: auto;
                transform: translateX(-50%);
                padding: 14px 24px;
                font-size: 20px;
                box-sizing: border-box;
                width: auto;
                max-width: calc(100vw - 40px);
                white-space: nowrap;
                animation: subtlePulseMobile 2s ease-in-out infinite;
            }

            .unified-contact-main-button:hover {
                transform: translateX(-50%) translateY(-3px) scale(1.05);
            }

            .unified-contact-menu {
                bottom: calc(180px + env(safe-area-inset-bottom, 0px));
                left: 50%;
                right: auto;
                transform: translateX(-50%);
                gap: 10px;
                align-items: center;
                box-sizing: border-box;
                width: auto;
                max-width: calc(100vw - 40px);
            }

            .unified-contact-menu.show {
                transform: translateX(-50%) translateY(0);
            }

            .contact-option {
                padding: 13px 22px;
                font-size: 14px;
                gap: 10px;
                width: 100%;
                max-width: 280px;
                justify-content: center;
            }

            .unified-contact-menu.show .contact-option {
                transform: translateX(0);
                animation: fadeIn 0.4s ease-out forwards;
            }

            .contact-option:hover {
                transform: scale(1.03);
            }

            .did-modal-content {
                width: 92%;
                height: 75vh;
                max-height: 600px;
                border-radius: 12px;
            }

            .did-close-btn {
                top: 15px;
                right: 15px;
                width: 44px;
                height: 44px;
                font-size: 24px;
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
        }

        @media (max-width: 480px) {
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

            .did-modal-content {
                width: 95%;
                height: 70vh;
                max-height: 550px;
                border-radius: 8px;
            }

            .did-close-btn {
                top: 10px;
                right: 10px;
                width: 40px;
                height: 40px;
                font-size: 20px;
            }

            .contact-option {
                max-width: 260px;
            }
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// ==========================================
// TOGGLE MENÚ
// ==========================================
function toggleMenu() {
    const button = document.getElementById("unified-contact-button");
    const menu = document.getElementById("unified-contact-menu");

    menuOpen = !menuOpen;

    if (menuOpen) {
        menu.classList.add("show");
        button.classList.add("menu-open");
    } else {
        menu.classList.remove("show");
        button.classList.remove("menu-open");
    }
}

// ==========================================
// HANDLERS DE OPCIONES
// ==========================================
function generateWhatsAppMessage() {
    const greetings = ["Hola", "Buenos días", "Buenas tardes", "Hola!"];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${hours}:${minutes}`;
    
    return `${randomGreeting}, vengo desde el sitio de SER AGRO (${timestamp})`;
}

function handleWhatsAppClick() {
    const message = generateWhatsAppMessage();
    const url = `https://api.whatsapp.com/send?phone=${CONFIG.whatsappPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toggleMenu();
}

function handleTelegramClick() {
    const url = "https://t.me/Mavilda_bot";
    window.open(url, "_blank");
    toggleMenu();
}

function handleChatClick() {
    toggleMenu();
    hideMainButton();
    if (window.MavildaChat && typeof window.MavildaChat.open === "function") {
        window.MavildaChat.open();
    }
}

async function handleCallClick() {
    toggleMenu();

    try {
        const client = initVapiClient();
        console.log("🎯 Iniciando llamada con Vapi...");
        await client.start(CONFIG.vapiAssistantId);
    } catch (error) {
        console.error("❌ Error al iniciar llamada:", error);
        alert("No se pudo iniciar la llamada. Por favor, intentá de nuevo.");
        hideCallIndicator();
    }
}

function handleVideoCallClick() {
    toggleMenu();
    loadDIdAgent();
}

function endCall() {
    if (vapiClient && inCall) {
        try {
            vapiClient.stop();
            console.log("✅ Llamada detenida por el usuario");
        } catch (error) {
            console.error("❌ Error al detener llamada:", error);
        }
    }
}

// ==========================================
// DETECTAR ANDROID
// ==========================================
function detectAndroid() {
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent) || /Pixel/i.test(userAgent);

    console.log("🔍 Detectando dispositivo...");
    console.log("User Agent completo:", userAgent);
    console.log("¿Es Android/Pixel?:", isAndroid);

    const isMobileView = /Mobile/i.test(userAgent);
    if (isMobileView) {
        console.log("📱 Vista móvil detectada");
    }

    if (isAndroid || isMobileView) {
        document.documentElement.classList.add("is-android");
        console.log("✅ Clase 'is-android' agregada al HTML");
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
function init() {
    clearCacheAndServiceWorkers();
    detectAndroid();
    createMainButton();
    createOptionsMenu();
    createCallIndicator();
    createDIdModal();
    addStyles();
    initVapiClient();

    console.log("✅ Sistema de comunicación unificado cargado correctamente");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

console.log("✅ UNIFIED CONTACT - CON VIDEOLLAMADA D-ID");
console.log("📱 User Agent:", navigator.userAgent);
console.log(
    "🔍 Android/Pixel detectado:",
    /Android|Pixel/i.test(navigator.userAgent),
);

if (
    window.location.hostname.includes("replit") ||
    window.location.hostname.includes("repl")
) {
    console.log("⚠️ Detectado entorno Replit - Activando modo debug");
}
