# SER AGRO - Drones Agrícolas

## Overview

SER AGRO is a corporate website for an agricultural drone distributor specializing in DJI equipment. The site showcases agricultural drones (DJI AGRAS T50, T100, and Mavic 3 Multispectral) with product pages, technical documentation, firmware updates, and an AI-powered chat assistant named "Mavilda" for customer support. The site aims to provide comprehensive information and seamless customer interaction for agricultural drone solutions.

## User Preferences

Preferred communication style: Simple, everyday language.

### Critical Configuration Rules
- **Port Configuration**: Internal port 5000 maps to external port 80 (configured in `.replit`)
  - Development: Vite runs on localhost:5000 with HMR (Hot Module Replacement)
  - Production: `serve` package serves `dist/` folder on port 5000
- **Workflow Management**: Single "Server" workflow runs `npm run dev` (Vite dev server)
  - Vite has built-in HMR - server auto-reloads on file changes WITHOUT restarting
  - Use `restart_workflow("Server")` only when necessary (after config changes, etc.)
  - Server should NOT stop after code modifications - HMR handles updates automatically

## System Architecture

### Frontend Architecture
- **Static Multi-Page Site**: Built with pure HTML5, CSS3, and vanilla JavaScript.
- **Responsive Design**: Mobile-first approach utilizing CSS media queries and responsive navigation.
- **Video Integration**: Hero sections feature autoplaying background videos for product showcases.
- **Navigation Pattern**: Consistent header with dropdown menus across all pages.

### Page Structure
- **Core Pages**: Homepage (`index.html`), dedicated product pages (T50, T100, Mavic 3), firmware update instructions (`firmware-generador.html`), privacy policy (`privacidad.html`), and terms and conditions (`terminos.html`).
- **Consistent Layout**: All pages share a unified header and navigation structure.

### Interactive Features
- **Mobile Navigation**: Hamburger menu with toggle functionality.
- **Dropdown Menus**: Interactive menus for equipment and downloads.
- **Unified Contact System**: A single "Hablá con nosotros" button (green oval, pulsing animation) located at the bottom right, expanding into a menu with three communication options:
    - **WhatsApp**: Direct messaging to +54 9 3401 51-3895 with anti-spam protection using variable messages. Each click generates a unique message combining random greetings ("Hola", "Buenos días", "Buenas tardes", "Hola!") with timestamp in HH:MM format (e.g., "Hola, vengo desde el sitio de SER AGRO (14:52)"). This prevents WhatsApp from flagging repeated messages as spam and improves delivery rates to n8n backend.
    - **Chat**: Opens the Mavilda AI assistant widget.
    - **Llamar**: Initiates a voice call via Vapi AI.
    - **Android Fix**: Uses a mobile-specific `subtlePulseMobile` animation that combines `translateX(-50%)` with `scale()` to maintain button centering during the pulse animation. The standard `subtlePulse` animation was overwriting the `transform: translateX(-50%)` centering, causing the button to drift right and text to be cut off on Android devices with wider Roboto fonts. The mobile-specific keyframes preserve both the centering transform and the pulse effect simultaneously.
    - **Mobile Button Positioning**: Contact button positioned at `left: 50%` with `transform: translateX(-50%)` in mobile view for proper centering.
- **Call Indicator**: A pill-shaped red banner displayed during active voice calls, featuring:
    - Left side: Pulsing white dot with "En llamada..." status text
    - Right side: "Colgar" button with white solid background and red text
    - Full-screen dark overlay behind the indicator for focus
    - Horizontal layout (`flex-direction: row`, `justify-content: space-between`) with centered content
    - **Desktop Positioning**: 60px above bottom, horizontally centered with `left: 50%` + `transform: translateX(-50%)`
    - **Mobile Positioning**: Centered both horizontally AND vertically using `top: 50%`, `left: 50%` + `transform: translate(-50%, -50%)` for optimal visibility and accessibility
    - Width: `calc(100% - 40px)` with `max-width: 600px` (desktop), 500px (mobile) for side margins
    - Pill-shaped design with `border-radius: 50px` for rounded corners
    - Compact vertical padding (14px top on desktop, 12px on mobile) for sleek appearance
    - Desktop: Slide-up animation with `translate(-50%, Y)`
    - Mobile: Fade-in animation from center with scale effect (`fadeInCenter`) for smooth appearance
- **Mavilda Chat Widget**: An AI-powered, session-based customer support chat with a webhook integration for backend processing and auto-greeting.
    - **Logo Fix**: Image renamed to `mavilda-logo.png` (without spaces) to ensure compatibility in both development and production builds. Path: `/imagenes/mavilda-logo.png`
    - **Mobile Optimization**: Uses `@media (max-width: 768px)` with centered layout (`left: 50%` + `transform: translateX(-50%)`), `max-height: 280px` to prevent compression when Android keyboard appears, and `env(safe-area-inset-bottom)` for proper keyboard handling. This ensures the Mavilda logo remains visible and chat content doesn't get cut off when user is typing on mobile devices.
- **Video Presentation Modal**: A centered modal displaying a promotional video (`/videos/mavilda-presentacion.mp4`).
    - **Trigger Button**: Green olive-colored button labeled "Ver presentación" positioned directly below the "CONTACTANOS" button in the hero section, using flexbox column layout (`.hero-buttons` container).
    - **Modal Design**: Semi-transparent dark overlay with centered content, featuring rounded corners (`border-radius: 16px`) on video player.
    - **Video Behavior**: Video does NOT autoplay - remains muted and paused when modal opens. User must manually click play button and can unmute using native video controls. This prevents accidental playback on mobile devices and ensures iOS/Safari compatibility (browsers block unmuted autoplay).
    - **Accidental Activation Protection**: Multi-layer security system to prevent unwanted modal activation:
        - **Page Scope**: Script only executes on homepage (pathname check for `/`, `/index.html`)
        - **Trusted Events Only**: Requires `e.isTrusted` validation, blocking programmatic `btn.click()` calls
        - **User Gesture Flag**: `allowModalOpen` flag ensures modal only opens during direct user click interaction
        - **Button State Validation**: Checks button is enabled before activation
        - **Event Target Validation**: Verifies click originates from button, not event bubbling
        - **Contact Menu Integration**: Button automatically disables when "Hablá con nosotros" menu opens (managed in `/js/unified-contact.js`)
        - This prevents interference with Mavilda chat interactions and other user workflows
    - **Mobile Protection**: Uses `preventDefault()` and `stopPropagation()` on button click events to prevent ghost taps on mobile devices.
    - **Close Functionality**: White circular X button in top-right corner, plus click-outside-to-close on overlay and Escape key support. Fade-out animation on close with automatic video pause, mute, and reset to beginning.
    - **JavaScript**: Implemented in `/js/presentacion-modal.js` with DOMContentLoaded event handling and proper cleanup on modal close.

### Styling Approach
- **CSS Variables**: Centralized color scheme, predominantly agricultural green (#2E7D32, #1B5E20).
- **Responsive Components**: Flexible layouts adapting to various screen sizes.
- **Video Backgrounds**: Full-screen video heroes with overlay content.

### Asset Management
- **Static Assets**: All static assets (images, videos, PDFs) are stored in the `public/` directory for proper Vite build handling:
  - Images: `public/imagenes/`
  - Videos: `public/videos/`
  - PDF datasheets: `public/attached_assets/`
- Vite automatically copies the `public/` directory contents to the production build, ensuring assets are available in both development and production environments.

## External Dependencies

### Analytics & Tracking
- **Google Analytics (gtag.js)**: Integrated for conversion tracking with ID `AW-17289441166`.

### Third-Party Integrations
- **Chat Backend**: Railway-hosted webhook service at `https://primary-production-396f31.up.railway.app/webhook/mavilda-chat` for AI chat assistant.
- **Vapi Voice AI**: NPM package `@vapi-ai/web` (v2.5.0) for real-time voice conversations. Public Key: `5a29292f-d9cc-4a21-bb7e-ff8df74736cd`, Assistant ID: `776543a0-f4a2-4ed7-ad7a-f1fe0f6fd4d4`.

### External Resources
- **Google Fonts**: Open Sans font family.
- **Font Awesome**: Icon library (Kit: 14b830158f.js).

### Build & Development
- **Vite**: Frontend build tool and dev server (v7.1.11), configured for ES module processing, HMR, and multi-page application bundling.
- **Deployment Platform**: Replit Autoscale deployment, using `npm run build` for compilation to `dist/` and `npx serve -l 5000` for serving static files. Configuration in `.replit` specifies `publicDir = "dist"` and `externalPort = 80`.