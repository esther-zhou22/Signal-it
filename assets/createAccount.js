document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');
    const msgBox = document.getElementById('signup-message');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const pseudo = document.getElementById('pseudo').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Validation simple
        if (password.length < 8) {
            showMessage("Le mot de passe est trop court.", "msg-error");
            return;
        }

        // --- SIMULATION BACKEND ---
        // On vérifie si l'email existe déjà (simulation via localStorage)
        const existingUsers = JSON.parse(localStorage.getItem('db_users') || "[]");
        const userExists = existingUsers.some(u => u.email === email);

        if (userExists) {
            showMessage("Cet email est déjà utilisé.", "msg-error");
            return;
        }

        // Création du nouvel utilisateur
        const newUser = { pseudo, email, password }; // Note: Jamais de password en clair en prod !
        existingUsers.push(newUser);
        localStorage.setItem('db_users', JSON.stringify(existingUsers));

        // --- AUTO-LOGIN ---
        // On connecte l'utilisateur immédiatement après l'inscription
        localStorage.setItem('user_token', 'token_' + Date.now());
        localStorage.setItem('user_pseudo', pseudo);

        // Feedback succès
        showMessage("Compte créé avec succès ! Redirection...", "msg-info");

        // Redirection différée de 1s
        setTimeout(() => {
            // Si on venait d'un signalement en attente -> add-sign, sinon -> index
            if (localStorage.getItem('draft_signalement')) {
                window.location.href = "add-sign.html";
            } else {
                window.location.href = "dashboard.html";
            }
        }, 1000);
    });

    function showMessage(text, type) {
        msgBox.textContent = text;
        msgBox.className = type; // 'msg-error' ou 'msg-info' (déjà définis dans style.css)
        msgBox.classList.remove('hidden');
    }
});