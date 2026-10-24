export default class Crush {
  #id;
  #note;

  constructor({ id, nom = "", prenom = "", age = 0, nationalite = "", note = 0, dateAjout } = {}) {
    this.#id = id || `crush_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.nom = nom ? String(nom).trim() : "";
    this.prenom = prenom ? String(prenom).trim() : "";
    this.age = parseInt(age, 10) || 0;
    this.nationalite = nationalite ? String(nationalite).trim() : "";
    this.note = note;
    this.dateAjout = dateAjout ? new Date(dateAjout).toISOString() : new Date().toISOString();
  }

  get id() {
    return this.#id;
  }

  get note() {
    return this.#note;
  }

  // Validation de la note entre 0 et 10
  set note(valeur) {
    const noteNumerique = parseFloat(valeur);
    if (isNaN(noteNumerique) || noteNumerique < 0 || noteNumerique > 10) {
      throw new Error("La note doit être un nombre valide compris entre 0 et 10.");
    }
    this.#note = Math.round(noteNumerique * 10) / 10;
  }

  get nomComplet() {
    return `${this.prenom} ${this.nom}`.trim();
  }

  get categorie() {
    if (this.#note >= 9) return "Coup de cœur";
    if (this.#note >= 7) return "Très apprécié(e)";
    return "À découvrir";
  }

  get appreciation() {
    if (this.#note === 10) return "Note parfaite";
    if (this.#note >= 8) return "Très bien noté(e)";
    return "À revoir";
  }

  get dateFormatee() {
    const date = new Date(this.dateAjout);
    return isNaN(date.getTime())
      ? "Date inconnue"
      : date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });
  }

  modifierNote(nouvelleNote) {
    this.note = nouvelleNote;
  }

  // Vérifie si le texte recherché correspond au crush
  correspond(terme) {
    if (!terme) return true;
    const recherche = terme.toLowerCase().trim();
    return (
      this.nom.toLowerCase().includes(recherche) ||
      this.prenom.toLowerCase().includes(recherche) ||
      this.nationalite.toLowerCase().includes(recherche) ||
      this.nomComplet.toLowerCase().includes(recherche)
    );
  }

  estCoupDeCoeur() {
    return this.#note >= 9;
  }

  mettreAJour({ nom, prenom, age, nationalite, note } = {}) {
    if (nom !== undefined) this.nom = String(nom).trim();
    if (prenom !== undefined) this.prenom = String(prenom).trim();
    if (age !== undefined) this.age = parseInt(age, 10);
    if (nationalite !== undefined) this.nationalite = String(nationalite).trim();
    if (note !== undefined) this.note = note;
  }

  // Format d'enregistrement pour le localStorage
  toJSON() {
    return {
      id: this.#id,
      nom: this.nom,
      prenom: this.prenom,
      age: this.age,
      nationalite: this.nationalite,
      note: this.#note,
      dateAjout: this.dateAjout
    };
  }
}
