/* ═══════════════════════════════════════════════════
   ATLAS — Travel Map App
   ═══════════════════════════════════════════════════ */

// ─── Storage ──────────────────────────────────────────
const STORAGE_KEY = 'atlas_countries';

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch { return {}; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let countryData = loadData(); // { "France": "visited" | "wishlist" }

// ─── Map Setup ────────────────────────────────────────
const map = L.map('map', {
  center: [20, 10],
  zoom: 2,
  minZoom: 2,
  maxZoom: 7,
  zoomControl: true,
  worldCopyJump: false,
  maxBounds: [[-90, -200], [90, 200]],
  maxBoundsViscosity: 0.8,
  tap: true,
  tapTolerance: 15,
});

// No tile layer — we'll draw everything ourselves for a clean look
// Add a subtle grid / graticule feel via a custom pane
map.createPane('countries');
map.getPane('countries').style.zIndex = 200;

// ─── Country Layer ────────────────────────────────────
let geojsonLayer = null;
let countryLayers = {}; // name -> leaflet layer ref

function getStyle(countryName) {
  const status = countryData[countryName];
  if (status === 'visited')  return { fillColor: '#2dd4a0', fillOpacity: 0.55, color: '#1a1f2e', weight: 0.8, opacity: 1 };
  if (status === 'wishlist') return { fillColor: '#f5a623', fillOpacity: 0.55, color: '#1a1f2e', weight: 0.8, opacity: 1 };
  return { fillColor: '#2e3650', fillOpacity: 1, color: '#1a1f2e', weight: 0.8, opacity: 1 };
}

function getHoverStyle(countryName) {
  const status = countryData[countryName];
  if (status === 'visited')  return { fillColor: '#2dd4a0', fillOpacity: 0.8 };
  if (status === 'wishlist') return { fillColor: '#f5a623', fillOpacity: 0.8 };
  return { fillColor: '#3d4a6a', fillOpacity: 1 };
}

function onEachFeature(feature, layer) {
  const name = feature.properties.ADMIN || feature.properties.name || 'Unknown';
  countryLayers[name] = layer;

  layer.on({
    mouseover(e) {
      e.target.setStyle(getHoverStyle(name));
      e.target.bringToFront();
    },
    mouseout(e) {
      e.target.setStyle(getStyle(name));
    },
    click(e) {
      L.DomEvent.stopPropagation(e);
      openMenu(name);
    },
  });
}

function refreshLayer(name) {
  const layer = countryLayers[name];
  if (layer) layer.setStyle(getStyle(name));
}

function refreshAllLayers() {
  Object.keys(countryLayers).forEach(refreshLayer);
}

// ─── Load GeoJSON ─────────────────────────────────────
// Using Natural Earth data via a public CDN
const GEOJSON_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// We'll use TopoJSON → need topojson-client
const TOPO_SCRIPT = 'https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js';

function loadTopoJSON() {
  return new Promise((resolve, reject) => {
    if (window.topojson) { resolve(); return; }
    const s = document.createElement('script');
    s.src = TOPO_SCRIPT;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Fallback country name mapping (ISO numeric → name) for world-atlas
// world-atlas uses ISO 3166-1 numeric codes
async function initMap() {
  try {
    await loadTopoJSON();
    const res = await fetch(GEOJSON_URL);
    const topo = await res.json();

    // Convert TopoJSON → GeoJSON
    const geojson = topojson.feature(topo, topo.objects.countries);

    // Load country name lookup (ISO numeric codes → names)
    const nameRes = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    // world-atlas doesn't include names — load a separate lookup
    await loadCountryNames(geojson);

  } catch (err) {
    console.error('Map load failed:', err);
    showError('Failed to load map data. Check your connection.');
  }
}

async function loadCountryNames(geojson) {
  // Fetch a countries GeoJSON with names included
  try {
    const res = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
    const named = await res.json();
    renderMap(named);
  } catch {
    // Try another fallback
    try {
      const res2 = await fetch('https://datahub.io/core/geo-countries/r/countries.geojson');
      const named2 = await res2.json();
      renderMap(named2);
    } catch (err2) {
      console.error('Country names load failed', err2);
      showError('Could not load country data.');
    }
  }
}

function renderMap(geojson) {
  geojsonLayer = L.geoJSON(geojson, {
    pane: 'countries',
    style(feature) {
      const name = feature.properties.ADMIN
                || feature.properties.admin
                || feature.properties.name
                || feature.properties.NAME
                || 'Unknown';
      return getStyle(name);
    },
    onEachFeature(feature, layer) {
      const name = feature.properties.ADMIN
                || feature.properties.admin
                || feature.properties.name
                || feature.properties.NAME
                || 'Unknown';
      feature.properties._resolvedName = name;
      countryLayers[name] = layer;

      layer.on({
        mouseover(e) {
          e.target.setStyle(getHoverStyle(name));
          e.target.bringToFront();
        },
        mouseout(e) {
          e.target.setStyle(getStyle(name));
        },
        click(e) {
          L.DomEvent.stopPropagation(e);
          openMenu(name);
        },
      });
    },
  }).addTo(map);

  buildSearchList(geojson);
  updateStats();
}

function showError(msg) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#242938;color:#f0ece4;padding:20px 28px;border-radius:14px;font-family:DM Sans,sans-serif;text-align:center;z-index:9999;';
  el.textContent = msg;
  document.body.appendChild(el);
}

// ─── Search ───────────────────────────────────────────
let allCountries = []; // sorted list of country names

function buildSearchList(geojson) {
  const names = new Set();
  geojson.features.forEach(f => {
    const name = f.properties.ADMIN
              || f.properties.admin
              || f.properties.name
              || f.properties.NAME;
    if (name && name !== 'Unknown') names.add(name);
  });
  allCountries = [...names].sort();
}

const searchInput  = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchClear  = document.getElementById('search-clear');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  searchClear.classList.toggle('visible', q.length > 0);
  if (!q) { closeSearch(); return; }
  renderSearchResults(q);
});

searchInput.addEventListener('focus', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (q) renderSearchResults(q);
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.classList.remove('visible');
  closeSearch();
  searchInput.focus();
});

// Close search when tapping the map
map.on('click', closeSearch);

function closeSearch() {
  searchResults.classList.remove('open');
  searchResults.innerHTML = '';
}

function renderSearchResults(q) {
  const matches = allCountries.filter(n => n.toLowerCase().includes(q)).slice(0, 20);
  searchResults.innerHTML = '';

  if (matches.length === 0) {
    searchResults.innerHTML = '<div class="no-results">No countries found</div>';
    searchResults.classList.add('open');
    return;
  }

  matches.forEach(name => {
    const item = document.createElement('div');
    item.className = 'search-result-item';

    const label = document.createElement('span');
    label.textContent = name;

    item.appendChild(label);

    const status = countryData[name];
    if (status) {
      const badge = document.createElement('span');
      badge.className = `result-badge ${status}`;
      badge.textContent = status === 'visited' ? 'Visited' : 'Want to Visit';
      item.appendChild(badge);
    }

    item.addEventListener('click', () => {
      closeSearch();
      searchInput.value = '';
      searchClear.classList.remove('visible');
      searchInput.blur();
      openMenu(name);
      flyToCountry(name);
    });

    searchResults.appendChild(item);
  });

  searchResults.classList.add('open');
}

function flyToCountry(name) {
  const layer = countryLayers[name];
  if (!layer) return;
  try {
    const bounds = layer.getBounds();
    if (bounds.isValid()) map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 5, duration: 0.8 });
  } catch {}
}

// ─── Menu ─────────────────────────────────────────────
const menuOverlay   = document.getElementById('menu-overlay');
const menuSheet     = document.getElementById('menu-sheet');
const menuName      = document.getElementById('menu-country-name');
const menuButtons   = document.querySelectorAll('.menu-btn');

let activeCountry = null;

function openMenu(name) {
  activeCountry = name;
  menuName.textContent = name;

  // Highlight active state
  const status = countryData[name];
  document.querySelector('.visited-btn').classList.toggle('active', status === 'visited');
  document.querySelector('.wishlist-btn').classList.toggle('active', status === 'wishlist');
  document.querySelector('.clear-btn').style.display = status ? 'flex' : 'none';

  menuOverlay.classList.remove('hidden', 'visible');
  menuOverlay.classList.add('entering');
  menuOverlay.offsetHeight; // force reflow
  menuOverlay.classList.add('visible');
  menuOverlay.classList.remove('entering');
}

function closeMenu() {
  menuOverlay.classList.remove('visible');
  setTimeout(() => menuOverlay.classList.add('hidden'), 250);
  activeCountry = null;
}

menuOverlay.addEventListener('click', e => {
  if (e.target === menuOverlay) closeMenu();
});

menuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!activeCountry) return;
    const action = btn.dataset.action;

    if (action === 'clear') {
      delete countryData[activeCountry];
    } else {
      countryData[activeCountry] = action;
    }

    saveData(countryData);
    refreshLayer(activeCountry);
    updateStats();
    closeMenu();

    // Also refresh search results if open
    const q = searchInput.value.trim().toLowerCase();
    if (q) renderSearchResults(q);
  });
});

// ─── Stats ────────────────────────────────────────────
function updateStats() {
  let visited = 0, wishlist = 0;
  Object.values(countryData).forEach(v => {
    if (v === 'visited')  visited++;
    if (v === 'wishlist') wishlist++;
  });
  document.getElementById('stat-visited').textContent  = visited;
  document.getElementById('stat-wishlist').textContent = wishlist;
}

// ─── Boot ─────────────────────────────────────────────
initMap();
updateStats();
