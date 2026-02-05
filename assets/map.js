document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DONNÉES (Mises à jour avec tes panneaux) ---
    const allData = [
        { 
            id: 1, 
            type: "Panneau Réglementaire 1", 
            etat: "Neuf", 
            date: "04/02/2026", 
            lat: 50.5746, lng: 2.9695, // Santes (Parc de la Deûle)
            loc: "Parc de la Deûle" 
        },
        { 
            id: 2, 
            type: "Panneau Réglementaire 2", 
            etat: "Abîmé", 
            date: "03/02/2026", 
            lat: 50.6358, lng: 3.1550, // Villeneuve d'Ascq (Parc du Héron)
            loc: "Parc du Héron" 
        },
        { 
            id: 3, 
            type: "Panneau Directionnel 1", 
            etat: "Bon état", 
            date: "01/02/2026", 
            lat: 50.7205, lng: 3.0203, // Bousbecque (Parc de la Lys)
            loc: "Parc de la Lys" 
        },
        { 
            id: 4, 
            type: "Panneau informatif", 
            etat: "Bon état", 
            date: "28/01/2026", 
            lat: 50.6402, lng: 3.1600, // Villeneuve d'Ascq (Autre point Parc du Héron)
            loc: "Parc du Héron" 
        }
    ];

    // --- 2. GESTION DES ONGLETS ---
    const btnMap = document.getElementById('btn-tab-map');
    const btnTable = document.getElementById('btn-tab-table');
    const viewMap = document.getElementById('view-map');
    const viewTable = document.getElementById('view-table');

    // Il faut invalider la taille de la carte quand on l'affiche si elle était cachée
    let mapInitialized = false;

    btnMap.addEventListener('click', () => {
        switchView('map');
        if(map) map.invalidateSize(); // Recalcule la taille de la carte
    });
    btnTable.addEventListener('click', () => switchView('table'));

    function switchView(viewName) {
        if (viewName === 'map') {
            viewMap.classList.add('active');
            viewTable.classList.remove('active');
            btnMap.classList.add('active');
            btnTable.classList.remove('active');
        } else {
            viewMap.classList.remove('active');
            viewTable.classList.add('active');
            btnMap.classList.remove('active');
            btnTable.classList.add('active');
        }
    }

    // --- 3. INITIALISATION CARTE LEAFLET ---
    // Centré sur Lille (50.63, 3.06), Zoom 12
    const map = L.map('map-container').setView([50.63, 3.06], 12);

    // Ajout des tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Ajout des marqueurs
    allData.forEach(item => {
        const marker = L.marker([item.lat, item.lng]).addTo(map);
        
        // Popup au clic
        marker.bindPopup(`
            <b>${item.type}</b><br>
            État : ${item.etat}<br>
            <i>${item.loc}</i>
        `);
    });

    // --- 4. GESTION DU TABLEAU ---
    const tbody = document.querySelector('#signs-table tbody');
    const filterType = document.getElementById('filter-type');
    const filterEtat = document.getElementById('filter-etat');
    const noResult = document.getElementById('no-result');

    function renderTable(dataSource) {
        tbody.innerHTML = ""; // Clean
        
        if (dataSource.length === 0) {
            noResult.classList.remove('hidden');
            return;
        }
        noResult.classList.add('hidden');

        dataSource.forEach(item => {
            // Mapping des classes couleurs pour l'état
            let badgeClass = "st-bon";
            if(item.etat.includes("Neuf")) badgeClass = "st-neuf";
            if(item.etat.includes("Abîmé")) badgeClass = "st-abime";
            if(item.etat.includes("Tagué")) badgeClass = "st-casse";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.type}</strong></td>
                <td><span class="status-badge ${badgeClass}">${item.etat}</span></td>
                <td>${item.date}</td>
                <td>${item.loc}</td>
                <td><button onclick="alert('Détails ID ${item.id}')" style="cursor:pointer;">👁️</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Filtres
    function filterData() {
        const typeVal = filterType.value;
        const etatVal = filterEtat.value;

        const filtered = allData.filter(item => {
            const matchType = (typeVal === "all") || (item.type.includes(typeVal));
            const matchEtat = (etatVal === "all") || (item.etat.includes(etatVal));
            return matchType && matchEtat;
        });

        renderTable(filtered);
    }

    // Écouteurs sur les filtres
    filterType.addEventListener('change', filterData);
    filterEtat.addEventListener('change', filterData);

    // Premier rendu
    renderTable(allData);


    // --- 5. EXPORT CSV ---
    document.getElementById('btn-export').addEventListener('click', () => {
        // En-têtes CSV
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Type,Etat,Date,Localisation,Latitude,Longitude\r\n";

        // Lignes de données (On exporte les données filtrées ou toutes ?)
        // Ici on exporte TOUT pour l'exemple
        allData.forEach(row => {
            const rowString = `${row.id},"${row.type}","${row.etat}",${row.date},"${row.loc}",${row.lat},${row.lng}`;
            csvContent += rowString + "\r\n";
        });

        // Création du lien de téléchargement invisible
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "signalements_mel.csv");
        document.body.appendChild(link); // Requis pour Firefox
        
        link.click(); // Clic automatique
        document.body.removeChild(link); // Nettoyage
    });

});