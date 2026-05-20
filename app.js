/* ═══════════════════════════════════════════════════
   ATLAS — Travel Map App  (MapTiler GL edition)
   ═══════════════════════════════════════════════════

   ★ SETUP: Replace the value below with your API key
     from https://cloud.maptiler.com/account/keys/
   ═══════════════════════════════════════════════════ */

const MAPTILER_KEY = 'YOUR_MAPTILER_API_KEY';

// ─── Storage ──────────────────────────────────────────
const STORAGE_KEY = 'atlas_countries_v2';

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

let countryData = loadData(); // { "NL": "visited" | "wishlist" }

// ─── Validate key ─────────────────────────────────────
if (MAPTILER_KEY === 'YOUR_MAPTILER_API_KEY') {
  document.getElementById('api-warning').classList.remove('hidden');
}

// ─── MapTiler init ────────────────────────────────────
maptilersdk.config.apiKey = MAPTILER_KEY;

const map = new maptilersdk.Map({
  container: 'map',
  style: maptilersdk.MapStyle.DATAVIZ.LIGHT,
  center: [10, 20],
  zoom: 1.8,
  minZoom: 1,
  maxZoom: 8,
  pitchWithRotate: false,
  dragRotate: false,
  touchPitch: false,
});

// ─── Country name lookup (ISO 3166-1 alpha-2 → name) ──
const ISO_NAMES = {
  AF:"Afghanistan",AX:"Åland Islands",AL:"Albania",DZ:"Algeria",AS:"American Samoa",
  AD:"Andorra",AO:"Angola",AI:"Anguilla",AQ:"Antarctica",AG:"Antigua and Barbuda",
  AR:"Argentina",AM:"Armenia",AW:"Aruba",AU:"Australia",AT:"Austria",AZ:"Azerbaijan",
  BS:"Bahamas",BH:"Bahrain",BD:"Bangladesh",BB:"Barbados",BY:"Belarus",BE:"Belgium",
  BZ:"Belize",BJ:"Benin",BM:"Bermuda",BT:"Bhutan",BO:"Bolivia",BQ:"Bonaire",
  BA:"Bosnia and Herzegovina",BW:"Botswana",BV:"Bouvet Island",BR:"Brazil",
  IO:"British Indian Ocean Territory",BN:"Brunei",BG:"Bulgaria",BF:"Burkina Faso",
  BI:"Burundi",CV:"Cabo Verde",KH:"Cambodia",CM:"Cameroon",CA:"Canada",
  KY:"Cayman Islands",CF:"Central African Republic",TD:"Chad",CL:"Chile",CN:"China",
  CX:"Christmas Island",CC:"Cocos Islands",CO:"Colombia",KM:"Comoros",
  CD:"Congo (DRC)",CG:"Congo",CK:"Cook Islands",CR:"Costa Rica",CI:"Côte d'Ivoire",
  HR:"Croatia",CU:"Cuba",CW:"Curaçao",CY:"Cyprus",CZ:"Czechia",DK:"Denmark",
  DJ:"Djibouti",DM:"Dominica",DO:"Dominican Republic",EC:"Ecuador",EG:"Egypt",
  SV:"El Salvador",GQ:"Equatorial Guinea",ER:"Eritrea",EE:"Estonia",SZ:"Eswatini",
  ET:"Ethiopia",FK:"Falkland Islands",FO:"Faroe Islands",FJ:"Fiji",FI:"Finland",
  FR:"France",GF:"French Guiana",PF:"French Polynesia",TF:"French Southern Territories",
  GA:"Gabon",GM:"Gambia",GE:"Georgia",DE:"Germany",GH:"Ghana",GI:"Gibraltar",
  GR:"Greece",GL:"Greenland",GD:"Grenada",GP:"Guadeloupe",GU:"Guam",GT:"Guatemala",
  GG:"Guernsey",GN:"Guinea",GW:"Guinea-Bissau",GY:"Guyana",HT:"Haiti",
  HM:"Heard Island",VA:"Holy See",HN:"Honduras",HK:"Hong Kong",HU:"Hungary",
  IS:"Iceland",IN:"India",ID:"Indonesia",IR:"Iran",IQ:"Iraq",IE:"Ireland",
  IM:"Isle of Man",IL:"Israel",IT:"Italy",JM:"Jamaica",JP:"Japan",JE:"Jersey",
  JO:"Jordan",KZ:"Kazakhstan",KE:"Kenya",KI:"Kiribati",KP:"North Korea",KR:"South Korea",
  KW:"Kuwait",KG:"Kyrgyzstan",LA:"Laos",LV:"Latvia",LB:"Lebanon",LS:"Lesotho",
  LR:"Liberia",LY:"Libya",LI:"Liechtenstein",LT:"Lithuania",LU:"Luxembourg",
  MO:"Macao",MG:"Madagascar",MW:"Malawi",MY:"Malaysia",MV:"Maldives",ML:"Mali",
  MT:"Malta",MH:"Marshall Islands",MQ:"Martinique",MR:"Mauritania",MU:"Mauritius",
  YT:"Mayotte",MX:"Mexico",FM:"Micronesia",MD:"Moldova",MC:"Monaco",MN:"Mongolia",
  ME:"Montenegro",MS:"Montserrat",MA:"Morocco",MZ:"Mozambique",MM:"Myanmar",
  NA:"Namibia",NR:"Nauru",NP:"Nepal",NL:"Netherlands",NC:"New Caledonia",
  NZ:"New Zealand",NI:"Nicaragua",NE:"Niger",NG:"Nigeria",NU:"Niue",NF:"Norfolk Island",
  MK:"North Macedonia",MP:"Northern Mariana Islands",NO:"Norway",OM:"Oman",
  PK:"Pakistan",PW:"Palau",PS:"Palestine",PA:"Panama",PG:"Papua New Guinea",
  PY:"Paraguay",PE:"Peru",PH:"Philippines",PN:"Pitcairn",PL:"Poland",PT:"Portugal",
  PR:"Puerto Rico",QA:"Qatar",RE:"Réunion",RO:"Romania",RU:"Russia",RW:"Rwanda",
  BL:"Saint Barthélemy",SH:"Saint Helena",KN:"Saint Kitts and Nevis",LC:"Saint Lucia",
  MF:"Saint Martin",PM:"Saint Pierre and Miquelon",VC:"Saint Vincent and the Grenadines",
  WS:"Samoa",SM:"San Marino",ST:"Sao Tome and Principe",SA:"Saudi Arabia",SN:"Senegal",
  RS:"Serbia",SC:"Seychelles",SL:"Sierra Leone",SG:"Singapore",SX:"Sint Maarten",
  SK:"Slovakia",SI:"Slovenia",SB:"Solomon Islands",SO:"Somalia",ZA:"South Africa",
  GS:"South Georgia",SS:"South Sudan",ES:"Spain",LK:"Sri Lanka",SD:"Sudan",
  SR:"Suriname",SJ:"Svalbard and Jan Mayen",SE:"Sweden",CH:"Switzerland",SY:"Syria",
  TW:"Taiwan",TJ:"Tajikistan",TZ:"Tanzania",TH:"Thailand",TL:"Timor-Leste",TG:"Togo",
  TK:"Tokelau",TO:"Tonga",TT:"Trinidad and Tobago",TN:"Tunisia",TR:"Turkey",
  TM:"Turkmenistan",TC:"Turks and Caicos Islands",TV:"Tuvalu",UG:"Uganda",UA:"Ukraine",
  AE:"United Arab Emirates",GB:"United Kingdom",US:"United States",
  UM:"U.S. Minor Outlying Islands",UY:"Uruguay",UZ:"Uzbekistan",VU:"Vanuatu",
  VE:"Venezuela",VN:"Vietnam",VG:"British Virgin Islands",VI:"U.S. Virgin Islands",
  WF:"Wallis and Futuna",EH:"Western Sahara",YE:"Yemen",ZM:"Zambia",ZW:"Zimbabwe"
};

function isoToName(iso) { return ISO_NAMES[iso] || iso; }

// ─── Colours ──────────────────────────────────────────
const VISITED_COLOR  = '#2dd4a0';
const WISHLIST_COLOR = '#f5a623';

// ─── Build filter expressions ─────────────────────────
// MapTiler Countries tileset: iso_a2 property, level=0 for countries
function makeFilter(status) {
  const codes = Object.entries(countryData)
    .filter(([, v]) => v === status)
    .map(([k]) => k);
  if (codes.length === 0) return ['==', ['get', 'iso_a2'], '___none___'];
  return [
    'all',
    ['==', ['get', 'level'], 0],
    ['in', ['get', 'iso_a2'], ['literal', codes]],
  ];
}

function noneFilter() {
  return ['==', ['get', 'iso_a2'], '___none___'];
}

// ─── Map ready ────────────────────────────────────────
map.on('load', () => {
  // MapTiler Countries is a separate tileset used via the Dataviz style.
  // The source is 'maptiler_planet' and the country polygons are in
  // source-layer 'countries' with property 'iso_a2' and 'level' (0 = country).
  const SRC   = 'maptiler_planet';
  const LAYER = 'countries';

  // Visited fill
  map.addLayer({
    id: 'atlas-visited',
    type: 'fill',
    source: SRC,
    'source-layer': LAYER,
    filter: makeFilter('visited'),
    paint: {
      'fill-color': VISITED_COLOR,
      'fill-opacity': 0.5,
    },
  });

  // Wishlist fill
  map.addLayer({
    id: 'atlas-wishlist',
    type: 'fill',
    source: SRC,
    'source-layer': LAYER,
    filter: makeFilter('wishlist'),
    paint: {
      'fill-color': WISHLIST_COLOR,
      'fill-opacity': 0.5,
    },
  });

  // Hover highlight
  map.addLayer({
    id: 'atlas-hover',
    type: 'fill',
    source: SRC,
    'source-layer': LAYER,
    filter: noneFilter(),
    paint: {
      'fill-color': '#4f7cff',
      'fill-opacity': 0.3,
    },
  });

  // Visited border (crisp outline)
  map.addLayer({
    id: 'atlas-visited-border',
    type: 'line',
    source: SRC,
    'source-layer': LAYER,
    filter: makeFilter('visited'),
    paint: {
      'line-color': VISITED_COLOR,
      'line-width': 1.5,
      'line-opacity': 0.9,
    },
  });

  // Wishlist border
  map.addLayer({
    id: 'atlas-wishlist-border',
    type: 'line',
    source: SRC,
    'source-layer': LAYER,
    filter: makeFilter('wishlist'),
    paint: {
      'line-color': WISHLIST_COLOR,
      'line-width': 1.5,
      'line-opacity': 0.9,
    },
  });

  setupInteraction();
  updateStats();
});

function refreshLayers() {
  if (!map.getLayer('atlas-visited')) return;
  const vf = makeFilter('visited');
  const wf = makeFilter('wishlist');
  map.setFilter('atlas-visited',        vf);
  map.setFilter('atlas-visited-border', vf);
  map.setFilter('atlas-wishlist',        wf);
  map.setFilter('atlas-wishlist-border', wf);
}

// ─── Interaction ──────────────────────────────────────
let hoveredIso = null;

function getCountryFromPoint(point) {
  const features = map.queryRenderedFeatures(point);
  const f = features.find(f => f.properties?.iso_a2 && f.properties?.level === 0);
  return f?.properties?.iso_a2 || null;
}

function setupInteraction() {
  // Hover (desktop)
  map.on('mousemove', e => {
    const iso = getCountryFromPoint(e.point);
    if (iso !== hoveredIso) {
      hoveredIso = iso;
      map.setFilter('atlas-hover', iso
        ? ['all', ['==', ['get', 'level'], 0], ['==', ['get', 'iso_a2'], iso]]
        : noneFilter()
      );
      map.getCanvas().style.cursor = iso ? 'pointer' : '';
    }
  });

  map.on('mouseleave', () => {
    hoveredIso = null;
    map.setFilter('atlas-hover', noneFilter());
    map.getCanvas().style.cursor = '';
  });

  // Click / tap
  map.on('click', e => {
    closeSearch();
    const iso = getCountryFromPoint(e.point);
    if (iso && ISO_NAMES[iso]) openMenu(iso);
  });
}

// ─── Search ───────────────────────────────────────────
const allCountries = Object.entries(ISO_NAMES)
  .map(([iso, name]) => ({ iso, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const searchInput   = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchClear   = document.getElementById('search-clear');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  searchClear.classList.toggle('visible', q.length > 0);
  q ? renderSearchResults(q) : closeSearch();
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

function closeSearch() {
  searchResults.classList.remove('open');
  searchResults.innerHTML = '';
}

function renderSearchResults(q) {
  const matches = allCountries.filter(c => c.name.toLowerCase().includes(q)).slice(0, 20);
  searchResults.innerHTML = '';

  if (!matches.length) {
    searchResults.innerHTML = '<div class="no-results">No countries found</div>';
    searchResults.classList.add('open');
    return;
  }

  matches.forEach(({ iso, name }) => {
    const item = document.createElement('div');
    item.className = 'search-result-item';

    const label = document.createElement('span');
    label.textContent = name;
    item.appendChild(label);

    const status = countryData[iso];
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
      flyToCountry(iso);
      // Small delay so fly animation starts before menu opens
      setTimeout(() => openMenu(iso), 100);
    });

    searchResults.appendChild(item);
  });

  searchResults.classList.add('open');
}

function flyToCountry(iso) {
  const name = ISO_NAMES[iso];
  if (!name) return;
  maptilersdk.geocoding.forward(name, { types: ['country'], limit: 1 })
    .then(r => {
      const f = r?.features?.[0];
      if (!f) return;
      const bbox = f.bbox;
      if (bbox) {
        map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], {
          padding: 60, maxZoom: 6, duration: 900,
        });
      } else if (f.center) {
        map.flyTo({ center: f.center, zoom: 4, duration: 900 });
      }
    })
    .catch(() => {});
}

// ─── Menu ─────────────────────────────────────────────
const menuOverlay = document.getElementById('menu-overlay');
const menuName    = document.getElementById('menu-country-name');
let activeIso     = null;

function openMenu(iso) {
  activeIso = iso;
  menuName.textContent = isoToName(iso);

  const status = countryData[iso];
  document.querySelector('.visited-btn').classList.toggle('active', status === 'visited');
  document.querySelector('.wishlist-btn').classList.toggle('active', status === 'wishlist');
  document.querySelector('.clear-btn').style.display = status ? 'flex' : 'none';

  menuOverlay.classList.remove('hidden');
  requestAnimationFrame(() => menuOverlay.classList.add('visible'));
}

function closeMenu() {
  menuOverlay.classList.remove('visible');
  setTimeout(() => {
    if (!menuOverlay.classList.contains('visible'))
      menuOverlay.classList.add('hidden');
  }, 320);
  activeIso = null;
}

menuOverlay.addEventListener('click', e => {
  if (e.target === menuOverlay) closeMenu();
});

document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!activeIso) return;
    const action = btn.dataset.action;
    if (action === 'clear') delete countryData[activeIso];
    else countryData[activeIso] = action;

    saveData(countryData);
    refreshLayers();
    updateStats();
    closeMenu();

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
  animateStat('stat-visited',  visited);
  animateStat('stat-wishlist', wishlist);
}

function animateStat(id, val) {
  const el = document.getElementById(id);
  if (el.textContent === String(val)) return;
  el.textContent = val;
  el.classList.remove('bump');
  el.offsetHeight;
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 300);
}
