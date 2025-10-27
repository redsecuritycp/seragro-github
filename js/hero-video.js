// ==========================================
// HERO VIDEO - FORCE MUTE
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const heroVideo = document.querySelector('.hero-video video');
    
    if (heroVideo) {
        // Forzar mute en el video del hero
        heroVideo.muted = true;
        heroVideo.volume = 0;
        
        // Asegurar que permanezca muted
        heroVideo.addEventListener('volumechange', function() {
            if (!heroVideo.muted) {
                heroVideo.muted = true;
            }
        });
        
        console.log('✅ Video del hero silenciado correctamente');
    }
});
