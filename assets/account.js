document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const msgBox = document.getElementById('login-message');

    // 1. Message si brouillon en attente
    const draft = localStorage.getItem('draft_signalement');
    if (draft) {
        msgBox.textContent = "Connectez-vous pour valider votre ajout.";
        msgBox.className = "msg-info";
        msgBox.classList.remove('hidden');
    }

    // 2. Soumission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (email && password) {
            // Simulation connexion
            localStorage.setItem('user_token', 'demo_token_12345');
            localStorage.setItem('user_email', email);

            // LOGIQUE DE REDIRECTION :
            // Si un brouillon existe, on retourne le finir sur add-sign.html
            // Sinon, on va sur le dashboard.html
            
            if (localStorage.getItem('draft_signalement')) {
                window.location.href = "add-sign.html";
            } else {
                window.location.href = "dashboard.html"; 
            }

        } else {
            msgBox.textContent = "Erreur : Champs manquants.";
            msgBox.className = "msg-error";
            msgBox.classList.remove('hidden');
        }
    });
});