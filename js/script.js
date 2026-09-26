/* =========================================================
   LE VOISIN — Chargement automatique des images depuis GitHub
   ========================================================= */

const GITHUB_USER = "GARA-Abdel";
const GITHUB_REPO = "Le-Voisin";
const GITHUB_BRANCHE = "main";

// Dossiers de catégories (doivent exister dans /images/)
const CATEGORIES = ["telephones", "accessoires", "audio", "energie", "divers"];

/* ---------------------------------------------------------
   1. Année dynamique dans le footer
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Charger chaque catégorie
  CATEGORIES.forEach(chargerCategorie);
});

/* ---------------------------------------------------------
   2. Charger les images d'une catégorie via l'API GitHub
   --------------------------------------------------------- */
async function chargerCategorie(categorie) {
  const grille = document.querySelector(`.grille[data-category="${categorie}"]`);
  if (!grille) return;

  // Message de chargement
  grille.innerHTML = `<p class="message-vide">Chargement…</p>`;

  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/images/${categorie}?ref=${GITHUB_BRANCHE}`;

  try {
    const reponse = await fetch(url);

    // Dossier introuvable ou vide
    if (reponse.status === 404) {
      grille.innerHTML = `<p class="message-vide">Aucune image pour le moment.</p>`;
      return;
    }

    if (!reponse.ok) {
      throw new Error(`Erreur API (${reponse.status})`);
    }

    const fichiers = await reponse.json();

    // Filtrer uniquement les images
    const images = fichiers
      .filter((f) => f.type === "file" && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));

    if (images.length === 0) {
      grille.innerHTML = `<p class="message-vide">Aucune image pour le moment.</p>`;
      return;
    }

    // Vider la grille et afficher les images
    grille.innerHTML = "";
    images.forEach((img) => {
      const lien = document.createElement("a");
      lien.href = img.download_url;
      lien.target = "_blank";
      lien.rel = "noopener";

      const image = document.createElement("img");
      image.src = img.download_url;
      image.alt = `Le Voisin — ${categorie}`;
      image.loading = "lazy"; // lazy loading natif

      lien.appendChild(image);
      grille.appendChild(lien);
    });
  } catch (erreur) {
    console.error(`Erreur chargement ${categorie} :`, erreur);
    grille.innerHTML = `<p class="message-vide">Impossible de charger les images.</p>`;
  }
}
