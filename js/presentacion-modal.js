// ==========================================
// MODAL DE PRESENTACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // ✅ PROTECCIÓN CRÍTICA: SOLO ejecutar en la página de inicio
    const currentPage = window.location.pathname;
    const isHomePage = currentPage === '/' || currentPage === '/index.html' || currentPage.endsWith('/');
    
    if (!isHomePage) {
        return;
    }

    const btn = document.getElementById('ver-presentacion-btn');
    const modal = document.getElementById('presentacion-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const video = document.getElementById('presentacion-video');

    // ✅ PROTECCIÓN: Verificar que TODOS los elementos existan
    if (!btn || !modal || !closeBtn || !video) {
        return;
    }

    // ✅ BANDERA DE SEGURIDAD: Solo permitir abrir modal con gesto real del usuario
    let allowModalOpen = false;

    // Abrir modal - SOLO con click directo del usuario
    btn.addEventListener('click', function(e) {
        // ✅ PROTECCIÓN: Si el chat de Mavilda está abierto, NO abrir el modal
        if (window.isChatOpen === true) {
            return;
        }

        // ✅ PROTECCIÓN: Verificar que es un evento "trusted" (no programático)
        if (!e.isTrusted) {
            return;
        }

        // ✅ PROTECCIÓN: Verificar que el evento viene directamente del botón
        if (e.target !== btn && !btn.contains(e.target)) {
            return;
        }

        // ✅ PROTECCIÓN: Si el botón está deshabilitado, no hacer nada
        if (btn.disabled) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        
        // Activar bandera y abrir modal
        allowModalOpen = true;
        openModal();
        allowModalOpen = false;
    });

    // Función para abrir modal (solo si se permite)
    function openModal() {
        if (!allowModalOpen) {
            return;
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        video.muted = true;
    }

    // Cerrar modal
    function closeModal() {
        if (!modal.classList.contains('active')) {
            return;
        }
        
        modal.classList.remove('active');
        video.pause();
        video.muted = true;
        video.currentTime = 0;
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);

    // Cerrar al hacer clic en el overlay
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});
