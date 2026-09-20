const nomsCrush = ["Pitt", "Zendaya"];
const prenomsCrush = ["Brad", ""];
const agesCrush = [62, 29];
const nationalitesCrush = ["Américain", "Américaine"];
const notesCrush = [8.5, 9.5];

const formulaireCrush = document.querySelector("#formulaire-crush");
const listeCrush = document.querySelector("#liste-crush");
const compteurCrush = document.querySelector("#compteur-crush");

function afficherCrush() {
    listeCrush.innerHTML = "";

    for (let i = 0; i < nomsCrush.length; i++) {
        let categorie = "À découvrir";

        switch (true) {
            case notesCrush[i] >= 9:
                categorie = "Coup de coeur";
                break;
            case notesCrush[i] >= 7:
                categorie = "Très apprécié(e)";
                break;
            default:
                categorie = "À découvrir";
        }

        const badge = notesCrush[i] === 10
            ? "Note parfaite"
            : notesCrush[i] >= 8
                ? "Très bien noté(e)"
                : "À revoir";

        listeCrush.innerHTML += `
            <article class="carte-crush">
                <div>
                    <span class="categorie-crush">${categorie}</span>
                    <h3>${prenomsCrush[i]} ${nomsCrush[i]}</h3>
                    <p>${agesCrush[i]} ans, ${nationalitesCrush[i]}</p>
                </div>
                <span class="note-crush">${notesCrush[i]}/10<br><small>${badge}</small></span>
            </article>
        `;
    }

    compteurCrush.textContent = `${nomsCrush.length} crush${nomsCrush.length > 1 ? "s" : ""}`;
}

function ajouterCrush(event) {
    event.preventDefault();

    const nom = document.querySelector("#champ-nom").value.trim();
    const prenom = document.querySelector("#champ-prenom").value.trim();
    const age = parseInt(document.querySelector("#champ-age").value, 10);
    const nationalite = document.querySelector("#champ-nationalite").value.trim();
    const note = parseFloat(document.querySelector("#champ-note").value);

    if (!nom || !prenom || !nationalite || isNaN(age) || isNaN(note)) {
        alert("Veuillez remplir correctement tous les champs.");
        return;
    }

    if (age <= 0 || note < 0 || note > 10) {
        alert("L'âge doit être positif et la note doit être comprise entre 0 et 10.");
        return;
    }

    nomsCrush.push(nom);
    prenomsCrush.push(prenom);
    agesCrush.push(age);
    nationalitesCrush.push(nationalite);
    notesCrush.push(note);

    formulaireCrush.reset();
    afficherCrush();
}

afficherCrush();