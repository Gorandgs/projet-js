const CLE_STOCKAGE = "celebrity_crush_v4";

const catalogueInitial = [
    {
        id: "crush_1",
        nom: "Pitt",
        prenom: "Brad",
        age: 62,
        nationalite: "Américain",
        note: 8.5,
        dateAjout: new Date("2026-01-15T12:00:00").toISOString()
    },
    {
        id: "crush_2",
        nom: "Coleman",
        prenom: "Zendaya",
        age: 29,
        nationalite: "Américaine",
        note: 9.5,
        dateAjout: new Date("2026-02-10T12:00:00").toISOString()
    }
];

let catalogueCrush = [];

const formulaireCrush = document.querySelector("#formulaire-crush");
const listeCrush = document.querySelector("#liste-crush");
const compteurCrush = document.querySelector("#compteur-crush");
const rechercheCrush = document.querySelector("#recherche-crush");
const filtreCategorie = document.querySelector("#filtre-categorie");

function chargerCatalogue() {
    const donneesStockees = localStorage.getItem(CLE_STOCKAGE);

    if (donneesStockees) {
        try {
            const donneesParsees = JSON.parse(donneesStockees);
            if (Array.isArray(donneesParsees)) {
                catalogueCrush = donneesParsees;
                return;
            }
        } catch (erreur) {
            console.error("Impossible de lire le catalogue enregistré.", erreur);
        }
    }

    catalogueCrush = [...catalogueInitial];
    sauvegarderCatalogue();
}

function sauvegarderCatalogue() {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(catalogueCrush));
}

function determinerCategorie(note) {
    if (note >= 9) return "Coup de cœur";
    if (note >= 7) return "Très apprécié(e)";
    return "À découvrir";
}

function formaterDate( dateISO) {
    return new Date(dateISO).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function echapperHTML(valeur) {
    return String(valeur).replace(/[&<>"']/g, (caractere) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

function mettreAJourStatistiques(collection) {
    const total = collection.length;
    const notes = collection.map((crush) => Number(crush.note));
    const somme = collection.reduce((cumul, crush) => cumul + Number(crush.note), 0);
    const sommeAges = collection.reduce((cumul, crush) => cumul + Number(crush.age), 0);
    const moyenneNote = total ? somme / total : 0;
    const moyenneAge = total ? sommeAges / total : 0;
    const noteMax = total ? Math.max(...notes) : 0;
    const noteMin = total ? Math.min(...notes) : 0;

    [
        ["#stat-total", total],
        ["#stat-note-moyenne", `${moyenneNote.toFixed(1)}/10`],
        ["#stat-age-moyen", `${Math.round(moyenneAge)} ans`],
        ["#stat-min-max", `${noteMax.toFixed(1)} / ${noteMin.toFixed(1)}`]
    ].forEach(([selecteur, valeur]) => {
        document.querySelector(selecteur).textContent = valeur;
    });

    compteurCrush.textContent = `${total} crush${total > 1 ? "s" : ""}`;
}

function afficherCrush(collection) {
    if (collection.length === 0) {
        listeCrush.innerHTML = '<p class="message-vide">Aucune crush ne correspond à votre recherche.</p>';
        return;
    }

    listeCrush.innerHTML = collection.map((crush) => {
        const nomComplet = `${crush.prenom} ${crush.nom}`.trim();
        const categorie = determinerCategorie(Number(crush.note));
        const appreciation = Number(crush.note) === 10
            ? "Note parfaite"
            : Number(crush.note) >= 8
                ? "Très bien noté(e)"
                : "À revoir";

        return `
            <article class="carte-crush">
                <div class="infos-crush">
                    <span class="categorie-crush">${categorie}</span>
                    <h3>${echapperHTML(nomComplet)}</h3>
                    <p>${echapperHTML(crush.age)} ans, ${echapperHTML(crush.nationalite)}</p>
                    <small class="date-ajout">Ajouté le ${formaterDate(crush.dateAjout)}</small>
                </div>
                <div class="actions-crush">
                    <span class="note-crush">${Number(crush.note).toFixed(1)}/10<br><small>${appreciation}</small></span>
                    <button type="button" class="bouton-supprimer" data-id="${echapperHTML(crush.id)}" aria-label="Supprimer ${echapperHTML(nomComplet)}">Supprimer</button>
                </div>
            </article>
        `;
    }).join("");

    listeCrush.querySelectorAll(".bouton-supprimer").forEach((bouton) => {
        bouton.addEventListener("click", () => supprimerCrush(bouton.dataset.id));
    });
}

function filtrerEtAfficher() {
    const recherche = rechercheCrush.value.trim().toLocaleLowerCase("fr-FR");
    const categorieChoisie = filtreCategorie.value;
    const resultats = catalogueCrush.filter((crush) => {
        const texte = `${crush.prenom} ${crush.nom} ${crush.nationalite}`.toLocaleLowerCase("fr-FR");
        const correspondTexte = texte.includes(recherche);
        const correspondCategorie = categorieChoisie === "toutes"
            || determinerCategorie(Number(crush.note)) === categorieChoisie;
        return correspondTexte && correspondCategorie;
    });

    afficherCrush(resultats);
    mettreAJourStatistiques(resultats);
}

function ajouterCrush(event) {
    event.preventDefault();

    const nom = document.querySelector("#champ-nom").value.trim();
    const prenom = document.querySelector("#champ-prenom").value.trim();
    const age = Number.parseInt(document.querySelector("#champ-age").value, 10);
    const nationalite = document.querySelector("#champ-nationalite").value.trim();
    const note = Number.parseFloat(document.querySelector("#champ-note").value);

    if (!nom || !prenom || !nationalite || !Number.isFinite(age) || !Number.isFinite(note)
        || age <= 0 || note < 0 || note > 10) {
        alert("Veuillez saisir des informations valides. La note doit être comprise entre 0 et 10.");
        return;
    }

    let nouvelId = Date.now();
    while (catalogueCrush.some((crush) => crush.id === `crush_${nouvelId}`)) {
        nouvelId += 1;
    }

    catalogueCrush = [...catalogueCrush, {
        id: `crush_${nouvelId}`,
        nom,
        prenom,
        age,
        nationalite,
        note: Math.round(note * 10) / 10,
        dateAjout: new Date().toISOString()
    }];

    sauvegarderCatalogue();
    formulaireCrush.reset();
    filtrerEtAfficher();
}

function supprimerCrush(id) {
    catalogueCrush = catalogueCrush.filter((crush) => crush.id !== id);
    sauvegarderCatalogue();
    filtrerEtAfficher();
}

function verifierSaisie(champ) {
    const invalide = !champ.checkValidity();
    champ.classList.toggle("champ-invalide", invalide);
}

function reinitialiserCatalogue() {
    if (!confirm("Voulez-vous réinitialiser votre catalogue ?")) return;

    localStorage.removeItem(CLE_STOCKAGE);
    catalogueCrush = [...catalogueInitial];
    sauvegarderCatalogue();
    rechercheCrush.value = "";
    filtreCategorie.value = "toutes";
    filtrerEtAfficher();
}

formulaireCrush.addEventListener("submit", ajouterCrush);
document.querySelector("#formulaire-filtres").addEventListener("submit", (event) => event.preventDefault());
rechercheCrush.addEventListener("input", filtrerEtAfficher);
filtreCategorie.addEventListener("change", filtrerEtAfficher);
document.querySelector("#bouton-reinitialiser").addEventListener("click", reinitialiserCatalogue);

chargerCatalogue();
filtrerEtAfficher();