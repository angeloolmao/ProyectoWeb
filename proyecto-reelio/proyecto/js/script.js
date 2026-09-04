// Reelio — interacciones de interfaz (Entrega 1: sin backend, todo en memoria)

const MOVIES = [
  { title: "El Largo Adiós", year: 2019, genre: "Drama", rating: 4.2 },
  { title: "Corredor Nocturno", year: 2021, genre: "Thriller", rating: 3.8 },
  { title: "Verano en Valparaíso", year: 2017, genre: "Comedia", rating: 4.5 },
  { title: "La Costa Interior", year: 2020, genre: "Drama", rating: 4.0 },
  { title: "Estación Sur", year: 2015, genre: "Suspenso", rating: 3.5 },
  { title: "Mar Adentro Otra Vez", year: 2022, genre: "Drama", rating: 4.7 },
  { title: "Los Últimos Días de Julio", year: 2018, genre: "Romance", rating: 3.9 },
  { title: "Ciudad de Vidrio", year: 2023, genre: "Ciencia Ficción", rating: 4.1 },
  { title: "El Peso del Silencio", year: 2016, genre: "Drama", rating: 4.4 },
  { title: "Ruta 5", year: 2019, genre: "Aventura", rating: 3.7 },
  { title: "Noches sin Nombre", year: 2021, genre: "Terror", rating: 3.6 },
  { title: "Antes del Invierno", year: 2014, genre: "Drama", rating: 4.3 },
];

function initials(title) {
  return title
    .split(" ")
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
}

function movieCard(movie) {
  const a = document.createElement("a");
  a.href = "pelicula.html";
  a.className = "card";
  a.innerHTML = `
    <div class="poster"><span class="initials">${initials(movie.title)}</span></div>
    <h3>${movie.title}</h3>
    <div class="meta">${movie.year} · <span class="rating">★ ${movie.rating.toFixed(1)}</span></div>
  `;
  return a;
}

function renderCatalog(list, containerId, countId) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = "";
  list.forEach(m => grid.appendChild(movieCard(m)));
  const count = document.getElementById(countId);
  if (count) count.textContent = `${list.length} película${list.length === 1 ? "" : "s"}`;
}

document.addEventListener("DOMContentLoaded", () => {
  // Catálogo en index.html
  if (document.getElementById("catalogGrid")) {
    renderCatalog(MOVIES, "catalogGrid", "resultCount");

    const input = document.getElementById("searchInput");
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      const filtered = MOVIES.filter(m => m.title.toLowerCase().includes(q));
      renderCatalog(filtered, "catalogGrid", "resultCount");
    });
  }

  // Filmstrip corto en perfil.html
  if (document.querySelector("#tab-vistas .filmstrip")) {
    const grid = document.querySelector("#tab-vistas .filmstrip");
    MOVIES.slice(0, 6).forEach(m => grid.appendChild(movieCard(m)));
  }

  // Tabs en perfil.html
  const tabButtons = document.querySelectorAll(".tabs button");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
});
