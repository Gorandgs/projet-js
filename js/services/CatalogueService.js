import Crush from "../models/Crush.js";

export default class CatalogueService {
  #storageService;
  #sourceUrl;
  #catalogue = [];

  // Données de secours si fetch échoue (ex: test local sans serveur web)
  static DONNEES_PAR_DEFAUT = [
    {
      id: "crush_1",
      nom: "Pitt",
      prenom: "Brad",
      age: 62,
      nationalite: "Américain",
      note: 8.5,
      dateAjout: "2026-01-15T00:00:00.000Z"
    },
    {
      id: "crush_2",
      nom: "Coleman",
      prenom: "Zendaya",
      age: 29,
      nationalite: "Américaine",
      note: 9.5,
      dateAjout: "2026-02-10T00:00:00.000Z"
    },
    {
      id: "crush_3",
      nom: "Hemsworth",
      prenom: "Chris",
      age: 43,
      nationalite: "Australien",
      note: 5.5,
      dateAjout: "2026-03-05T00:00:00.000Z"
    }
  ];

  constructor(storageService, sourceUrl = "data/crushs.json") {
    this.#storageService = storageService;
    this.#sourceUrl = sourceUrl;
  }

  get catalogue() {
    return [...this.#catalogue];
  }

  // Chargement initial : localStorage en priorité, sinon fichier JSON via fetch
  async initialiser() {
    const donneesLocales = this.#storageService.charger();

    if (donneesLocales && donneesLocales.length > 0) {
      this.#catalogue = donneesLocales;
    } else {
      await this.chargerDepuisSource();
    }

    return this.catalogue;
  }

  // Récupération asynchrone du fichier JSON avec fetch()
  async chargerDepuisSource() {
    try {
      const reponse = await fetch(this.#sourceUrl);

      if (!reponse.ok) {
        throw new Error(`Erreur réseau HTTP : ${reponse.status}`);
      }

      const donneesJSON = await reponse.json();
      this.#catalogue = donneesJSON.map((item) => new Crush(item));
      this.#storageService.sauvegarder(this.#catalogue);
    } catch (erreur) {
      console.warn("Échec fetch, utilisation des données de secours :", erreur.message);
      this.#catalogue = CatalogueService.DONNEES_PAR_DEFAUT.map((item) => new Crush(item));
      this.#storageService.sauvegarder(this.#catalogue);
    }

    return this.catalogue;
  }

  ajouter(crush) {
    const instance = crush instanceof Crush ? crush : new Crush(crush);
    this.#catalogue = [...this.#catalogue, instance];
    this.#storageService.sauvegarder(this.#catalogue);
    return instance;
  }

  supprimer(id) {
    this.#catalogue = this.#catalogue.filter((crush) => crush.id !== id);
    this.#storageService.sauvegarder(this.#catalogue);
  }

  // Remet les données initiales
  async reinitialiser() {
    this.#storageService.vider();
    await this.chargerDepuisSource();
    return this.catalogue;
  }

  // Filtre par recherche textuelle et par catégorie
  filtrer(texte = "", categorie = "toutes") {
    const texteNormalise = texte.toLowerCase().trim();

    return this.#catalogue.filter((crush) => {
      const correspondTexte = crush.correspond(texteNormalise);
      const correspondCategorie =
        categorie === "toutes" || crush.categorie === categorie;

      return correspondTexte && correspondCategorie;
    });
  }

  // Calcul des statistiques du catalogue (moyennes, min, max)
  calculerStatistiques(collection = this.#catalogue) {
    const total = collection.length;

    if (total === 0) {
      return {
        total: 0,
        noteMoyenne: "0,0/10",
        ageMoyen: "0 ans",
        minMax: "0,0 / 0,0"
      };
    }

    const sommeNotes = collection.reduce((acc, crush) => acc + crush.note, 0);
    const sommeAges = collection.reduce((acc, crush) => acc + crush.age, 0);

    const moyenneNote = (sommeNotes / total).toFixed(1).replace(".", ",");
    const moyenneAge = Math.round(sommeAges / total);

    const toutesLesNotes = collection.map((crush) => crush.note);
    const noteMax = Math.max(...toutesLesNotes).toFixed(1).replace(".", ",");
    const noteMin = Math.min(...toutesLesNotes).toFixed(1).replace(".", ",");

    return {
      total,
      noteMoyenne: `${moyenneNote}/10`,
      ageMoyen: `${moyenneAge} ans`,
      minMax: `${noteMax} / ${noteMin}`
    };
  }
}
