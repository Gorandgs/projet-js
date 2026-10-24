import Crush from "./models/Crush.js";
import StorageService from "./services/StorageService.js";
import CatalogueService from "./services/CatalogueService.js";

const storageService = new StorageService("celebrity_crush_v5");
const catalogueService = new CatalogueService(storageService, "data/crushs.json");

// Évite les injections HTML dans les cartes
const echapperHTML = (valeur) => {
  return String(valeur).replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caractere]);
};

// Contrôle de saisie en direct (utilisé aussi par oninput dans le HTML)
export const verifierSaisie = (champ) => {
  if (!champ.checkValidity()) {
    champ.classList.add("champ-invalide");
  } else {
    champ.classList.remove("champ-invalide");
  }
};
window.verifierSaisie = verifierSaisie;

// Affiche les cartes dans la page
const afficherCatalogue = (collection) => {
  const conteneurListe = document.querySelector("#liste-crush");
  conteneurListe.innerHTML = "";

  if (collection.length === 0) {
    conteneurListe.innerHTML =
      '<p class="message-vide">Aucune crush ne correspond à votre recherche.</p>';
    return;
  }

  const cartesHTML = collection.map((crush) => `
    <article class="carte-crush">
      <div class="infos-crush">
        <span class="categorie-crush">${crush.categorie}</span>
        <h3>${echapperHTML(crush.nomComplet)}</h3>
        <p>${echapperHTML(crush.age)} ans, ${echapperHTML(crush.nationalite)}</p>
        <small class="date-ajout">Ajouté le ${crush.dateFormatee}</small>
      </div>

      <div class="actions-crush">
        <span class="note-crush">
          ${crush.note.toFixed(1)}/10
          <br>
          <small>${crush.appreciation}</small>
        </span>

        <button
          type="button"
          class="bouton-supprimer"
          data-id="${echapperHTML(crush.id)}"
          aria-label="Supprimer ${echapperHTML(crush.nomComplet)}"
        >
          Supprimer
        </button>
      </div>
    </article>
  `);

  conteneurListe.innerHTML = cartesHTML.join("");

  // Boutons de suppression
  conteneurListe.querySelectorAll(".bouton-supprimer").forEach((bouton) => {
    bouton.addEventListener("click", () => {
      catalogueService.supprimer(bouton.dataset.id);
      rafraichirVue();
    });
  });
};

// Mise à jour des compteurs et statistiques
const afficherStatistiques = (stats) => {
  document.querySelector("#stat-total").textContent = stats.total;
  document.querySelector("#stat-note-moyenne").textContent = stats.noteMoyenne;
  document.querySelector("#stat-age-moyen").textContent = stats.ageMoyen;
  document.querySelector("#stat-min-max").textContent = stats.minMax;
  document.querySelector("#compteur-crush").textContent =
    `${stats.total} crush${stats.total > 1 ? "s" : ""}`;
};

// Met à jour la liste et les statistiques selon les filtres
const rafraichirVue = () => {
  const texteRecherche = document.querySelector("#recherche-crush").value;
  const filtreCategorie = document.querySelector("#filtre-categorie").value;

  const resultatsFiltres = catalogueService.filtrer(texteRecherche, filtreCategorie);
  afficherCatalogue(resultatsFiltres);
  afficherStatistiques(catalogueService.calculerStatistiques(resultatsFiltres));
};

// Ajout d'une nouvelle crush depuis le formulaire
const gererAjoutCrush = (event) => {
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

  try {
    const nouveauCrush = new Crush({
      nom,
      prenom,
      age,
      nationalite,
      note
    });

    catalogueService.ajouter(nouveauCrush);

    event.target.reset();
    document.querySelectorAll("#formulaire-crush input").forEach((champ) => {
      champ.classList.remove("champ-invalide");
    });

    rafraichirVue();
  } catch (erreur) {
    alert(erreur.message);
  }
};

// Réinitialisation du catalogue
const gererReinitialisation = async () => {
  const confirmation = confirm("Voulez-vous réinitialiser votre catalogue avec les données par défaut ?");
  if (confirmation) {
    await catalogueService.reinitialiser();
    document.querySelector("#recherche-crush").value = "";
    document.querySelector("#filtre-categorie").value = "toutes";
    rafraichirVue();
  }
};

// Initialisation au chargement de la page
const initialiserApp = async () => {
  const conteneurListe = document.querySelector("#liste-crush");
  if (conteneurListe) {
    conteneurListe.innerHTML = '<p class="message-vide">Chargement du catalogue en cours...</p>';
  }

  await catalogueService.initialiser();

  const formAjout = document.querySelector("#formulaire-crush");
  if (formAjout) {
    formAjout.addEventListener("submit", gererAjoutCrush);
    formAjout.querySelectorAll("input").forEach((champ) => {
      champ.addEventListener("input", () => verifierSaisie(champ));
    });
  }

  const formFiltres = document.querySelector("#formulaire-filtres");
  if (formFiltres) {
    formFiltres.addEventListener("submit", (event) => event.preventDefault());
  }

  const champRecherche = document.querySelector("#recherche-crush");
  if (champRecherche) {
    champRecherche.addEventListener("input", rafraichirVue);
  }

  const selectCategorie = document.querySelector("#filtre-categorie");
  if (selectCategorie) {
    selectCategorie.addEventListener("change", rafraichirVue);
  }

  const boutonReinitialiser = document.querySelector("#bouton-reinitialiser");
  if (boutonReinitialiser) {
    boutonReinitialiser.addEventListener("click", gererReinitialisation);
  }

  rafraichirVue();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiserApp);
} else {
  initialiserApp();
}
