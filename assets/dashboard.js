document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURATION DES DONNÉES ---
    const sigdexGrid = document.getElementById('sigdex-grid');
    let allSigns = [];

    // A. TES 4 VRAIS CONTENUS (Modifie les valeurs ici)
    const myRealSigns = [
        {
            type: "Panneau Réglementaire 1",
            etat: "Neuf",
            date: "04/02/2026",
            loc: "Parc de la Deûle",
            img: "assets/images/reglementaire1.jpeg", // Assure-toi que cette image existe
            color: null // Pas besoin de couleur si image
        },
        {
            type: "Panneau Réglementaire 2",
            etat: "Abîmé",
            date: "03/02/2026",
            loc: "Parc du Héron",
            img: "assets/images/reglementaire2.jpg",
            color: null
        },
        {
            type: "Panneau Directionnel 1",
            etat: "Bon état",
            date: "01/02/2026",
            loc: "Parc de la Lys",
            img: "assets/images/directionnel1.png",
            color: null
        },
        {
            type: "Panneau informatif",
            etat: "Bon état",
            date: "28/01/2026",
            loc: "Parc du Héron",
            img: "assets/images/informatif1.jpg",
            color: null
        }
    ];

    // B. FONCTION POUR GÉNÉRER LE RESTE (ALÉATOIRE SANS IMAGE)
    function generateRandomSigns(targetTotal) {
        // 1. On commence par ajouter les vrais
        myRealSigns.forEach((sign, index) => {
            allSigns.push({
                id: index + 1, // ID 1, 2, 3, 4
                ...sign
            });
        });

        // 2. On complète avec du faux jusqu'au total voulu
        const types = ["Panneau informatif", "Panneau directionnel", "Panneau réglementaire"];
        const etats = ["Bon état","Abîmé / Tagué","Cassé / Manquant","Neuf / Très bon état",]
        
        const currentCount = allSigns.length;
        
        for (let i = 0; i < (targetTotal - currentCount); i++) {
            allSigns.push({
                id: currentCount + i + 1,
                type: types[Math.floor(Math.random() * types.length)],
                date: "01/01/2026",
                etat: etats[Math.floor(Math.random()*etats.length)],
                loc: "Inconnu",
                img: "", // PAS D'IMAGE
                color: ""
            });
        }
    }

    // ON LANCE LA GÉNÉRATION (Total 62 pour débloquer des paliers)
    generateRandomSigns(62);

    // Ajout du draft localStorage si existant (optionnel)
    const lastDraft = JSON.parse(localStorage.getItem('draft_signalement') || "null");
    if (lastDraft) {
        allSigns.unshift({
            id: 999,
            type: "Dernier Ajout",
            etat: lastDraft.etat,
            date: "À l'instant",
            loc: lastDraft.loc,
            img: "", 
            color: "#607D8B"
        });
    }


    // --- 2. CALCUL DU SCORE RÉEL ---
    const realUserScore = allSigns.length;
    const scoreDisplay = document.getElementById('user-score-display');
    if(scoreDisplay) scoreDisplay.textContent = realUserScore;


    // --- 3. RENDU GRAPHIQUE DU SIGDEX ---
    if (sigdexGrid) {
        sigdexGrid.innerHTML = ""; 
        
        allSigns.forEach(sign => {
            const div = document.createElement('div');
            div.className = 'sign-card';
            div.onclick = () => openDetailModal(sign);

            // LOGIQUE D'AFFICHAGE : IMAGE OU COULEUR ?
            let visualContent;
            
            if (sign.img && sign.img !== "") {
                // Cas 1 : C'est un vrai contenu avec image
                // onerror permet de replier sur une couleur si l'image n'est pas trouvée
                visualContent = `<img src="${sign.img}" alt="${sign.type}" 
                                style="width:100%; height:100%; object-fit:cover;"
                                onerror="this.style.display='none'; this.parentElement.style.background='#ccc';">`;
            } else {
                // Cas 2 : C'est un contenu aléatoire (Juste une couleur et une icône)
                visualContent = `<div style="width:100%; height:100%; background:${sign.color}; display:flex; align-items:center; justify-content:center; color:white; font-size:1.5rem; opacity:0.8;">Signal It</div>`;
            }

            div.innerHTML = `
                <div class="card-img-wrapper">${visualContent}</div>
                <div class="card-info">
                    <span class="card-title">${sign.type}</span>
                    <span class="card-date">#${sign.id} - ${sign.etat}</span>
                </div>
            `;
            sigdexGrid.appendChild(div);
        });
    }


    // --- 4. LOGIQUE RÉCOMPENSES ---
    const milestones = [20, 50, 100, 175, 250];
    const milestonesContainer = document.getElementById('milestones-list');

    if (milestonesContainer) {
        milestonesContainer.innerHTML = "";

        milestones.forEach(target => {
            let percent = (realUserScore / target) * 100;
            if (percent > 100) percent = 100;

            const isUnlocked = realUserScore >= target;
            const btnClass = isUnlocked ? "btn-claim unlocked" : "btn-claim";
            const btnText = isUnlocked ? "🎁 Choisir un cadeau" : `🔒 Verrouillé (${target})`;

            const html = `
                <div class="milestone-card">
                    <div class="milestone-info">
                        <span>Palier ${target} panneaux</span>
                        <span>${Math.floor(percent)}%</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <button class="${btnClass}" onclick="openGiftModal(${target})" ${!isUnlocked ? 'disabled' : ''}>
                        ${btnText}
                    </button>
                </div>
            `;
            milestonesContainer.innerHTML += html;
        });
    }

    // Gestion Médailles
    [10, 100, 300].forEach(threshold => {
        const medal = document.getElementById(`medal-${threshold}`);
        if (medal && realUserScore >= threshold) medal.classList.remove('locked');
    });


    // --- 5. GESTION DES MODALES ---
    
    // Onglets Sidebar
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.tab-content');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            item.classList.add('active');
            document.getElementById(item.getAttribute('data-target')).classList.add('active');
        });
    });

    // Modale Détail
    window.openDetailModal = function(sign) {
        document.getElementById('detail-title').textContent = sign.type;
        document.getElementById('detail-etat').textContent = sign.etat;
        document.getElementById('detail-date').textContent = sign.date;
        document.getElementById('detail-loc').textContent = sign.loc;
        
        const imgEl = document.getElementById('detail-img');
        if (sign.img && sign.img !== "") {
            imgEl.src = sign.img;
            imgEl.style.display = 'block';
        } else {
            imgEl.style.display = 'none';
        }
        document.getElementById('modal-detail').classList.add('show');
    };

    // Modale Cadeau
    window.openGiftModal = function(palier) {
        document.getElementById('gift-palier-title').textContent = `Récompense du palier ${palier}`;
        document.getElementById('modal-gift').classList.add('show');
    };

    // Fermeture Modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-hidden').forEach(m => m.classList.remove('show'));
        });
    });

    // Selection Cadeau
    window.selectGift = function(giftName) {
        alert(`Vous avez choisi : ${giftName}.\nCode envoyé par email !`);
        document.getElementById('modal-gift').classList.remove('show');
    };
    // --- 6. GESTION DU PROFIL (INFOS & PASSWORD) ---
    const profileForm = document.getElementById('profile-form');
    
    // Charger les infos actuelles
    if (localStorage.getItem('user_pseudo')) {
        document.getElementById('profile-pseudo').value = localStorage.getItem('user_pseudo');
    }
    if (localStorage.getItem('user_email')) {
        document.getElementById('profile-email').value = localStorage.getItem('user_email');
    }

    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 1. Mise à jour du Pseudo
            const newPseudo = document.getElementById('profile-pseudo').value;
            if (newPseudo.trim() !== "") {
                localStorage.setItem('user_pseudo', newPseudo);
                // Mise à jour visuelle immédiate dans la sidebar
                const displayPseudo = document.getElementById('display-pseudo');
                if (displayPseudo) displayPseudo.textContent = newPseudo;
            }

            // 2. Mise à jour du Mot de passe
            const newPass = document.getElementById('new-password').value;
            const confirmPass = document.getElementById('confirm-password').value;

            if (newPass || confirmPass) { // Si l'un des champs est rempli
                if (newPass.length < 8) {
                    alert("Le mot de passe doit contenir au moins 8 caractères.");
                    return;
                }
                if (newPass !== confirmPass) {
                    alert("Les mots de passe ne correspondent pas.");
                    return;
                }
                // Simulation de sauvegarde
                localStorage.setItem('user_password_simulated', newPass); // Pour l'exemple
                alert("Profil et mot de passe mis à jour avec succès !");
                
                // Reset des champs mot de passe
                document.getElementById('new-password').value = "";
                document.getElementById('confirm-password').value = "";
            } else {
                // Juste le pseudo
                alert("Profil mis à jour !");
            }
        });
    }
    // FIX DÉCONNEXION
    const btnLogout = document.getElementById('btn-logout');
    
    // On vérifie que le bouton existe bien avant d'ajouter l'écouteur
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault(); // Sécurité
            
            if(confirm("Voulez-vous vraiment vous déconnecter ?")) {
                // 1. Supprimer les données de session
                localStorage.removeItem('user_token');
                localStorage.removeItem('user_pseudo');
                localStorage.removeItem('user_email');
                
                // 2. Rediriger vers l'accueil
                window.location.href = 'index.html';
            }
        });
    } else {
        console.warn("Bouton logout non trouvé sur cette page");
    }
});