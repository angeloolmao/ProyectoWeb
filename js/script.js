const MOVIES = [
  { title: "Orgullo y Prejuicio", year: 2005, genre: "Romance", rating: 4.6 },
  { title: "El Padrino", year: 1972, genre: "Drama", rating: 4.9 },
  { title: "Pulp Fiction", year: 1994, genre: "Crimen", rating: 4.7 },
  { title: "Titanic", year: 1997, genre: "Romance", rating: 4.3 },
  { title: "El Señor de los Anillos", year: 2001, genre: "Fantasía", rating: 4.8 },
  { title: "Interstellar", year: 2014, genre: "Ciencia Ficción", rating: 4.7 },
  { title: "Parásitos", year: 2019, genre: "Thriller", rating: 4.6 },
  { title: "La La Land", year: 2016, genre: "Musical", rating: 4.2 },
  { title: "El Origen", year: 2010, genre: "Ciencia Ficción", rating: 4.5 },
  { title: "Coco", year: 2017, genre: "Animación", rating: 4.6 },
  { title: "Joker", year: 2019, genre: "Drama", rating: 4.3 },
  { title: "Spider-Man: Un Nuevo Universo", year: 2018, genre: "Animación", rating: 4.5 },
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
  ["searchForm", "loginForm", "registerForm"].forEach(id => {
    const form = document.getElementById(id);
    if (form) form.addEventListener("submit", (e) => e.preventDefault());
  });

  // Menú móvil: alternativa real de navegación, no solo ocultar el nav
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");
  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

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
