// Variable de simulation : Met à 'true' pour tester le cas "Connecté"
const IS_LOGGED_IN = false; 

document.addEventListener('DOMContentLoaded', () => {
    // Éléments DOM
    const stepPhoto = document.getElementById('step-photo');
    const stepForm = document.getElementById('step-form');
    const photoInput = document.getElementById('photo-input');
    const btnSkip = document.getElementById('btn-skip');
    
    const previewContainer = document.getElementById('preview-container');
    const imgPreview = document.getElementById('img-preview');
    const btnRetake = document.getElementById('btn-retake');
    const btnBack = document.getElementById('btn-back');

    const btnGeo = document.getElementById('btn-geo');
    const inputLoc = document.getElementById('localisation');

    // --- NAVIGATION ENTRE ÉTAPES ---

    // 1. Photo prise
    photoInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imgPreview.src = e.target.result;
                previewContainer.style.display = 'block'; // Afficher preview
                goToForm();
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // 2. Bouton Skip
    btnSkip.addEventListener('click', () => {
        previewContainer.style.display = 'none'; // Cacher preview
        goToForm();
    });

    // 3. Bouton Retour (depuis le formulaire)
    btnBack.addEventListener('click', () => {
        stepForm.classList.add('hidden');
        stepPhoto.classList.remove('hidden');
    });

    // --- GESTION DE LA MODALE D'AIDE ---
    const btnShowHelp = document.getElementById('btn-show-help');
    const modalHelp = document.getElementById('modal-help');
    const btnCloseHelp = document.getElementById('close-help');

    // Ouvrir
    btnShowHelp.addEventListener('click', () => {
        modalHelp.classList.add('show');
    });

    // Fermer (Croix)
    btnCloseHelp.addEventListener('click', () => {
        modalHelp.classList.remove('show');
    });

    // Fermer (Clic en dehors de l'image)
    modalHelp.addEventListener('click', (e) => {
        if (e.target === modalHelp) {
            modalHelp.classList.remove('show');
        }
    });

    // 4. Changer la photo
    btnRetake.addEventListener('click', () => {
        stepForm.classList.add('hidden');
        stepPhoto.classList.remove('hidden');
        photoInput.click(); // Rouvre la caméra
    });

    function goToForm() {
        stepPhoto.classList.add('hidden');
        stepForm.classList.remove('hidden');
        window.scrollTo(0, 0); // Remonter en haut de page
    }

    // --- GÉOLOCALISATION ---
    btnGeo.addEventListener('click', () => {
        if(!navigator.geolocation) {
            alert("Géolocalisation non supportée.");
            return;
        }

        btnGeo.innerHTML = "⏳"; // Sablier
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                // Succès
                const lat = pos.coords.latitude.toFixed(5);
                const lng = pos.coords.longitude.toFixed(5);
                inputLoc.value = `${lat}, ${lng}`;
                btnGeo.innerHTML = "✅";
                btnGeo.style.background = "#d4edda";
            },
            (err) => {
                // Erreur
                console.warn(err);
                alert("Erreur GPS : Vérifiez que la localisation est activée.");
                btnGeo.innerHTML = "📍";
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    });

    // --- SOUMISSION & AUTH ---
    stepForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (inputLoc.value === "") {
            alert("Merci de vous géolocaliser avant de valider.");
            return;
        }

        if (IS_LOGGED_IN) {
            // Cas connecté : Succès
            alert("Signalement envoyé avec succès ! Merci pour votre contribution.");
            window.location.href = "index.html";
        } else {
            // Cas non connecté : Redirection
            const confirmMsg = "Vous devez être connecté pour valider ce signalement.\n\nAller à la page de connexion ? (Vos données seront conservées)";
            
            if (confirm(confirmMsg)) {
                // On sauvegarde les champs texte (pas l'image)
                const draft = {
                    nature: document.getElementById('nature').value,
                    etat: document.getElementById('etat').value,
                    loc: inputLoc.value
                };
                localStorage.setItem('draft_signalement', JSON.stringify(draft));
                
                // Redirection vers login (page à créer plus tard)
                window.location.href = "login.html"; 
            }
        }
    });

    // --- RESTAURATION (Au chargement) ---
    // Si on revient de la page login, on remplit les champs
    const draft = localStorage.getItem('draft_signalement');
    if (draft) {
        const data = JSON.parse(draft);
        document.getElementById('nature').value = data.nature;
        document.getElementById('etat').value = data.etat;
        inputLoc.value = data.loc;
        
        // On va directement au formulaire
        previewContainer.style.display = 'none'; 
        goToForm();
        
        // Nettoyage
        localStorage.removeItem('draft_signalement');
    }
});