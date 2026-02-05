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
    // Vérifier si on doit afficher le message
    if (localStorage.getItem('show_success_toast') === 'true') {
        
        // 1. Création de la bannière
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = `
            <span style="font-size:1.5rem; margin-right:10px;">✅</span>
            <div>
                <strong>Signalement enregistré !</strong><br>
                Merci pour votre contribution citoyenne.
            </div>
        `;
        document.body.appendChild(toast);

        // 2. Nettoyage du storage (pour ne pas le réafficher au refresh)
        localStorage.removeItem('show_success_toast');

        // 3. Suppression après 30 secondes
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500); // Temps de l'animation fade out
        }, 30000); // 30 000 ms = 30 secondes
    }
});