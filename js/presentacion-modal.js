// ==========================================
// MODAL DE PRESENTACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('ver-presentacion-btn');
    const modal = document.getElementById('presentacion-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const video = document.getElementById('presentacion-video');

    // Abrir modal
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
        
        // ✅ Asegurar que video esté muteado - usuario controla play/unmute manualmente
        // Esto evita que iOS/Safari bloqueen la reproducción
        video.muted = true;
    });

    // Cerrar modal
    function closeModal() {
        modal.classList.remove('active');
        video.pause(); // Pausar video al cerrar
        video.muted = true; // Silenciar video
        video.currentTime = 0; // Reiniciar video al inicio
        document.body.style.overflow = ''; // Restaurar scroll
    }

    closeBtn.addEventListener('click', closeModal);

    // Cerrar al hacer clic en el overlay
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});
