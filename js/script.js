/* =========================================================
   LE VOISIN — Chargement automatique des images depuis GitHub
   ========================================================= */

const GITHUB_USER = "GARA-Abdel";
const GITHUB_REPO = "Le-Voisin";
const GITHUB_BRANCHE = "main";

// Dossiers de catégories (sans accents, en minuscules)
const CATEGORIES = [
  { nom: "telephones", label: "Téléphones portables" },
  { nom: "accessoires", label: "Accessoires téléphones" },
  { nom: "audio", label: "Audio / Enceintes" },
  { nom: "energie", label: "Énergie / Électricité" },
  { nom: "divers", label: "Divers" }
];

/* ---------------------------------------------------------
   1. Année dynamique dans le footer
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Charger chaque catégorie
  CATEGORIES.forEach((cat) => chargerCategorie(cat.nom, cat.label));
});

/* ---------------------------------------------------------
   2. Charger les images d'une catégorie via l'API GitHub
   --------------------------------------------------------- */
async function chargerCategorie(categorie, label) {
  const grille = document.querySelector(`.grille[data-category="${categorie}"]`);
  if (!grille) return;

  grille.innerHTML = `<p class="message-vide">Chargement…</p>`;

  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/images/${categorie}?ref=${GITHUB_BRANCHE}`;

  try {
    const reponse = await fetch(url);

    if (reponse.status === 404) {
      grille.innerHTML = `<p class="message-vide">Aucune image pour le moment.</p>`;
      return;
    }

    if (!reponse.ok) {
      throw new Error(`Erreur API (${reponse.status})`);
    }

    const fichiers = await reponse.json();

    // Filtrer uniquement les images (en ignorant les accents et les espaces)
    const images = fichiers
      .filter((f) => {
        if (f.type !== "file") return false;
        const nom = f.name.toLowerCase().replace(/\s+/g, "");
        return /\.(jpg|jpeg|png|webp|gif)$/i.test(nom);
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));

    if (images.length === 0) {
      grille.innerHTML = `<p class="message-vide">Aucune image pour le moment.</p>`;
      return;
    }

    grille.innerHTML = "";
    images.forEach((img) => {
      const lien = document.createElement("a");
      lien.href = img.download_url;
      lien.target = "_blank";
      lien.rel = "noopener";

      const image = document.createElement("img");
      image.src = img.download_url;
      image.alt = `Le Voisin — ${label}`;
      image.loading = "lazy";

      lien.appendChild(image);
      grille.appendChild(lien);
    });
  } catch (erreur) {
    console.error(`Erreur chargement ${categorie} :`, erreur);
    grille.innerHTML = `<p class="message-vide">Impossible de charger les images.</p>`;
  }
}
