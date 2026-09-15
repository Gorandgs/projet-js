// Champs formulaire

const nom = document.querySelector("#champ-nom");
const prenom = document.querySelector("#champ-prenom");
const age = document.querySelector("#champ-age");
const nationalite = document.querySelector("#champ-nationalite");
const note = document.querySelector("#champ-note");

// Zones de carte

const formulaireCrush = document.querySelector("#formulaire-crush");
const nomPrenomCrush = document.querySelector("#nom-prénom-crush");
const ageNationalitéCrush = document.querySelector("#age-nationalité-crush");
const noteCrush = document.querySelector("#note-crush");

// Fonction d'affichage des données du crush

function mettreAJourInfosCrush() {
    event.preventDefault();

    nomPrenomCrush.textContent = `${nom.value} ${prenom.value}`;
    ageNationalitéCrush.textContent =
        `${age.value} ans, ${nationalite.value}`;
    noteCrush.textContent = `Note : ${note.value}/10`;
}