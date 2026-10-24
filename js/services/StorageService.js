import Crush from "../models/Crush.js";

export default class StorageService {
  #cleStockage;

  constructor(cleStockage = "celebrity_crush_v5") {
    this.#cleStockage = cleStockage;
  }
  
  // Récupère les données du localStorage et les recrée en objets Crush
  charger() {
    const donneesBrutes = localStorage.getItem(this.#cleStockage);
    if (!donneesBrutes) {
      return null;
    }
    try {
      const donneesParsees = JSON.parse(donneesBrutes);
      if (!Array.isArray(donneesParsees)) {
        return null;
      }
      return donneesParsees.map((item) => new Crush(item));
    } catch (erreur) {
      console.error("Erreur lecture localStorage :", erreur);
      return null;
    }
  }

  // Sauvegarde le tableau dans le localStorage
  sauvegarder(collection) {
    try {
      const donneesASauvegarder = collection.map((crush) =>
        typeof crush.toJSON === "function" ? crush.toJSON() : crush
      );
      localStorage.setItem(this.#cleStockage, JSON.stringify(donneesASauvegarder));
    } catch (erreur) {
      console.error("Erreur sauvegarde localStorage :", erreur);
    }
  }
  vider() {
    localStorage.removeItem(this.#cleStockage);
  }
  aDesDonnees() {
    return localStorage.getItem(this.#cleStockage) !== null;
  }
}
