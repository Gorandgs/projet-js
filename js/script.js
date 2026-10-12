
// Key de stockage dans le LocalStorage
const STORAGE_KEY = "celebrity_crush_v4";

// Données par défaut si le CelebrityStorage est vide

const catalogueInitial = [
  {
    id: "crush_1",
    nom: "Pitt",
    prenom: "Brad",
    age: 62,
    nationalite: "Américain",
    note: 8.5,
    dateAjout: new Date(2026, 0, 15).toISOString()
  },
  {
    id: "crush_2",
    nom: "Coleman",
    prenom: "Zendaya",
    age: 29,
    nationalite: "Américaine",
    note: 9.5,
    dateAjout: new Date(2026, 1, 10).toISOString()
  },
  {
    id: "crush_3",
    nom: "Hemsworth",
    prenom: "Chris",
    age: 43,
    nationalite: "Australien",
    note: 5.5,
    dateAjout: new Date(2026, 2, 5).toISOString()
  }
];

// État global de l'application : Tableau d'objets

let catalogueCrush = [];

// 1. PERSISTANCE ET SÉRIALISATION

// Charger la collection depuis le CelebrityStorage
const chargerCatalogue = () => {
  const donneesStockees = localStorage.getItem(STORAGE_KEY);

  if (donneesStockees) {
    try {
      catalogueCrush = JSON.parse(donneesStockees);
    } catch (e) {
      console.error("Erreur lors de la lecture du CelebrityStorage", e);
      catalogueCrush = [...catalogueInitial];
    }
  } else {
    catalogueCrush = [...catalogueInitial];
    sauvegarderCatalogue();
  }
};

// Sauvegarder la collection dans le CelebrityStorage
const sauvegarderCatalogue = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(catalogueCrush));
};

// 2. FONCTIONS AVANCÉES & CALCULS

// Calculer les statistiques du catalogue
const mettreAJourStatistiques = (collection) => {
  const totalCrush = collection.length;

  if (totalCrush === 0) {
    document.querySelector("#stat-total").textContent = "0";
    document.querySelector("#stat-note-moyenne").textContent = "0/10";
    document.querySelector("#stat-age-moyen").textContent = "0 ans";
    document.querySelector("#stat-min-max").textContent = "0/0";
    document.querySelector("#compteur-crush").textContent = "0 crush";
    return;
  }

  // Calcul du total des notes avec reduce()
  const sommeNotes = collection.reduce((acc, crush) => acc + Number(crush.note), 0);

  // Calcul du total des âges avec reduce()
  const sommeAges = collection.reduce((acc, crush) => acc + Number(crush.age), 0);

  // Calcul des moyennes
  const moyenneNote = sommeNotes / totalCrush;
  const moyenneAge = sommeAges / totalCrush;

  // Calcul des bornes Max et Min avec Math et map()
  const toutesLesNotes = collection.map((crush) => Number(crush.note));
  const noteMax = Math.max(...toutesLesNotes);
  const noteMin = Math.min(...toutesLesNotes);

  // Mise à jour de l'affichage DOM
  document.querySelector("#stat-total").textContent = totalCrush;
  document.querySelector("#stat-note-moyenne").textContent =
    `${moyenneNote.toFixed(1)}/10`;
  document.querySelector("#stat-age-moyen").textContent =
    `${Math.round(moyenneAge)} ans`;
  document.querySelector("#stat-min-max").textContent =
    `${noteMax.toFixed(1)} / ${noteMin.toFixed(1)}`;
  document.querySelector("#compteur-crush").textContent =
    `${totalCrush} crush${totalCrush > 1 ? "s" : ""}`;
};

// Formatage d'une date ISO avec l'objet Date
const formaterDateISO = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

// Déterminer la catégorie selon la note
const determinerCategorie = (note) => {
  if (note >= 9) return "Coup de cœur";
  if (note >= 7) return "Très apprécié(e)";
  return "À découvrir";
};

// Déterminer l'appréciation selon la note
const determinerAppreciation = (note) => {
  if (note === 10) return "Note parfaite";
  if (note >= 8) return "Très bien noté(e)";
  return "À revoir";
};


// Sécuriser les textes avant leur insertion en HTML
const echapperHTML = (valeur) => {
  return String(valeur).replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caractere]);
};

// 3. AFFICHAGE ET TRANSFORMATION DYNAMIQUE

// Afficher les célébrités du catalogue
const afficherCatalogue = (collection) => {
  const conteneurListe = document.querySelector("#liste-crush");
  conteneurListe.innerHTML = "";

  if (collection.length === 0) {
    conteneurListe.innerHTML =
      `<p class="message-vide">Aucune crush ne correspond à votre recherche.</p>`;
    return;
  }

  // Transformation du tableau d'objets en chaînes HTML avec map()
  const cartesHTML = collection.map((crush) => {
    const nomComplet = `${crush.prenom} ${crush.nom}`.trim();
    const categorie = determinerCategorie(Number(crush.note));
    const appreciation = determinerAppreciation(Number(crush.note));
    
    const dateFormatee = formaterDateISO(crush.dateAjout);
    return `
      <article class="carte-crush">
        <div class="infos-crush">
          <span class="categorie-crush">${categorie}</span>

          <h3>${echapperHTML(nomComplet)}</h3>

          <p>${echapperHTML(crush.age)} ans, ${echapperHTML(crush.nationalite)}</p>

          <small class="date-ajout">Ajouté le ${dateFormatee}</small>
        </div>

        <div class="actions-crush">
          <span class="note-crush">
            ${Number(crush.note).toFixed(1)}/10
            <br>
            <small>${appreciation}</small>
          </span>

          <button
            type="button"
            class="bouton-supprimer"
            data-id="${echapperHTML(crush.id)}"
            aria-label="Supprimer ${echapperHTML(nomComplet)}"
          >
            Supprimer
          </button>
        </div>
      </article>
    `;
  });

  // Injection dans le DOM
  conteneurListe.innerHTML = cartesHTML.join("");

  // Événement de suppression sur chaque bouton
  conteneurListe.querySelectorAll(".bouton-supprimer").forEach((bouton) => {
    bouton.addEventListener("click", () => {
      supprimerCrush(bouton.dataset.id);
    });
  });
};

// Filtrer la collection selon les saisies utilisateur
const filtrerEtAfficherCatalogue = () => {
  const texteRecherche = document
    .querySelector("#recherche-crush")
    .value.toLowerCase()
    .trim();

  const filtreCategorie = document.querySelector("#filtre-categorie").value;

  // Filtrage combiné avec filter()
  const resultatsFiltres = catalogueCrush.filter((crush) => {
    const correspondTexte =
      crush.prenom.toLowerCase().includes(texteRecherche) ||
      crush.nom.toLowerCase().includes(texteRecherche) ||
      crush.nationalite.toLowerCase().includes(texteRecherche) ||
      `${crush.prenom} ${crush.nom}`.toLowerCase().includes(texteRecherche);

    const categorieCrush = determinerCategorie(Number(crush.note));

    const correspondCategorie =
      filtreCategorie === "toutes" || categorieCrush === filtreCategorie;

    return correspondTexte && correspondCategorie;
  });

  afficherCatalogue(resultatsFiltres);
  mettreAJourStatistiques(resultatsFiltres);
};

// 4. ACTIONS ET ÉVÉNEMENTS

// Fonction d'ajout d'une nouvelle célébrité
const ajouterCrush = (event) => {
  event.preventDefault();

  const champNom = document.querySelector("#champ-nom");
  const champPrenom = document.querySelector("#champ-prenom");
  const champAge = document.querySelector("#champ-age");
  const champNationalite = document.querySelector("#champ-nationalite");
  const champNote = document.querySelector("#champ-note");

  const nom = champNom.value.trim();
  const prenom = champPrenom.value.trim();
  const age = parseInt(champAge.value, 10);
  const nationalite = champNationalite.value.trim();
  const note = parseFloat(champNote.value);

  // Vérification des informations saisies
  if (
    !nom ||
    !prenom ||
    !nationalite ||
    !Number.isFinite(age) ||
    !Number.isFinite(note) ||
    age <= 0 ||
    note < 0 ||
    note > 10
  ) {
    alert("Veuillez saisir des informations valides. La note doit être comprise entre 0 et 10.");
    return;
  }

  // Génération d'un identifiant unique
  let nouvelId = Date.now();

  while (catalogueCrush.some((crush) => crush.id === `crush_${nouvelId}`)) {
    nouvelId += 1;
  }

  // Création du nouvel objet littéral
  const nouveauCrush = {
    id: `crush_${nouvelId}`,
    nom: nom,
    prenom: prenom,
    age: age,
    nationalite: nationalite,
    note: Math.round(note * 10) / 10,
    dateAjout: new Date().toISOString()
  };

  // Immutabilité : ajout avec le Spread operator
  catalogueCrush = [...catalogueCrush, nouveauCrush];

  sauvegarderCatalogue();
  filtrerEtAfficherCatalogue();

  document.querySelector("#formulaire-crush").reset();
};

// Suppression d'un objet par ID avec filter()
const supprimerCrush = (idASupprimer) => {
  catalogueCrush = catalogueCrush.filter(
    (crush) => crush.id !== idASupprimer
  );

  sauvegarderCatalogue();
  filtrerEtAfficherCatalogue();
};

// Réinitialisation globale du catalogue
const reinitialiserDonnees = () => {
  if (confirm("Voulez-vous réinitialiser votre catalogue ?")) {
    localStorage.removeItem(STORAGE_KEY);

    chargerCatalogue();

    document.querySelector("#recherche-crush").value = "";
    document.querySelector("#filtre-categorie").value = "toutes";

    filtrerEtAfficherCatalogue();
  }
};

// Contrôle de saisie en temps réel (oninput)
const verifierSaisie = (champ) => {
  const invalide = !champ.checkValidity();

  if (invalide) {
    champ.classList.add("champ-invalide");
  } else {
    champ.classList.remove("champ-invalide");
  }
};

// 5. INITIALISATION

const initialiserApp = () => {
  // Charger les données enregistrées
  chargerCatalogue();

  // Afficher le catalogue
  filtrerEtAfficherCatalogue();

  // Événement d'ajout
  document.querySelector("#formulaire-crush")
    .addEventListener("submit", ajouterCrush);

  // Empêcher l'envoi du formulaire de filtres
  document.querySelector("#formulaire-filtres")
    .addEventListener("submit", (event) => event.preventDefault());

  // Recherche en temps réel
  document.querySelector("#recherche-crush")
    .addEventListener("input", filtrerEtAfficherCatalogue);

  // Filtre par catégorie
  document.querySelector("#filtre-categorie")
    .addEventListener("change", filtrerEtAfficherCatalogue);

  // Bouton de réinitialisation
  document.querySelector("#bouton-reinitialiser")
    .addEventListener("click", reinitialiserDonnees);
};

// Lancement au chargement de la page
document.addEventListener("DOMContentLoaded", initialiserApp);
