document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const overlay = document.getElementById('mobile-overlay');

    // Fonction de bascule (Toggle)
    function toggleMenu() {
        const isOpening = !overlay.classList.contains('open');
        
        menuBtn.classList.toggle('active');
        overlay.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', isOpening);
        
        // Bloquer le scroll du body quand le menu est ouvert
        document.body.style.overflow = isOpening ? 'hidden' : '';
    }

    // Clic sur le burger
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêche le clic de se propager immédiatement
        toggleMenu();
    });

    // Fermer si on clique sur le fond gris (hors du menu blanc)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            toggleMenu();
        }
    });
});