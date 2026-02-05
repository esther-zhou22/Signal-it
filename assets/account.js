document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const msgBox = document.getElementById('login-message');

    // 1. Check si l'utilisateur vient du formulaire (draft)
    const draft = localStorage.getItem('draft_signalement');
    if (draft) {
        msgBox.textContent = "Connectez-vous pour valider votre signalement en attente.";
        msgBox.className = "msg-info"; // Affiche une info bleue
        msgBox.classList.remove('hidden');
    }

    // 2. Gestion de la soumission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // --- SIMULATION BACKEND ---
        // Accepte n'importe quel mot de passe pour le moment
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (email && password) {
            // Simulation : On enregistre un token fictif
            localStorage.setItem('user_token', 'demo_token_12345');
            localStorage.setItem('user_email', email);

            // --- REDIRECTION INTELLIGENTE ---
            if (localStorage.getItem('draft_signalement')) {
                // Cas A : Il a un signalement en attente -> Retour au form
                window.location.href = "add-sign.html";
            } else {
                // Cas B : Connexion normale -> Tableau de bord (ou accueil)
                window.location.href = "index.html"; 
            }
        } else {
            msgBox.textContent = "Erreur : Champs manquants.";
            msgBox.className = "msg-error";
            msgBox.classList.remove('hidden');
        }
    });
});