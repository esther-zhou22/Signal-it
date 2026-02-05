// Variable de simulation : Met à 'true' si tu veux tester comme si tu étais connecté
// (En production, on vérifierait le localStorage comme ceci)
const IS_LOGGED_IN = localStorage.getItem('user_token') !== null;

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. RÉCUPÉRATION DES ÉLÉMENTS DU DOM ---
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

    // --- 2. GESTION PHOTO & GPS EXIF ---
    
    // Quand une photo est sélectionnée
    if (photoInput) {
        photoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];

                // A. Afficher l'aperçu
                const reader = new FileReader();
                reader.onload = (e) => {
                    imgPreview.src = e.target.result;
                    previewContainer.style.display = 'block'; 
                    goToForm(); // On passe automatiquement à l'étape suivante
                };
                reader.readAsDataURL(file);

                // B. Tenter d'extraire le GPS (EXIF)
                if (typeof EXIF !== 'undefined') {
                    // Petit feedback pour dire qu'on cherche
                    const oldPlaceholder = inputLoc.placeholder;
                    inputLoc.placeholder = "Recherche GPS dans la photo...";
                    
                    EXIF.getData(file, function() {
                        const lat = EXIF.getTag(this, "GPSLatitude");
                        const lon = EXIF.getTag(this, "GPSLongitude");
                        const latRef = EXIF.getTag(this, "GPSLatitudeRef");
                        const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

                        if (lat && lon) {
                            // Conversion en décimal
                            const latDec = toDecimal(lat, latRef);
                            const lonDec = toDecimal(lon, lonRef);
                            
                            // Remplissage du champ
                            inputLoc.value = `${latDec.toFixed(5)}, ${lonDec.toFixed(5)}`;
                            inputLoc.style.backgroundColor = "#e8f5e9"; // Vert clair
                        } else {
                            console.log("Pas de GPS trouvé dans cette image.");
                            inputLoc.placeholder = oldPlaceholder;
                        }
                    });
                }
            }
        });
    }

    // Fonction utilitaire pour convertir les coordonnées GPS
    function toDecimal(coord, ref) {
        let decimal = coord[0] + (coord[1] / 60) + (coord[2] / 3600);
        if (ref === "S" || ref === "W") {
            decimal = decimal * -1;
        }
        return decimal;
    }


    // --- 3. NAVIGATION ---

    // Bouton "Passer cette étape"
    if (btnSkip) {
        btnSkip.addEventListener('click', () => {
            if(previewContainer) previewContainer.style.display = 'none';
            goToForm();
        });
    }

    // Bouton "Retour"
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            stepForm.classList.add('hidden');
            stepPhoto.classList.remove('hidden');
        });
    }

    // Bouton "Changer la photo"
    if (btnRetake) {
        btnRetake.addEventListener('click', () => {
            stepForm.classList.add('hidden');
            stepPhoto.classList.remove('hidden');
            photoInput.click();
        });
    }

    function goToForm() {
        stepPhoto.classList.add('hidden');
        stepForm.classList.remove('hidden');
        window.scrollTo(0, 0);
    }


    // --- 4. GÉOLOCALISATION NAVIGATEUR (Bouton 📍) ---
    if (btnGeo) {
        btnGeo.addEventListener('click', () => {
            if(!navigator.geolocation) {
                alert("Votre navigateur ne supporte pas la géolocalisation.");
                return;
            }

            btnGeo.innerHTML = "⏳"; // Sablier
            
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude.toFixed(5);
                    const lng = pos.coords.longitude.toFixed(5);
                    inputLoc.value = `${lat}, ${lng}`;
                    btnGeo.innerHTML = "✅";
                },
                (err) => {
                    console.warn(err);
                    alert("Impossible de vous localiser. Vérifiez vos paramètres.");
                    btnGeo.innerHTML = "📍";
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        });
    }


    // --- 5. MODALE D'AIDE (?) ---
    const btnShowHelp = document.getElementById('btn-show-help');
    const modalHelp = document.getElementById('modal-help');
    const btnCloseHelp = document.getElementById('close-help');

    if (btnShowHelp && modalHelp) {
        btnShowHelp.addEventListener('click', () => modalHelp.classList.add('show'));
        btnCloseHelp.addEventListener('click', () => modalHelp.classList.remove('show'));
        modalHelp.addEventListener('click', (e) => {
            if (e.target === modalHelp) modalHelp.classList.remove('show');
        });
    }


    // --- 6. SOUMISSION DU FORMULAIRE (CORRECTION REDIRECTION) ---
    if (stepForm) {
        stepForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Vérification basique
            if (!inputLoc.value.trim()) {
                alert("Merci de renseigner la localisation (GPS ou adresse manuelle).");
                return;
            }

            if (IS_LOGGED_IN) {
                // === CAS 1 : CONNECTÉ ===
                // On prépare le message de succès pour la page d'accueil
                localStorage.setItem('show_success_toast', 'true');
                
                // Redirection vers l'accueil
                window.location.href = "index.html";

            } else {
                // === CAS 2 : NON CONNECTÉ ===
                const confirmMsg = "Vous devez être connecté pour valider ce signalement.\n\nCliquez sur OK pour vous connecter (vos données seront conservées).";
                
                if (confirm(confirmMsg)) {
                    // --- SÉCURISATION DU BROUILLON ---
                    // On vérifie que les éléments existent pour éviter le crash JS
                    const elNature = document.getElementById('nature');
                    const elEtat = document.getElementById('etat');

                    const draft = {
                        nature: elNature ? elNature.value : "",
                        etat: elEtat ? elEtat.value : "",
                        loc: inputLoc.value
                    };
                    
                    try {
                        localStorage.setItem('draft_signalement', JSON.stringify(draft));
                    } catch (err) {
                        console.error("Erreur sauvegarde brouillon", err);
                    }
                    
                    // REDIRECTION CRITIQUE
                    window.location.href = "account.html"; 
                }
            }
        });
    }


    // --- 7. RESTAURATION DU BROUILLON (Au retour du login) ---
    const draft = localStorage.getItem('draft_signalement');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            
            // On remplit les champs s'ils existent
            const elNature = document.getElementById('nature');
            const elEtat = document.getElementById('etat');
            
            if(elNature) elNature.value = data.nature;
            if(elEtat) elEtat.value = data.etat;
            if(inputLoc) inputLoc.value = data.loc;
            
            // On saute directement au formulaire
            if(previewContainer) previewContainer.style.display = 'none'; 
            goToForm();
            
            // Nettoyage pour ne pas le recharger à chaque fois
            localStorage.removeItem('draft_signalement');
        } catch(e) {
            console.error("Erreur restauration brouillon", e);
        }
    }
});