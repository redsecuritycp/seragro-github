// ==========================================
// SISTEMA DE ZOOM PARA IMÁGENES DE PRECIOS
// SER AGRO - Pablo
// ==========================================

(function() {
    'use strict';
    
    // Verificar que estamos en el DOM correcto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initZoomSystem);
    } else {
        initZoomSystem();
    }
    
    function initZoomSystem() {
        // Crear estructura HTML del zoom dinámicamente
        createZoomStructure();
        
        // Obtener elementos
        const zoomOverlay = document.getElementById('zoomOverlay');
        const zoomContainer = document.getElementById('zoomContainer');
        const zoomImage = document.getElementById('zoomImage');
        const zoomClose = document.getElementById('zoomClose');
        const body = document.body;
        
        // Variable para trackear estado
        let isZoomActive = false;
        
        // Función para crear la estructura HTML
        function createZoomStructure() {
            // Verificar si ya existe
            if (document.getElementById('zoomOverlay')) return;
            
            // Crear overlay
            const overlay = document.createElement('div');
            overlay.className = 'imagen-zoom-overlay';
            overlay.id = 'zoomOverlay';
            
            // Crear contenedor
            const container = document.createElement('div');
            container.className = 'imagen-zoom-container';
            container.id = 'zoomContainer';
            
            // Crear imagen
            const img = document.createElement('img');
            img.id = 'zoomImage';
            img.src = '';
            img.alt = 'Imagen ampliada';
            container.appendChild(img);
            
            // Crear botón cerrar
            const closeBtn = document.createElement('button');
            closeBtn.className = 'imagen-zoom-close';
            closeBtn.id = 'zoomClose';
            closeBtn.innerHTML = '✕';
            closeBtn.setAttribute('aria-label', 'Cerrar zoom');
            
            // Agregar al body
            document.body.appendChild(overlay);
            document.body.appendChild(container);
            document.body.appendChild(closeBtn);
            
            // Agregar estilos CSS si no existen
            if (!document.querySelector('#zoom-styles')) {
                const styles = document.createElement('style');
                styles.id = 'zoom-styles';
                styles.textContent = `
                    .imagen-zoom-overlay {
                        display: none;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.9);
                        z-index: 9998;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                        cursor: zoom-out;
                    }
                    
                    .imagen-zoom-overlay.active {
                        display: block;
                        opacity: 1;
                    }
                    
                    .imagen-zoom-container {
                        display: none;
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) scale(0.9);
                        max-width: 90vw;
                        max-height: 90vh;
                        z-index: 9999;
                        opacity: 0;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    
                    .imagen-zoom-container.active {
                        display: block;
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    
                    .imagen-zoom-container img {
                        width: 100%;
                        height: auto;
                        max-width: 1200px;
                        max-height: 85vh;
                        object-fit: contain;
                        border-radius: 8px;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                        background: white;
                    }
                    
                    .imagen-zoom-close {
                        position: fixed;
                        top: 30px;
                        right: 30px;
                        width: 50px;
                        height: 50px;
                        background: white;
                        border: none;
                        border-radius: 50%;
                        cursor: pointer;
                        z-index: 10000;
                        display: none;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        font-weight: 300;
                        color: #333;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    }
                    
                    .imagen-zoom-close:hover {
                        background: #f5f5f5;
                        transform: rotate(90deg);
                    }
                    
                    .imagen-zoom-close.active {
                        display: flex;
                    }
                    
                    .precio-image {
                        position: relative;
                        cursor: zoom-in !important;
                    }
                    
                    .precio-image::after {
                        content: "🔍 Click para ampliar";
                        position: absolute;
                        bottom: 10px;
                        right: 10px;
                        background: rgba(0, 0, 0, 0.7);
                        color: white;
                        padding: 5px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                        pointer-events: none;
                    }
                    
                    .precio-image:hover::after {
                        opacity: 1;
                    }
                    
                    body.zoom-active {
                        overflow: hidden !important;
                    }
                    
                    @media (max-width: 768px) {
                        .precio-image::after {
                            display: none;
                        }
                        
                        .precio-image {
                            cursor: default !important;
                        }
                        
                        .imagen-zoom-close {
                            top: 20px;
                            right: 20px;
                            width: 40px;
                            height: 40px;
                            font-size: 20px;
                        }
                    }
                `;
                document.head.appendChild(styles);
            }
        }
        
        // Función para abrir zoom
        function openZoom(imageSrc) {
            // No zoom en mobile
            if (window.innerWidth <= 768) return;
            
            isZoomActive = true;
            zoomImage.src = imageSrc;
            
            // Activar elementos
            zoomOverlay.classList.add('active');
            zoomContainer.classList.add('active');
            zoomClose.classList.add('active');
            body.classList.add('zoom-active');
            
            // Forzar display después de un tick
            setTimeout(() => {
                zoomOverlay.style.display = 'block';
                zoomContainer.style.display = 'block';
            }, 10);
        }
        
        // Función para cerrar zoom
        function closeZoom() {
            if (!isZoomActive) return;
            
            isZoomActive = false;
            
            // Desactivar elementos
            zoomOverlay.classList.remove('active');
            zoomContainer.classList.remove('active');
            zoomClose.classList.remove('active');
            body.classList.remove('zoom-active');
            
            // Ocultar después de la animación
            setTimeout(() => {
                zoomOverlay.style.display = 'none';
                zoomContainer.style.display = 'none';
                zoomImage.src = '';
            }, 300);
        }
        
        // Configurar event listeners
        function setupEventListeners() {
            // Click en imágenes
            document.querySelectorAll('.precio-image').forEach(img => {
                img.addEventListener('click', function(e) {
                    e.stopPropagation();
                    openZoom(this.src);
                });
            });
            
            // Cerrar con botón X
            zoomClose.addEventListener('click', function(e) {
                e.stopPropagation();
                closeZoom();
            });
            
            // Cerrar con overlay
            zoomOverlay.addEventListener('click', function() {
                closeZoom();
            });
            
            // Cerrar con ESC
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && isZoomActive) {
                    closeZoom();
                }
            });
            
            // No cerrar al hacer click en la imagen
            zoomContainer.addEventListener('click', function(e) {
                e.stopPropagation();
            });
            
            // Cerrar si se redimensiona a mobile
            let resizeTimer;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    if (window.innerWidth <= 768 && isZoomActive) {
                        closeZoom();
                    }
                }, 250);
            });
        }
        
        // Inicializar
        setupEventListeners();
        
        // Re-aplicar a nuevas imágenes si se agregan dinámicamente
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.classList && node.classList.contains('precio-image')) {
                        node.addEventListener('click', function(e) {
                            e.stopPropagation();
                            openZoom(this.src);
                        });
                    }
                });
            });
        });
        
        // Observar cambios en el body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Sistema de zoom para imágenes cargado correctamente');
    }
})();
