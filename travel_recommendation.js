// =====================================================
// WANDERLUST — travel_recommendation.js
// Features: Search, Results, Reset, Autocomplete,
//           Booking Modal, Favorites, Weather,
//           Reviews/Ratings, Filters, Map, Newsletter,
//           Share, Toast, Skeleton Loading
//
// Phase 1 Fixes: XSS protection, ARIA, debounce,
//                autocomplete keyboard nav, event dedup
// =====================================================

let travelData = null;
let clockInterval = null;
let currentResults = [];
let activeFilter = 'all';
let activeMinRating = 0;
let autocompleteIndex = -1;
let autocompleteDebounceTimer = null;

// ---- Reviews & Ratings (Mock Data) ----
const reviewsData = {
  'Sydney, Australia': { rating: 4.7, reviews: 3241 },
  'Melbourne, Australia': { rating: 4.5, reviews: 2876 },
  'Tokyo, Japan': { rating: 4.9, reviews: 5623 },
  'Kyoto, Japan': { rating: 4.8, reviews: 4321 },
  'Rio de Janeiro, Brazil': { rating: 4.6, reviews: 4102 },
  'São Paulo, Brazil': { rating: 4.4, reviews: 2156 },
  'Paris, France': { rating: 4.8, reviews: 8934 },
  'Nice, France': { rating: 4.5, reviews: 1876 },
  'Pokhara, Nepal': { rating: 4.4, reviews: 1532 },
  'Kathmandu, Nepal': { rating: 4.3, reviews: 1234 },
  'New York, USA': { rating: 4.7, reviews: 7211 },
  'San Francisco, USA': { rating: 4.6, reviews: 4532 },
  'Miami, USA': { rating: 4.5, reviews: 3210 },
  'Rome, Italy': { rating: 4.8, reviews: 6543 },
  'Venice, Italy': { rating: 4.7, reviews: 5432 },
  'Florence, Italy': { rating: 4.9, reviews: 4321 },
  'Barcelona, Spain': { rating: 4.6, reviews: 5678 },
  'Madrid, Spain': { rating: 4.4, reviews: 3456 },
  'Bangkok, Thailand': { rating: 4.5, reviews: 7890 },
  'Chiang Mai, Thailand': { rating: 4.6, reviews: 3456 },
  'Bali, Indonesia': { rating: 4.8, reviews: 8765 },
  'Santorini, Greece': { rating: 4.9, reviews: 5432 },
  'Athens, Greece': { rating: 4.5, reviews: 4321 },
  'Jaipur, India': { rating: 4.6, reviews: 3210 },
  'Goa, India': { rating: 4.4, reviews: 4567 },
  'Marrakech, Morocco': { rating: 4.5, reviews: 2345 },
  'Queenstown, New Zealand': { rating: 4.8, reviews: 2109 },
  'Cape Town, South Africa': { rating: 4.7, reviews: 3456 },
  'Angkor Wat, Cambodia': { rating: 4.9, reviews: 4512 },
  'Taj Mahal, India': { rating: 4.9, reviews: 6879 },
  'Borobudur, Indonesia': { rating: 4.7, reviews: 2345 },
  'Petra, Jordan': { rating: 4.8, reviews: 3456 },
  'Machu Picchu, Peru': { rating: 4.9, reviews: 4321 },
  'Great Wall of China': { rating: 4.8, reviews: 7654 },
  'Bora Bora, French Polynesia': { rating: 4.8, reviews: 2103 },
  'Copacabana Beach, Brazil': { rating: 4.3, reviews: 3890 },
  'Maya Bay, Thailand': { rating: 4.4, reviews: 4567 },
  'Bondi Beach, Australia': { rating: 4.5, reviews: 2345 },
  'Ngapali Beach, Myanmar': { rating: 4.6, reviews: 1234 },
  'Navagio Beach, Greece': { rating: 4.7, reviews: 3456 },
  'Tulum, Mexico': { rating: 4.5, reviews: 4567 },
  'Raja Ampat, Indonesia': { rating: 4.9, reviews: 1876 }
};

// ---- Weather Icons ----
function getWeatherIcon(weather) {
  const icons = { sunny: '☀️', cloudy: '☁️', partly: '⛅', rainy: '🌧️', stormy: '⛈️', snowy: '❄️', mist: '🌫️' };
  return icons[weather] || '🌡️';
}

// ---- Mock Weather by Timezone ----
function getMockWeather(timezone) {
  const conditions = ['sunny', 'partly', 'cloudy', 'rainy', 'sunny', 'sunny', 'partly', 'sunny', 'cloudy', 'sunny'];
  const temps = [28, 22, 31, 18, 25, 12, 19, 24, 16, 30];
  const idx = Math.abs(hashCode(timezone || 'x')) % conditions.length;
  const temp = temps[idx];
  const cond = conditions[idx];
  return { icon: getWeatherIcon(cond), temp, condition: cond };
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// ---- Coordinates for Map ----
const destCoords = {
  'Sydney, Australia': [-33.8688, 151.2093],
  'Melbourne, Australia': [-37.8136, 144.9631],
  'Tokyo, Japan': [35.6762, 139.6503],
  'Kyoto, Japan': [35.0116, 135.7681],
  'Rio de Janeiro, Brazil': [-22.9068, -43.1729],
  'São Paulo, Brazil': [-23.5505, -46.6333],
  'Paris, France': [48.8566, 2.3522],
  'Nice, France': [43.7102, 7.2620],
  'Pokhara, Nepal': [28.2096, 83.9856],
  'Kathmandu, Nepal': [27.7172, 85.3240],
  'New York, USA': [40.7128, -74.0060],
  'San Francisco, USA': [37.7749, -122.4194],
  'Miami, USA': [25.7617, -80.1918],
  'Rome, Italy': [41.9028, 12.4964],
  'Venice, Italy': [45.4408, 12.3155],
  'Florence, Italy': [43.7696, 11.2558],
  'Barcelona, Spain': [41.3851, 2.1734],
  'Madrid, Spain': [40.4168, -3.7038],
  'Bangkok, Thailand': [13.7563, 100.5018],
  'Chiang Mai, Thailand': [18.7883, 98.9853],
  'Bali, Indonesia': [-8.4095, 115.1889],
  'Santorini, Greece': [36.3932, 25.4615],
  'Athens, Greece': [37.9838, 23.7275],
  'Jaipur, India': [26.9124, 75.7873],
  'Goa, India': [15.2993, 74.1240],
  'Marrakech, Morocco': [31.6295, -7.9811],
  'Queenstown, New Zealand': [-45.0312, 168.6626],
  'Cape Town, South Africa': [-33.9249, 18.4241],
  'Angkor Wat, Cambodia': [13.4125, 103.8670],
  'Taj Mahal, India': [27.1751, 78.0421],
  'Borobudur, Indonesia': [-7.6079, 110.2038],
  'Petra, Jordan': [30.3285, 35.4444],
  'Machu Picchu, Peru': [-13.1631, -72.5450],
  'Great Wall of China': [40.4319, 116.5704],
  'Bora Bora, French Polynesia': [-16.5004, -151.7415],
  'Copacabana Beach, Brazil': [-22.9711, -43.1823],
  'Maya Bay, Thailand': [7.6784, 98.7678],
  'Bondi Beach, Australia': [-33.8908, 151.2743],
  'Ngapali Beach, Myanmar': [18.4700, 94.3400],
  'Navagio Beach, Greece': [37.8584, 20.6244],
  'Tulum, Mexico': [20.2114, -87.4654],
  'Raja Ampat, Indonesia': [-0.2299, 130.5200]
};

// ---- Fetch Data Promise ----
const dataLoadedPromise = fetch('travel_recommendation_api.json')
  .then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  })
  .then(data => {
    travelData = data;
    return data;
  })
  .catch(err => {
    console.error('Could not load travel data:', err);
    showMessage('<span style="color:var(--error)">Unable to load travel data. Please refresh the page.</span>');
    throw err;
  });

// ---- DOM Ready (Single Listener) ----
document.addEventListener('DOMContentLoaded', () => {
  const footerCopy = document.querySelector('.footer-copy');
  if (footerCopy) {
    footerCopy.textContent = `© ${new Date().getFullYear()} Wanderlust Travel. All rights reserved.`;
  }
  if (document.getElementById('searchInput')) {
    initAutocomplete();
    initKeyboardSearch();
  }
  initLazyMap();
  initNewFeatures();
  initDropdownsAfterDataLoad();
  initAuthNavigation();
});

function initAuthNavigation() {
  if (typeof updateNavigation === 'function') {
    updateNavigation();
  }
  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof handleLogout === 'function') handleLogout();
    });
  }
}

function initDropdownsAfterDataLoad() {
  dataLoadedPromise.then(() => {
    populatePackingDestinations();
    populateJournalDestinations();
    renderComparePage();
    renderRecentlyViewed();
  }).catch(() => {});
}

// ---- STAR RENDERER ----
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      html += '<span>★</span>';
    } else if (i === full && half) {
      html += '<span>★</span>';
    } else {
      html += '<span style="opacity:0.3">★</span>';
    }
  }
  return html;
}

// ---- DEBOUNCE UTILITY ----
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ---- SEARCH HANDLER ----
async function handleSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  const keyword = input.value.trim().toLowerCase();

  if (!keyword) {
    showMessage('Please enter a keyword: beach, temple, or a country name.');
    return;
  }

  hideAutocomplete();

  // Show skeleton loading
  showSkeletonLoading();

  if (!travelData) {
    try {
      await dataLoadedPromise;
    } catch (e) {
      return;
    }
  }

  // Artificial delay to show skeleton
  await new Promise(r => setTimeout(r, 600));

  let results = [];
  let category = 'Search';

  if (keyword === 'beach' || keyword === 'beaches') {
    results = travelData.beaches.map(b => ({ ...b, type: 'Beach' }));
    category = 'Beaches';
  } else if (keyword === 'temple' || keyword === 'temples') {
    results = travelData.temples.map(t => ({ ...t, type: 'Temple' }));
    category = 'Temples';
  } else if (keyword === 'country' || keyword === 'countries') {
    travelData.countries.forEach(c => {
      c.cities.forEach(city => {
        results.push({ ...city, type: c.name, timezone: city.timezone });
      });
    });
    category = 'Countries';
  } else {
    travelData.countries.forEach(country => {
      if (country.name.toLowerCase().includes(keyword)) {
        country.cities.forEach(city => {
          results.push({ ...city, type: country.name, timezone: city.timezone });
        });
      } else {
        country.cities.forEach(city => {
          if (city.name.toLowerCase().includes(keyword) || city.description.toLowerCase().includes(keyword)) {
            results.push({ ...city, type: country.name, timezone: city.timezone });
          }
        });
      }
    });

    travelData.temples.forEach(temple => {
      if (temple.name.toLowerCase().includes(keyword) || temple.description.toLowerCase().includes(keyword)) {
        results.push({ ...temple, type: 'Temple' });
      }
    });

    travelData.beaches.forEach(beach => {
      if (beach.name.toLowerCase().includes(keyword) || beach.description.toLowerCase().includes(keyword)) {
        results.push({ ...beach, type: 'Beach' });
      }
    });

    const seen = new Set();
    results = results.filter(item => {
      const duplicate = seen.has(item.name);
      seen.add(item.name);
      return !duplicate;
    });
  }

  if (results.length > 0) {
    currentResults = results;
    addToSearchHistory(input.value.trim());
    results.forEach(r => {
      addToRecentlyViewed({
        name: r.name || `${r.name}, ${r.type}`,
        imageUrl: r.imageUrl || '',
        type: r.type || 'Destination',
        description: r.description || '',
        timezone: r.timezone || ''
      });
    });
    showResultsSection();
    displayResults(results, category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    showMessage(`No results found for "<strong>${escapeHtml(input.value)}</strong>".<br/>Try: beach, temple, Japan, Australia, Brazil, or Sydney.`);
  }
}

// ---- SKELETON LOADING ----
function showSkeletonLoading() {
  const hero = document.getElementById('home');
  const featured = document.getElementById('featured');
  const resultsSection = document.getElementById('results');

  if (hero) hero.style.display = 'none';
  if (featured) featured.style.display = 'none';
  if (resultsSection) resultsSection.style.display = 'block';

  const grid = document.getElementById('resultsGrid');
  const header = document.getElementById('resultsHeader');
  const filterBar = document.getElementById('filterBar');
  const title = document.getElementById('resultsTitle');
  const count = document.getElementById('resultsCount');

  if (!grid) return;
  if (clockInterval) clearInterval(clockInterval);

  header.style.display = 'block';
  if (filterBar) filterBar.style.display = 'flex';
  title.textContent = 'Searching…';
  count.textContent = 'Finding the best destinations for you';

  grid.innerHTML = Array(4).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-tag"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
      </div>
    </div>
  `).join('');
}

function showResultsSection() {
  const hero = document.getElementById('home');
  const featured = document.getElementById('featured');
  const resultsSection = document.getElementById('results');
  const filterBar = document.getElementById('filterBar');

  if (hero) hero.style.display = 'none';
  if (featured) featured.style.display = 'none';
  if (resultsSection) resultsSection.style.display = 'block';
  if (filterBar) filterBar.style.display = 'flex';
}

// ---- DISPLAY RESULTS ----
function displayResults(items, category) {
  const grid = document.getElementById('resultsGrid');
  const header = document.getElementById('resultsHeader');
  const title = document.getElementById('resultsTitle');
  const count = document.getElementById('resultsCount');
  const filterBar = document.getElementById('filterBar');

  if (!grid) return;
  if (clockInterval) clearInterval(clockInterval);

  header.style.display = 'block';
  if (filterBar) filterBar.style.display = 'flex';
  title.textContent = category === 'Search' ? 'Search results' : category;
  count.textContent = `${items.length} recommendation${items.length !== 1 ? 's' : ''} found`;

  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--muted);grid-column:1/-1;padding:2rem">No destinations match your current filters.</p>';
    return;
  }

  items.forEach((item, index) => {
    const reviews = reviewsData[item.name] || { rating: 4.0 + Math.random(), reviews: Math.floor(Math.random() * 500) };
    const rating = Math.round(reviews.rating * 10) / 10;
    const weather = getMockWeather(item.timezone);
    const isFav = getFavorites().includes(item.name);
    const starsHtml = renderStars(rating);
    const escapedName = escapeHtml(item.name);

    const coords = destCoords[item.name];
    const mapHtml = coords ? getMapPreviewHTML(item.name, coords) : '';

    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = `${index * 0.08}s`;

    card.innerHTML = `
      <img class="result-card-img"
           src="${item.imageUrl}"
           alt="${escapedName}"
           loading="lazy"
           onerror="this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600'" />
      <div class="result-card-body">
        <span class="result-tag">${escapeHtml(item.type)}</span>
        <h3>${escapedName}</h3>
        <p>${escapeHtml(item.description)}</p>
        <div class="result-card-footer">
          <div class="result-stars" title="${rating}/5 (${reviews.reviews.toLocaleString()} reviews)">
            ${starsHtml}
            <span style="font-size:0.7rem;color:var(--muted);margin-left:3px">${rating}</span>
          </div>
          <div class="result-weather" title="Current weather">
            <span class="weather-icon">${weather.icon}</span>
            <span>${weather.temp}°C</span>
          </div>
        </div>
        ${item.timezone ? `
          <div class="result-time">
            🕐 Local time: <span class="clock" data-timezone="${escapeHtml(item.timezone)}">${getLocalTime(item.timezone)}</span>
          </div>
        ` : ''}
        ${mapHtml}
        <div class="result-actions">
          <button class="result-btn result-btn-favorite ${isFav ? 'saved' : ''}"
                  onclick="toggleFavorite('${escapedName.replace(/'/g, "\\'")}', this)"
                  title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
            ${isFav ? '♥ Saved' : '♡ Save'}
          </button>
          <button class="result-btn result-btn-share"
                  onclick="shareDestination('${escapedName.replace(/'/g, "\\'")}', '${escapeHtml(item.description).replace(/'/g, "\\'")}')"
                  title="Share this destination">
            ↗ Share
          </button>
          <button class="result-btn result-btn-itinerary"
                  onclick="openItineraryFromSearch('${escapedName.replace(/'/g, "\\'")}', event)"
                  title="View itinerary">
            📋 Itinerary
          </button>
          <button class="result-btn result-btn-book"
                  onclick="openBookingModal('${escapedName.replace(/'/g, "\\'")}', '${escapeHtml(item.imageUrl).replace(/'/g, "\\'")}', '${escapedName.replace(/'/g, "\\'")}')">
            Book Now
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  clockInterval = setInterval(updateClocks, 1000);
}

function getMapPreviewHTML(name, coords) {
  const [lat, lng] = coords;
  const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=12&size=300x120&maptype=roadmap&markers=${lat},${lng}&key=`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return `
    <div class="result-map-section">
      <div class="result-map-preview" onclick="openGoogleMaps('${googleMapsUrl}')" title="View location on Google Maps">
        <div class="result-map-placeholder">
          <span class="map-icon">📍</span>
          <span class="map-label">View on Map</span>
        </div>
      </div>
    </div>
  `;
}

function openGoogleMaps(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ---- FAVORITES ----
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('wanderlust_favorites') || '[]');
  } catch { return []; }
}

function saveFavorites(favs) {
  localStorage.setItem('wanderlust_favorites', JSON.stringify(favs));
}

function toggleFavorite(name, btn) {
  let favs = getFavorites();
  const idx = favs.indexOf(name);
  if (idx > -1) {
    favs.splice(idx, 1);
    btn.classList.remove('saved');
    btn.innerHTML = '♡ Save';
    btn.title = 'Add to favorites';
    showToast(`Removed "${name}" from favorites`);
  } else {
    favs.push(name);
    btn.classList.add('saved');
    btn.innerHTML = '♥ Saved';
    btn.title = 'Remove from favorites';
    showToast(`Added "${name}" to favorites`);
  }
  saveFavorites(favs);
}

// ---- SHARE (Web Share API) ----
async function shareDestination(name, description) {
  const shareData = {
    title: `Check out ${name}!`,
    text: `${description} — recommended by Wanderlust Travel`,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (e) { /* cancelled */ }
  } else {
    try {
      await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${window.location.href}`);
      showToast('Link copied to clipboard!');
    } catch {
      showToast('Share not supported on this browser');
    }
  }
}

// ---- BOOKING MODAL ----
function openBookingModal(destName, imageUrl, destType, contentId) {
  const modal = document.getElementById('bookingModal');
  const content = document.getElementById(contentId || 'modalContent');
  const safeName = escapeHtml(destName);
  const safeImg = escapeHtml(imageUrl);
  const safeType = escapeHtml(destType || destName);

  content.innerHTML = `
    <div class="modal-header">
      <div>
        <h2 class="modal-title" id="modalTitle">Book Your Journey</h2>
        <p class="modal-dest">${safeName}</p>
      </div>
      <button class="modal-close" onclick="closeBookingModal()" aria-label="Close modal">✕</button>
    </div>
    <div class="modal-body">
      <img class="modal-thumb" src="${safeImg}" alt="${safeName}" onerror="this.style.display='none'" />
      <form id="bookingForm" onsubmit="handleBookingSubmit(event, '${safeName.replace(/'/g, "\\'")}')">
        <div class="modal-grid">
          <div class="modal-field">
            <label class="modal-label" for="bookingName">Full Name</label>
            <input type="text" class="modal-input" id="bookingName" placeholder="John Doe" required />
          </div>
          <div class="modal-field">
            <label class="modal-label" for="bookingEmail">Email</label>
            <input type="email" class="modal-input" id="bookingEmail" placeholder="john@example.com" required />
          </div>
          <div class="modal-field">
            <label class="modal-label" for="bookingCheckin">Check-in Date</label>
            <input type="date" class="modal-input" id="bookingCheckin" required />
          </div>
          <div class="modal-field">
            <label class="modal-label" for="bookingCheckout">Check-out Date</label>
            <input type="date" class="modal-input" id="bookingCheckout" required />
          </div>
          <div class="modal-field">
            <label class="modal-label" for="bookingTravelers">Travelers</label>
            <select class="modal-select" id="bookingTravelers" required>
              <option value="">Select</option>
              <option>1 Traveler</option>
              <option>2 Travelers</option>
              <option>3-4 Travelers</option>
              <option>5-8 Travelers</option>
              <option>9+ Travelers</option>
            </select>
          </div>
          <div class="modal-field">
            <label class="modal-label" for="bookingType">Trip Type</label>
            <select class="modal-select" id="bookingType" required>
              <option value="">Select</option>
              <option>Leisure / Relaxation</option>
              <option>Adventure / Active</option>
              <option>Cultural / Historical</option>
              <option>Romantic Getaway</option>
              <option>Family Vacation</option>
            </select>
          </div>
          <div class="modal-field full">
            <label class="modal-label" for="bookingRequests">Special Requests</label>
            <input type="text" class="modal-input" id="bookingRequests" placeholder="Dietary needs, accessibility, etc." />
          </div>
        </div>
        <button type="submit" class="modal-submit">Confirm Booking Request</button>
      </form>
    </div>
  `;

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  const checkin = document.getElementById('bookingCheckin');
  const checkout = document.getElementById('bookingCheckout');
  if (checkin) checkin.min = today;
  if (checkout) checkout.min = today;
  if (checkin) {
    checkin.addEventListener('change', () => {
      if (checkout) {
        checkout.min = checkin.value;
        // Clear checkout if it's before new checkin
        if (checkout.value && checkout.value < checkin.value) {
          checkout.value = '';
          showFieldError(checkout, 'Check-out must be after check-in');
        }
      }
    });
  }

  // Real-time validation
  const nameInput = document.getElementById('bookingName');
  const emailInput = document.getElementById('bookingEmail');
  const messageInput = document.getElementById('bookingRequests');

  if (nameInput) {
    nameInput.addEventListener('blur', () => validateBookingField(nameInput, { required: true, minLength: 2 }));
    nameInput.addEventListener('input', () => clearFieldError(nameInput));
  }

  if (emailInput) {
    emailInput.addEventListener('blur', () => validateBookingField(emailInput, { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }));
    emailInput.addEventListener('input', () => clearFieldError(emailInput));
  }

  if (checkout) {
    checkout.addEventListener('blur', () => {
      if (checkin && checkout.value && checkout.value < checkin.value) {
        showFieldError(checkout, 'Check-out must be after check-in');
      }
    });
  }

  // Set ARIA and show modal
  modal.removeAttribute('hidden');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modalTitle');

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus first input for accessibility
  setTimeout(() => {
    const firstInput = document.getElementById('bookingName');
    if (firstInput) firstInput.focus();
  }, 100);

  // Setup focus trap
  setupFocusTrap(modal);
}

function setupFocusTrap(modal) {
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableElements = modal.querySelectorAll(focusableSelectors);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  modal.addEventListener('keydown', trapFocus);

  // Store trap handler for cleanup
  modal._focusTrapHandler = trapFocus;
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  modal.classList.remove('open');
  modal.setAttribute('hidden', '');
  modal.removeAttribute('role');
  modal.removeAttribute('aria-modal');
  modal.removeAttribute('aria-labelledby');

  // Remove focus trap
  if (modal._focusTrapHandler) {
    modal.removeEventListener('keydown', modal._focusTrapHandler);
    delete modal._focusTrapHandler;
  }

  document.body.style.overflow = '';
}

function validateBookingField(input, rules) {
  const value = input.value.trim();
  let isValid = true;
  let errorMessage = '';

  if (rules.required && !value) {
    isValid = false;
    errorMessage = 'This field is required';
  } else if (rules.minLength && value.length < rules.minLength) {
    isValid = false;
    errorMessage = `Must be at least ${rules.minLength} characters`;
  } else if (rules.pattern && !rules.pattern.test(value)) {
    isValid = false;
    errorMessage = 'Please enter a valid email address';
  }

  if (!isValid) {
    showFieldError(input, errorMessage);
    return false;
  } else {
    clearFieldError(input);
    return true;
  }
}

function showFieldError(input, message) {
  input.classList.add('error');
  let errorEl = input.parentElement.querySelector('.field-error');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    input.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message;
  errorEl.classList.add('show');
  input.setAttribute('aria-invalid', 'true');
}

function clearFieldError(input) {
  input.classList.remove('error');
  const errorEl = input.parentElement.querySelector('.field-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }
  input.removeAttribute('aria-invalid');
}

function closeModalOnOverlay(e) {
  if (e.target === e.currentTarget) closeBookingModal();
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('bookingModal');
  if (modal && modal.classList.contains('open') && e.key === 'Escape') {
    closeBookingModal();
  }
});

function handleBookingSubmit(e, destName) {
  e.preventDefault();

  // Validate all required fields
  const nameInput = document.getElementById('bookingName');
  const emailInput = document.getElementById('bookingEmail');
  const checkin = document.getElementById('bookingCheckin');
  const checkout = document.getElementById('bookingCheckout');
  const travelers = document.getElementById('bookingTravelers');
  const tripType = document.getElementById('bookingType');

  let isValid = true;

  if (!validateBookingField(nameInput, { required: true, minLength: 2 })) isValid = false;
  if (!validateBookingField(emailInput, { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })) isValid = false;
  if (!checkin.value) { showFieldError(checkin, 'Please select a check-in date'); isValid = false; }
  if (!checkout.value) { showFieldError(checkout, 'Please select a check-out date'); isValid = false; }
  if (checkin.value && checkout.value && checkout.value < checkin.value) {
    showFieldError(checkout, 'Check-out must be after check-in'); isValid = false;
  }
  if (!travelers.value) { showFieldError(travelers, 'Please select number of travelers'); isValid = false; }
  if (!tripType.value) { showFieldError(tripType, 'Please select trip type'); isValid = false; }

  if (!isValid) {
    const firstError = document.querySelector('.modal-panel .error');
    if (firstError) firstError.focus();
    return;
  }

  const name = nameInput.value;
  const email = emailInput.value;
  const checkinVal = checkin.value;
  const checkoutVal = checkout.value;
  const travelersVal = travelers.value;
  const tripTypeVal = tripType.value;
  const notesInput = document.getElementById('bookingNotes');
  const notesVal = notesInput ? notesInput.value : '';

  const bookings = JSON.parse(localStorage.getItem('wanderlust_bookings') || '[]');
  bookings.push({
    destination: destName,
    name,
    email,
    checkin: checkinVal,
    checkout: checkoutVal,
    travelers: travelersVal,
    tripType: tripTypeVal,
    notes: notesVal,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('wanderlust_bookings', JSON.stringify(bookings));

  const content = document.getElementById('modalContent');
  const safeName = escapeHtml(destName);

  content.innerHTML = `
    <div class="modal-header">
      <div>
        <h2 class="modal-title">Booking Submitted!</h2>
        <p class="modal-dest">${safeName}</p>
      </div>
      <button class="modal-close" onclick="closeBookingModal()" aria-label="Close modal">✕</button>
    </div>
    <div class="modal-body">
      <div class="modal-success">
        <span class="modal-success-icon">✦</span>
        <h3>Your journey begins here.</h3>
        <p>We've received your booking request for <strong>${safeName}</strong>. Our travel team will reach out within 24 hours to confirm your trip details and send a personalized itinerary.</p>
        <p style="margin-top:1rem;font-size:0.82rem;color:var(--muted)">A confirmation has been sent to your email address.</p>
      </div>
      <button class="modal-submit" onclick="closeBookingModal()">Done</button>
    </div>
  `;

  showToast(`Booking confirmed for ${safeName}! We'll contact you at ${escapeHtml(email)}`);
}

// ---- FILTERS ----
function applyFilter(type) {
  activeFilter = type;
  document.querySelectorAll('#filterChips .filter-chip').forEach(c => {
    const isActive = c.dataset.filter === type;
    c.classList.toggle('active', isActive);
    c.setAttribute('aria-checked', isActive);
  });
  renderFilteredResults();
}

function applyRating(rating) {
  activeMinRating = rating;
  document.querySelectorAll('#filterStars .filter-star').forEach(s => {
    const isActive = parseInt(s.dataset.rating) <= rating;
    s.classList.toggle('active', isActive);
  });
  renderFilteredResults();
}

function renderFilteredResults() {
  let filtered = [...currentResults];

  if (activeFilter !== 'all') {
    filtered = filtered.filter(item => item.type === activeFilter);
  }

  if (activeMinRating > 0) {
    filtered = filtered.filter(item => {
      const r = reviewsData[item.name]?.rating || 4.0;
      return r >= activeMinRating;
    });
  }

  displayResults(filtered, 'Filtered results');
  const count = document.getElementById('resultsCount');
  if (count) count.textContent = `${filtered.length} of ${currentResults.length} recommendations`;
}

// ---- WEATHER CLOCK ----
function updateClocks() {
  document.querySelectorAll('.clock').forEach(clock => {
    const tz = clock.getAttribute('data-timezone');
    const timeStr = getLocalTime(tz);
    if (timeStr) clock.textContent = timeStr;
  });
}

function getLocalTime(timezone) {
  if (!timezone) return null;
  try {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });
  } catch { return null; }
}

// ---- AUTOCOMPLETE ----
function initAutocomplete() {
  const input = document.getElementById('searchInput');
  const dropdown = document.getElementById('autocompleteDropdown');
  if (!input || !dropdown) return;

  // Debounced input handler
  const debouncedSearch = debounce((val) => {
    const query = val.trim().toLowerCase();
    if (query.length < 1) { hideAutocomplete(); return; }
    showAutocompleteSuggestions(query);
  }, 150);

  input.addEventListener('input', (e) => {
    autocompleteDebounceTimer = debouncedSearch(e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.autocomplete-item:not([hidden])');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        autocompleteIndex = Math.min(autocompleteIndex + 1, items.length - 1);
        updateAutocompleteSelection(items);
        scrollSelectedIntoView(items);
        break;
      case 'ArrowUp':
        e.preventDefault();
        autocompleteIndex = Math.max(autocompleteIndex - 1, -1);
        updateAutocompleteSelection(items);
        scrollSelectedIntoView(items);
        break;
      case 'Enter':
        e.preventDefault();
        if (autocompleteIndex >= 0 && items[autocompleteIndex]) {
          items[autocompleteIndex].click();
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        hideAutocomplete();
        break;
    }
  });

  // Use mousedown instead of blur to prevent race condition on mobile
  input.addEventListener('mousedown', (e) => {
    if (dropdown.classList.contains('show')) {
      e.stopPropagation();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrap')) {
      hideAutocomplete();
    }
  });
}

function scrollSelectedIntoView(items) {
  if (autocompleteIndex >= 0 && items[autocompleteIndex]) {
    items[autocompleteIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function getAllDestinations() {
  if (!travelData) return [];
  const all = [];
  travelData.countries.forEach(c => {
    c.cities.forEach(city => {
      all.push({ name: city.name, type: c.name, imageUrl: city.imageUrl });
    });
  });
  travelData.temples.forEach(t => all.push({ name: t.name, type: 'Temple', imageUrl: t.imageUrl }));
  travelData.beaches.forEach(b => all.push({ name: b.name, type: 'Beach', imageUrl: b.imageUrl }));
  return all;
}

function showAutocompleteSuggestions(query) {
  if (!travelData) return;
  const dropdown = document.getElementById('autocompleteDropdown');
  const input = document.getElementById('searchInput');
  const all = getAllDestinations();

  const matches = all.filter(d =>
    d.name.toLowerCase().includes(query) ||
    d.type.toLowerCase().includes(query)
  ).slice(0, 7);

  if (matches.length === 0) {
    hideAutocomplete();
    return;
  }

  dropdown.innerHTML = matches.map((m, i) => `
    <div class="autocomplete-item"
         data-name="${escapeHtml(m.name)}"
         data-type="${escapeHtml(m.type)}"
         data-img="${escapeHtml(m.imageUrl)}"
         role="option"
         id="autocomplete-item-${i}"
         aria-setsize="${matches.length}"
         aria-posinset="${i + 1}">
      <img class="autocomplete-img"
           src="${escapeHtml(m.imageUrl)}"
           alt="${escapeHtml(m.name)}"
           loading="lazy"
           onerror="this.style.display='none'" />
      <div class="autocomplete-text">
        <div class="autocomplete-name">${escapeHtml(m.name)}</div>
        <div class="autocomplete-type">${escapeHtml(m.type)}</div>
      </div>
    </div>
  `).join('');

  // Set ARIA attributes
  dropdown.setAttribute('role', 'listbox');
  dropdown.setAttribute('aria-label', 'Destination suggestions');
  if (input) {
    input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', 'autocompleteDropdown');
  }

  dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      selectAutocompleteItem(item);
    });
    // Keyboard support
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectAutocompleteItem(item);
      }
    });
  });

  autocompleteIndex = -1;
  dropdown.classList.add('show');
}

function updateAutocompleteSelection(items) {
  items.forEach((item, i) => {
    const isSelected = i === autocompleteIndex;
    item.classList.toggle('selected', isSelected);
    item.setAttribute('aria-selected', isSelected);
  });
}

function selectAutocompleteItem(item) {
  const name = item.dataset.name;
  const input = document.getElementById('searchInput');
  if (input) {
    input.value = name;
    hideAutocomplete();
    handleSearch();
  }
}

function hideAutocomplete() {
  const dropdown = document.getElementById('autocompleteDropdown');
  const input = document.getElementById('searchInput');
  if (dropdown) {
    dropdown.classList.remove('show');
    dropdown.removeAttribute('role');
    dropdown.removeAttribute('aria-label');
  }
  if (input) {
    input.setAttribute('aria-expanded', 'false');
  }
  autocompleteIndex = -1;
}

// ---- Separate Enter Key Handler (called from init) ----
function initKeyboardSearch() {
  const input = document.getElementById('searchInput');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        hideAutocomplete();
        handleSearch();
      }
    });
  }
}

// ---- MAP (Leaflet) — Lazy Loaded ----
let mapInstance = null;
let mapInitialized = false;
let mapLoadStarted = false;

function initLazyMap() {
  const mapSection = document.getElementById('explore');
  if (!mapSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !mapLoadStarted) {
        mapLoadStarted = true;
        loadMapScript().then(() => {
          initMap();
        }).catch((err) => {
          console.error('Map loading failed:', err);
          showMapError('Unable to load map. Please check your internet connection and try again.');
        });
        observer.disconnect();
      }
    });
  }, {
    rootMargin: '200px',
    threshold: 0
  });

  observer.observe(mapSection);
}

function showMapError(message) {
  const loader = document.getElementById('mapLoading');
  if (loader) {
    loader.innerHTML = `<span style="color:var(--error)">${message}</span><button onclick="retryMapLoad()" style="margin-top:0.5rem;padding:0.4rem 1rem;background:var(--gold);border:none;border-radius:4px;cursor:pointer;font-size:0.85rem">Retry</button>`;
  }
}

function retryMapLoad() {
  const loader = document.getElementById('mapLoading');
  if (loader) {
    loader.innerHTML = '<div class="map-loading-spinner"></div><span>Loading map…</span>';
  }
  mapLoadStarted = false;
  mapInitialized = false;
  if (window.L) {
    initLazyMap();
  } else {
    loadMapScript().then(() => initMap()).catch(() => showMapError('Failed to load map library'));
  }
}

function loadMapScript() {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.crossOrigin = '';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Leaflet'));
    document.head.appendChild(script);
  });
}

function initMap() {
  if (mapInitialized || !document.getElementById('destinationsMap')) return;

  mapInitialized = true;
  mapInstance = L.map('destinationsMap', {
    scrollWheelZoom: false
  }).setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(mapInstance);

  mapInstance.on('tileerror', (e) => {
    console.warn('Tile load error:', e);
  });

  mapInstance.whenReady(() => {
    const loader = document.getElementById('mapLoading');
    if (loader) loader.classList.add('hidden');
  });

  dataLoadedPromise.then(data => {
    if (!mapInstance) return;
    addMapMarkers(data);
    const loader = document.getElementById('mapLoading');
    if (loader) loader.classList.add('hidden');
  }).catch(() => {
    showMapError('Unable to load destination data');
  });
}

function addMapMarkers(data) {
  if (!mapInstance) return;

  function createPopupContent(name, imageUrl, rating, reviewCount, description) {
    const safeName = escapeHtml(name);
    const safeImg = escapeHtml(imageUrl);
    const safeDesc = escapeHtml(description.substring(0, 80));
    const safeRating = Math.round(rating * 10) / 10;

    return `
      <div style="min-width:200px;font-family:'DM Sans',sans-serif;padding:4px">
        <img src="${safeImg}"
             style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-bottom:8px"
             alt="${safeName}"
             loading="lazy"
             onerror="this.style.display='none'" />
        <strong style="font-size:14px;color:var(--ink);display:block;margin-bottom:4px">${safeName}</strong>
        <div style="font-size:12px;color:var(--muted);margin-bottom:4px">★ ${safeRating} · ${reviewCount.toLocaleString()} reviews</div>
        <div style="font-size:11px;color:var(--muted);line-height:1.4">${safeDesc}…</div>
      </div>
    `;
  }

  data.countries.forEach(country => {
    country.cities.forEach(city => {
      const coords = destCoords[city.name];
      if (coords) {
        const rev = reviewsData[city.name] || { rating: 4.0, reviews: 100 };
        const marker = L.marker(coords).addTo(mapInstance);
        marker.bindPopup(createPopupContent(
          city.name, city.imageUrl, rev.rating, rev.reviews, city.description
        ));
      }
    });
  });

  data.temples.forEach(temple => {
    const coords = destCoords[temple.name];
    if (coords) {
      const rev = reviewsData[temple.name] || { rating: 4.8, reviews: 100 };
      L.marker(coords).addTo(mapInstance).bindPopup(createPopupContent(
        temple.name, temple.imageUrl, rev.rating, rev.reviews, temple.description
      ));
    }
  });

  data.beaches.forEach(beach => {
    const coords = destCoords[beach.name];
    if (coords) {
      const rev = reviewsData[beach.name] || { rating: 4.5, reviews: 100 };
      L.marker(coords).addTo(mapInstance).bindPopup(createPopupContent(
        beach.name, beach.imageUrl, rev.rating, rev.reviews, beach.description
      ));
    }
  });
}

// ---- NEWSLETTER ----
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('newsletterEmail');
  if (!input) return;

  const email = input.value.trim();
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address');
    return;
  }

  const subscribers = JSON.parse(localStorage.getItem('wanderlust_subscribers') || '[]');
  if (!subscribers.includes(email)) {
    subscribers.push(email);
    localStorage.setItem('wanderlust_subscribers', JSON.stringify(subscribers));
  }

  const success = document.getElementById('newsletterSuccess');
  if (success) success.classList.add('show');
  input.value = '';
  showToast('Welcome aboard! Check your inbox for a travel guide.');
  setTimeout(() => {
    if (success) success.classList.remove('show');
  }, 6000);
}

// ---- RESET ----
function handleReset() {
  const input = document.getElementById('searchInput');
  const grid = document.getElementById('resultsGrid');
  const header = document.getElementById('resultsHeader');
  const filterBar = document.getElementById('filterBar');
  const hero = document.getElementById('home');
  const featured = document.getElementById('featured');

  if (clockInterval) clearInterval(clockInterval);
  if (input) input.value = '';
  if (grid) grid.innerHTML = '';
  if (header) header.style.display = 'none';
  if (filterBar) filterBar.style.display = 'none';

  // Reset filters
  activeFilter = 'all';
  activeMinRating = 0;
  document.querySelectorAll('#filterChips .filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.filter === 'all');
  });
  document.querySelectorAll('#filterStars .filter-star').forEach(s => s.classList.remove('active'));

  currentResults = [];

  if (hero) hero.style.display = 'flex';
  if (featured) featured.style.display = 'block';

  const results = document.getElementById('results');
  if (results) results.style.display = 'none';

  hideAutocomplete();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- QUICK SEARCH ----
function quickSearch(keyword) {
  const input = document.getElementById('searchInput');
  if (input) {
    input.value = keyword;
    handleSearch();
  }
}

// ---- TOAST ----
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const existingToasts = container.querySelectorAll('.toast');
  if (existingToasts.length >= 3) {
    existingToasts[0].remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `<span aria-hidden="true">✦</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  announceToScreenReader(message);

  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showUndoToast(message, undoCallback, duration) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const existingToasts = container.querySelectorAll('.toast');
  if (existingToasts.length >= 3) {
    existingToasts[0].remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast toast--undo';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const msgSpan = document.createElement('span');
  msgSpan.textContent = message;

  const undoBtn = document.createElement('button');
  undoBtn.className = 'toast-undo-btn';
  undoBtn.textContent = 'Undo';
  undoBtn.addEventListener('click', () => {
    clearTimeout(timer);
    undoCallback();
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 300);
  });

  toast.appendChild(msgSpan);
  toast.appendChild(undoBtn);
  container.appendChild(toast);

  const timer = setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 300);
  }, duration || 5000);
}

function announceToScreenReader(message) {
  let announcer = document.getElementById('srAnnouncer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'srAnnouncer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
    document.body.appendChild(announcer);
  }
  announcer.textContent = '';
  setTimeout(() => { announcer.textContent = message; }, 100);
}

// ---- MESSAGE ----
function showMessage(html) {
  const grid = document.getElementById('resultsGrid');
  const header = document.getElementById('resultsHeader');
  const title = document.getElementById('resultsTitle');
  const count = document.getElementById('resultsCount');
  const filterBar = document.getElementById('filterBar');
  const hero = document.getElementById('home');
  const featured = document.getElementById('featured');
  const resultsSection = document.getElementById('results');

  if (!grid) return;
  if (clockInterval) clearInterval(clockInterval);
  if (filterBar) filterBar.style.display = 'none';

  if (hero) hero.style.display = 'none';
  if (featured) featured.style.display = 'none';
  if (resultsSection) resultsSection.style.display = 'block';

  header.style.display = 'block';
  title.textContent = 'Search results';
  count.innerHTML = html;
  grid.innerHTML = '';
}

// ---- MOBILE NAV ----
function toggleMenu() {
  const links = document.querySelector('.nav-links');
  const toggle = document.querySelector('.nav-toggle');
  if (!links) return;

  const isOpen = links.classList.contains('open');

  if (isOpen) {
    closeMobileMenu(links, toggle);
  } else {
    openMobileMenu(links, toggle);
  }
}

function openMobileMenu(links, toggle) {
  links.classList.add('open');
  document.body.classList.add('menu-open');
  if (toggle) {
    toggle.textContent = '✕';
    toggle.setAttribute('aria-label', 'Close menu');
  }

  // Inject mobile search bar if it doesn't exist and search is available
  if (!links.querySelector('.mobile-search-bar')) {
    const desktopSearch = document.querySelector('.nav-search');
    if (desktopSearch) {
      const mobileSearch = document.createElement('div');
      mobileSearch.className = 'mobile-search-bar';
      mobileSearch.innerHTML = `
        <input type="text" id="mobileSearchInput" class="search-input" placeholder="Search destinations…" aria-label="Search destinations" />
        <div class="mobile-search-actions">
          <button class="btn-search" onclick="handleMobileSearch()">Search</button>
          <button class="btn-reset" onclick="handleMobileReset()">Clear</button>
        </div>
      `;
      links.insertBefore(mobileSearch, links.firstChild);

      // Sync mobile search input
      const mobileInput = document.getElementById('mobileSearchInput');
      if (mobileInput) {
        mobileInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            handleMobileSearch();
          }
        });
      }
    }
  }

  // Close menu when a link is clicked
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu(links, toggle);
    }, { once: true });
  });
}

function closeMobileMenu(links, toggle) {
  links.classList.remove('open');
  document.body.classList.remove('menu-open');
  if (toggle) {
    toggle.textContent = '☰';
    toggle.setAttribute('aria-label', 'Open menu');
  }
}

function handleMobileSearch() {
  const mobileInput = document.getElementById('mobileSearchInput');
  const desktopInput = document.getElementById('searchInput');
  if (mobileInput && desktopInput) {
    desktopInput.value = mobileInput.value;
  }
  closeMobileMenu(document.querySelector('.nav-links'), document.querySelector('.nav-toggle'));
  handleSearch();
}

function handleMobileReset() {
  const mobileInput = document.getElementById('mobileSearchInput');
  if (mobileInput) mobileInput.value = '';
  closeMobileMenu(document.querySelector('.nav-links'), document.querySelector('.nav-toggle'));
  handleReset();
}

// ---- SCROLL NAVBAR ----
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.style.background = window.scrollY > 60
      ? 'rgba(26, 22, 18, 0.97)'
      : 'rgba(26, 22, 18, 0.88)';
  }
}, { passive: true });

// ---- UTILITY: Escape HTML ----
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---- ITINERARY FUNCTIONS ----
let itineraryData = [];
let currentItineraryDestination = null;

async function loadItineraryData() {
  if (itineraryData.length === 0) {
    try {
      const response = await fetch('itineraries.json');
      const data = await response.json();
      itineraryData = data.itineraries || [];
    } catch (e) {
      console.error('Failed to load itinerary data:', e);
    }
  }
  return itineraryData;
}

async function openItineraryFromSearch(destName, event) {
  if (event) event.stopPropagation();
  await loadItineraryData();
  const it = itineraryData.find(i => i.destination === destName);
  if (!it) {
    showToast('Itinerary not available for this destination');
    return;
  }
  openItineraryModal(it);
}

function openItineraryModal(it) {
  currentItineraryDestination = it;

  // Check if modal already exists, if not create it
  let modal = document.getElementById('searchItineraryModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'searchItineraryModal';
    modal.className = 'modal-overlay';
    modal.setAttribute('hidden', '');
    modal.onclick = function (e) { if (e.target === modal) closeItineraryModal(); };
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-panel itinerary-panel" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="closeItineraryModal()" aria-label="Close">✕</button>
      <div class="itinerary-content">
        <div class="itinerary-hero">
          <img src="${getItineraryImage(it.destination)}" alt="${it.destination}" onerror="this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'" />
          <div class="itinerary-hero-overlay"></div>
          <div class="itinerary-hero-content">
            <span class="itinerary-type">${it.days} Day Itinerary</span>
            <h2 class="itinerary-title">${it.destination}</h2>
          </div>
        </div>
        <div class="itinerary-body">
          <div class="itinerary-header">
            <div class="itinerary-days-badge">
              <span>📅</span> ${it.days} Days
            </div>
            <p class="itinerary-desc">${it.description}</p>
          </div>
          <div class="itinerary-days-nav">
            ${it.daysDetail.map((d, i) => `
              <button class="itinerary-day-tab ${i + 1 === 1 ? 'active' : ''}" onclick="switchSearchItineraryDay(${i + 1})">
                Day ${d.day}
              </button>
            `).join('')}
          </div>
          ${it.daysDetail.map((d, i) => `
            <div class="itinerary-day-content ${i + 1 === 1 ? 'active' : ''}" data-day="${i + 1}">
              <h3 class="itinerary-day-title">${d.title}</h3>
              <ul class="itinerary-activities">
                ${d.activities.map(a => `
                  <li class="itinerary-activity">
                    <div class="itinerary-activity-time">${a.time}</div>
                    <div class="itinerary-activity-details">
                      <div class="itinerary-activity-place">${a.place}</div>
                      <div class="itinerary-activity-desc">${a.description}</div>
                    </div>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
          ${it.tips ? `
            <div class="itinerary-tips">
              <h4>💡 Travel Tips</h4>
              <p>${it.tips}</p>
            </div>
          ` : ''}
          <div class="itinerary-actions">
            <button class="booking-btn booking-btn-primary" onclick="closeItineraryModal(); setTimeout(() => openBookingModal('${escapeHtml(it.destination).replace(/'/g, "\\'")}', null), 300)">
              Book This Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function getItineraryImage(destName) {
  const images = {
    'Sydney, Australia': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
    'Melbourne, Australia': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800',
    'Tokyo, Japan': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    'Kyoto, Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    'Paris, France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    'New York, USA': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    'Rome, Italy': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    'Venice, Italy': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800',
    'Florence, Italy': 'https://images.unsplash.com/photo-1543429257-3eb0b65d9c58?w=800',
    'Barcelona, Spain': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    'Bali, Indonesia': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    'Santorini, Greece': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
    'Bangkok, Thailand': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800',
    'Jaipur, India': 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800',
    'Marrakech, Morocco': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800',
    'Cape Town, South Africa': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800'
  };
  return images[destName] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';
}

function switchSearchItineraryDay(day) {
  document.querySelectorAll('.itinerary-day-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i + 1 === day);
  });
  document.querySelectorAll('.itinerary-day-content').forEach((content, i) => {
    content.classList.toggle('active', i + 1 === day);
  });
}

function closeItineraryModal() {
  const modal = document.getElementById('searchItineraryModal');
  if (modal) {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }
}

// =====================================================
// NEW FEATURES
// =====================================================

// ---- DARK MODE ----
function initDarkMode() {
  const saved = localStorage.getItem('wanderlust_dark_mode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved !== null ? saved === 'true' : prefersDark;
  applyDarkMode(isDark);
}

function applyDarkMode(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  localStorage.setItem('wanderlust_dark_mode', JSON.stringify(isDark));
  updateThemeToggleButtons(isDark);
}

function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark';
  applyDarkMode(!current);
}

function updateThemeToggleButtons(isDark) {
  document.querySelectorAll('.theme-toggle-icon').forEach(el => {
    el.textContent = isDark ? '☀️' : '🌙';
  });
  const prefDarkMode = document.getElementById('prefDarkMode');
  if (prefDarkMode) {
    prefDarkMode.checked = isDark;
  }
}

// ---- RECENTLY VIEWED ----
function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem('wanderlust_recently_viewed') || '[]');
  } catch { return []; }
}

function saveRecentlyViewed(items) {
  localStorage.setItem('wanderlust_recently_viewed', JSON.stringify(items.slice(0, 12)));
}

function addToRecentlyViewed(dest) {
  if (!dest || !dest.name) return;
  let recent = getRecentlyViewed();
  recent = recent.filter(r => r.name !== dest.name);
  recent.unshift({
    name: dest.name,
    imageUrl: dest.imageUrl || '',
    type: dest.type || '',
    description: dest.description || '',
    timezone: dest.timezone || '',
    viewedAt: new Date().toISOString()
  });
  saveRecentlyViewed(recent);
  renderRecentlyViewed();
}

function clearRecentlyViewed() {
  localStorage.removeItem('wanderlust_recently_viewed');
  renderRecentlyViewed();
  showToast('Recently viewed history cleared');
}

function renderRecentlyViewed() {
  const section = document.getElementById('recentlyViewedSection');
  if (!section) return;
  const recent = getRecentlyViewed();
  const grid = document.getElementById('recentlyViewedGrid');
  if (!grid) return;
  if (recent.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';
  grid.innerHTML = recent.map(dest => `
    <div class="recent-card" onclick="viewRecentDestination('${escapeHtml(dest.name)}')">
      <img class="recent-card-img" src="${dest.imageUrl}" alt="${escapeHtml(dest.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600'" />
      <div class="recent-card-body">
        <h4>${escapeHtml(dest.name)}</h4>
        <p>${escapeHtml(dest.description.substring(0, 80))}${dest.description.length > 80 ? '...' : ''}</p>
      </div>
    </div>
  `).join('');
}

function viewRecentDestination(name) {
  const results = currentResults.length > 0 ? currentResults : flattenDestinations(travelData);
  const dest = results.find(d => d.name === name) || flattenDestinations(travelData).find(d => d.name === name);
  if (dest) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      if (typeof openDetailOverlay === 'function') {
        openDetailOverlay(dest);
      } else {
        const input = document.getElementById('searchInput');
        if (input) {
          input.value = dest.name;
          handleSearch();
        }
      }
    }, 500);
  }
}

// ---- SEARCH HISTORY ----
function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem('wanderlust_search_history') || '[]');
  } catch { return []; }
}

function saveSearchHistory(history) {
  localStorage.setItem('wanderlust_search_history', JSON.stringify(history.slice(0, 8)));
}

function addToSearchHistory(query) {
  if (!query || query.trim() === '') return;
  let history = getSearchHistory();
  history = history.filter(h => h.toLowerCase() !== query.toLowerCase());
  history.unshift(query.trim());
  saveSearchHistory(history);
}

function showSearchHistory() {
  const dropdown = document.getElementById('searchHistoryDropdown');
  if (!dropdown) return;
  const history = getSearchHistory();
  if (history.length === 0) {
    dropdown.classList.remove('show');
    return;
  }
  dropdown.innerHTML = history.map(h => `
    <div class="search-history-item" onclick="rerunSearch('${escapeHtml(h)}')">
      <span><span class="history-icon">🕐</span> ${escapeHtml(h)}</span>
    </div>
  `).join('') + `<button class="search-history-clear" onclick="clearSearchHistory()">Clear search history</button>`;
  dropdown.classList.add('show');
}

function hideSearchHistory() {
  const dropdown = document.getElementById('searchHistoryDropdown');
  if (dropdown) dropdown.classList.remove('show');
}

function rerunSearch(query) {
  const input = document.getElementById('searchInput');
  if (input) {
    input.value = query;
    hideSearchHistory();
    handleSearch();
  }
}

function clearSearchHistory() {
  localStorage.removeItem('wanderlust_search_history');
  hideSearchHistory();
  showToast('Search history cleared');
}

function initSearchHistory() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('focus', () => {
    if (input.value.trim() === '') {
      showSearchHistory();
    }
  });
  input.addEventListener('blur', () => {
    setTimeout(hideSearchHistory, 200);
  });
}

// ---- BEST TIME TO VISIT WIDGET ----
function getBestTimeMonths(bestTimeStr) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const months = monthNames.map((name, i) => ({ name, index: i, status: 'neutral' }));
  if (!bestTimeStr) return months;
  const lower = bestTimeStr.toLowerCase();
  const bestMonths = [];
  const okMonths = [];
  const avoidMonths = [];
  if (lower.includes('nov') || lower.includes('dec') || lower.includes('jan') || lower.includes('feb') || lower.includes('mar')) {
    if (lower.includes('apr') || lower.includes('may') || lower.includes('jun')) {
      [10, 11, 0, 1, 2, 3, 4, 5].forEach(m => bestMonths.push(m));
    } else {
      [10, 11, 0, 1, 2].forEach(m => bestMonths.push(m));
    }
  }
  if (lower.includes('mar') || lower.includes('apr') || lower.includes('may')) {
    [2, 3, 4].forEach(m => { if (!bestMonths.includes(m)) bestMonths.push(m); });
  }
  if (lower.includes('jun') || lower.includes('jul') || lower.includes('aug') || lower.includes('sep')) {
    if (lower.includes('oct') || lower.includes('nov')) {
      [5, 6, 7, 8, 9, 10].forEach(m => bestMonths.push(m));
    } else {
      [5, 6, 7, 8].forEach(m => { if (!bestMonths.includes(m)) bestMonths.push(m); });
    }
  }
  if (lower.includes('sep') || lower.includes('oct')) {
    [8, 9].forEach(m => { if (!bestMonths.includes(m)) okMonths.push(m); });
  }
  if (lower.includes('monsoon') || lower.includes('rainy') || lower.includes('wet season')) {
    [5, 6, 7, 8].forEach(m => { if (!bestMonths.includes(m)) avoidMonths.push(m); });
  }
  if (lower.includes('winter') && !lower.includes('avoid')) {
    [11, 0, 1].forEach(m => { if (!bestMonths.includes(m) && !avoidMonths.includes(m)) okMonths.push(m); });
  }
  if (bestMonths.length === 0 && okMonths.length === 0 && avoidMonths.length === 0) {
    [2, 3, 4, 5, 6, 7, 8, 9].forEach(m => bestMonths.push(m));
  }
  months.forEach(m => {
    if (bestMonths.includes(m.index)) m.status = 'best';
    else if (avoidMonths.includes(m.index)) m.status = 'avoid';
    else if (okMonths.includes(m.index)) m.status = 'ok';
    else if (bestMonths.length > 0) m.status = 'neutral';
    else m.status = 'ok';
  });
  return months;
}

function renderBestTimeWidget(bestTimeStr) {
  const months = getBestTimeMonths(bestTimeStr);
  return `
    <div class="best-time-widget">
      <div class="best-time-title">Best Time to Visit</div>
      <div class="best-time-calendar">
        ${months.map(m => `
          <div class="best-time-month ${m.status}" title="${getMonthTooltip(m.status)}">
            <span class="month-abbr">${m.name}</span>
          </div>
        `).join('')}
      </div>
      <div class="best-time-legend">
        <span><span class="legend-dot" style="background:var(--calendar-best)"></span> Best</span>
        <span><span class="legend-dot" style="background:var(--calendar-ok)"></span> OK</span>
        <span><span class="legend-dot" style="background:var(--calendar-avoid)"></span> Avoid</span>
      </div>
    </div>
  `;
}

function getMonthTooltip(status) {
  if (status === 'best') return 'Best time to visit';
  if (status === 'avoid') return 'Less ideal conditions';
  if (status === 'ok') return 'Acceptable conditions';
  return 'Neutral season';
}

// ---- HIGHLIGHTS CAROUSEL ----
function renderHighlightsCarousel(highlights) {
  if (!highlights || highlights.length === 0) return '';
  const icons = ['✦', '◆', '●', '▲', '★', '♦', '◉', '⬟', '⬡', '◎'];
  return `
    <div class="highlights-carousel">
      <h4>Highlights</h4>
      <div class="highlights-track">
        ${highlights.map((h, i) => `
          <div class="highlight-item">
            <span class="highlight-icon">${icons[i % icons.length]}</span>
            <span class="highlight-text">${escapeHtml(h)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ---- FLATTEN DESTINATIONS ----
function flattenDestinations(data) {
  if (!data) return [];
  const results = [];
  if (data.countries) {
    data.countries.forEach(country => {
      if (country.cities) {
        country.cities.forEach(city => {
          results.push({
            name: `${city.name}, ${country.name}`,
            nameKey: `${city.name}, ${country.name}`,
            imageUrl: city.imageUrl || country.imageUrl || '',
            description: city.description || country.description || '',
            type: 'Country',
            timezone: city.timezone || country.timezone || '',
            highlights: city.highlights || country.highlights || [],
            bestTime: city.bestTime || country.bestTime || '',
            currency: country.currency || '',
            language: country.language || '',
            country: country.name
          });
        });
      }
    });
  }
  if (data.temples) {
    data.temples.forEach(temple => {
      results.push({
        name: temple.name,
        nameKey: temple.name,
        imageUrl: temple.imageUrl || '',
        description: temple.description || '',
        type: 'Temple',
        timezone: temple.timezone || '',
        highlights: temple.highlights || [],
        bestTime: temple.bestTime || '',
        currency: '',
        language: '',
        country: temple.country || ''
      });
    });
  }
  if (data.beaches) {
    data.beaches.forEach(beach => {
      results.push({
        name: beach.name,
        nameKey: beach.name,
        imageUrl: beach.imageUrl || '',
        description: beach.description || '',
        type: 'Beach',
        timezone: beach.timezone || '',
        highlights: beach.highlights || [],
        bestTime: beach.bestTime || '',
        currency: '',
        language: '',
        country: beach.country || ''
      });
    });
  }
  return results;
}

// ---- DESTINATION COMPARISON ----
let compareSelections = { 1: null, 2: null, 3: null };

function getCompareDestinations() {
  if (!travelData) return [];
  const all = flattenDestinations(travelData);
  const recent = getRecentlyViewed();
  const unique = [];
  const seen = new Set();
  [...recent.map(r => ({ name: r.name, imageUrl: r.imageUrl, type: r.type || 'Destination' })), ...all].forEach(d => {
    if (!seen.has(d.name)) {
      seen.add(d.name);
      unique.push(d);
    }
  });
  return unique;
}

function initCompareSearch() {
  [1, 2, 3].forEach(num => {
    const input = document.getElementById(`compareInput${num}`);
    const dropdown = document.getElementById(`compareDropdown${num}`);
    if (!input || !dropdown) return;

    input.addEventListener('input', debounce(() => {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        dropdown.classList.remove('show');
        return;
      }
      const all = getCompareDestinations();
      const filtered = all.filter(d => d.name.toLowerCase().includes(query));
      if (filtered.length === 0) {
        dropdown.innerHTML = `<div class="compare-dropdown-item"><span class="cd-type">No destinations found</span></div>`;
      } else {
        dropdown.innerHTML = filtered.slice(0, 10).map(d => `
          <div class="compare-dropdown-item" onclick="selectCompareDest(${num}, '${escapeHtml(d.name).replace(/'/g, "\\'")}')">
            <div>
              <div class="cd-name">${escapeHtml(d.name)}</div>
              <div class="cd-type">${escapeHtml(d.type || 'Destination')}</div>
            </div>
          </div>
        `).join('');
      }
      dropdown.classList.add('show');
    }, 150));

    input.addEventListener('focus', () => {
      if (input.value.trim()) input.dispatchEvent(new Event('input'));
    });

    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.classList.remove('show'), 200);
    });
  });
}

function selectCompareDest(num, name) {
  const input = document.getElementById(`compareInput${num}`);
  const dropdown = document.getElementById(`compareDropdown${num}`);
  const selected = document.getElementById(`compareSelected${num}`);
  if (!input) return;

  compareSelections[num] = name;
  input.value = name;
  dropdown.classList.remove('show');

  if (selected) {
    selected.textContent = `✓ ${name}`;
    selected.classList.add('show');
  }
}

function renderComparePage() {
  initCompareSearch();
}

function compareDestinations() {
  const name1 = compareSelections[1];
  const name2 = compareSelections[2];
  const name3 = compareSelections[3];
  if (!name1 || !name2) {
    showToast('Please select at least 2 destinations to compare');
    return;
  }
  const all = flattenDestinations(travelData);
  const dests = [name1, name2, name3].filter(Boolean).map(name => {
    let found = all.find(d => d.name === name);
    if (!found) {
      const parts = name.split(',');
      const searchName = parts[0].trim().toLowerCase();
      found = all.find(d => d.name.toLowerCase().includes(searchName));
    }
    return found || { name, imageUrl: '', description: '', type: '', timezone: '', highlights: [], bestTime: '', currency: '', language: '' };
  });
  const container = document.getElementById('compareResults');
  if (!container) return;
  const maxRating = 5;
  container.innerHTML = `
    <div class="compare-table-wrapper">
    <table class="compare-table">
      <thead>
        <tr>
          <th>Feature</th>
          ${dests.map(d => `<th>${escapeHtml(d.name)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Type</td>
          ${dests.map(d => `<td>${escapeHtml(d.type || 'N/A')}</td>`).join('')}
        </tr>
        <tr>
          <td>Rating</td>
          ${dests.map(d => {
            const r = reviewsData[d.name] || { rating: 4.5 };
            const pct = (r.rating / maxRating) * 100;
            return `<td>${r.rating}/5<div class="compare-bar"><div class="compare-bar-fill" style="width:${pct}%"></div></div></td>`;
          }).join('')}
        </tr>
        <tr>
          <td>Best Time</td>
          ${dests.map(d => `<td>${escapeHtml(d.bestTime || 'N/A')}</td>`).join('')}
        </tr>
        <tr>
          <td>Currency</td>
          ${dests.map(d => `<td>${escapeHtml(d.currency || getCurrencyForDestination(d.name))}</td>`).join('')}
        </tr>
        <tr>
          <td>Language</td>
          ${dests.map(d => `<td>${escapeHtml(d.language || getLanguageForDestination(d.name))}</td>`).join('')}
        </tr>
        <tr>
          <td>Timezone</td>
          ${dests.map(d => `<td>${escapeHtml(d.timezone || 'N/A')}</td>`).join('')}
        </tr>
        <tr>
          <td>Highlights</td>
          ${dests.map(d => `<td>${(d.highlights || []).map(h => escapeHtml(h)).join(', ') || 'N/A'}</td>`).join('')}
        </tr>
        <tr>
          <td>Weather Now</td>
          ${dests.map(d => {
            const w = getMockWeather(d.timezone);
            return `<td>${w.icon} ${w.temp}°C ${w.condition}</td>`;
          }).join('')}
        </tr>
      </tbody>
    </table>
    </div>
  `;
}

function getCurrencyForDestination(name) {
  const all = flattenDestinations(travelData);
  const found = all.find(d => d.name === name || d.name.toLowerCase().includes(name.split(',')[0].trim().toLowerCase()));
  if (found && found.currency) return found.currency;
  const currencyMap = {
    'angkor wat': 'USD', 'taj mahal': 'INR', 'borobudur': 'IDR',
    'petra': 'JOD', 'machu picchu': 'PEN', 'great wall': 'CNY',
    'bora bora': 'XPF', 'copacabana': 'BRL', 'maya bay': 'THB',
    'bondi': 'AUD', 'ngapali': 'MMK', 'navagio': 'EUR',
    'tulum': 'MXN', 'raja ampat': 'IDR'
  };
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(currencyMap)) {
    if (lower.includes(key)) return val;
  }
  return 'N/A';
}

function getLanguageForDestination(name) {
  const all = flattenDestinations(travelData);
  const found = all.find(d => d.name === name || d.name.toLowerCase().includes(name.split(',')[0].trim().toLowerCase()));
  if (found && found.language) return found.language;
  const langMap = {
    'angkor wat': 'Khmer', 'taj mahal': 'Hindi', 'borobudur': 'Indonesian',
    'petra': 'Arabic', 'machu picchu': 'Spanish', 'great wall': 'Mandarin',
    'bora bora': 'French', 'copacabana': 'Portuguese', 'maya bay': 'Thai',
    'bondi': 'English', 'ngapali': 'Burmese', 'navagio': 'Greek',
    'tulum': 'Spanish', 'raja ampat': 'Indonesian'
  };
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(langMap)) {
    if (lower.includes(key)) return val;
  }
  return 'N/A';
}

// ---- CURRENCY CONVERTER ----
const defaultExchangeRates = {
  'USD': 1,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 149.50,
  'AUD': 1.53,
  'BRL': 4.97,
  'NPR': 133.00,
  'INR': 83.12,
  'THB': 35.50,
  'IDR': 15650,
  'CNY': 7.24,
  'KRW': 1320,
  'CHF': 0.88,
  'CAD': 1.36,
  'MXN': 17.15,
  'SGD': 1.34,
  'NZD': 1.63,
  'ZAR': 18.90,
  'MAD': 10.10,
  'KHR': 4100,
  'XPF': 110
};

function getExchangeRates() {
  try {
    const stored = localStorage.getItem('wanderlust_exchange_rates');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.updated && (Date.now() - parsed.updated < 7 * 24 * 60 * 60 * 1000)) {
        return parsed.rates;
      }
    }
  } catch {}
  return defaultExchangeRates;
}

function convertCurrency(amount, from, to) {
  const rates = getExchangeRates();
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

function renderCurrencyConverter() {
  const container = document.getElementById('currencyConverter');
  if (!container) return;
  const rates = getExchangeRates();
  const currencies = Object.keys(rates).sort();
  const options = currencies.map(c => `<option value="${c}">${c}</option>`).join('');
  container.innerHTML = `
    <div class="currency-converter">
      <h3>Currency Converter</h3>
      <div class="currency-row">
        <input type="number" id="currencyAmount" value="100" min="0" oninput="updateCurrencyResult()" />
        <select id="currencyFrom" onchange="updateCurrencyResult()">${options}</select>
      </div>
      <div class="currency-swap-wrap">
        <button class="currency-swap" onclick="swapCurrencies()" title="Swap currencies">⇄</button>
      </div>
      <div class="currency-row">
        <input type="text" id="currencyResultDisplay" readonly value="" style="background:var(--weather-bg);font-weight:600" />
        <select id="currencyTo" onchange="updateCurrencyResult()">${options}</select>
      </div>
      <div class="currency-result" id="currencyResultInfo"></div>
    </div>
  `;
  const fromSelect = document.getElementById('currencyFrom');
  const toSelect = document.getElementById('currencyTo');
  if (fromSelect) fromSelect.value = 'USD';
  if (toSelect) toSelect.value = 'EUR';
  updateCurrencyResult();
}

function updateCurrencyResult() {
  const amount = parseFloat(document.getElementById('currencyAmount')?.value) || 0;
  const from = document.getElementById('currencyFrom')?.value || 'USD';
  const to = document.getElementById('currencyTo')?.value || 'EUR';
  const result = convertCurrency(amount, from, to);
  const display = document.getElementById('currencyResultDisplay');
  const info = document.getElementById('currencyResultInfo');
  if (display) display.value = `${result.toFixed(2)} ${to}`;
  if (info) {
    const rate = convertCurrency(1, from, to);
    info.innerHTML = `<div class="amount">${result.toFixed(2)} ${to}</div><div class="rate">1 ${from} = ${rate.toFixed(4)} ${to}</div>`;
  }
}

function swapCurrencies() {
  const from = document.getElementById('currencyFrom');
  const to = document.getElementById('currencyTo');
  if (from && to) {
    const temp = from.value;
    from.value = to.value;
    to.value = temp;
    updateCurrencyResult();
  }
}

// ---- BUDGET CALCULATOR ----
function calculateBudget() {
  const budget = parseFloat(document.getElementById('budgetAmount')?.value) || 0;
  const days = parseInt(document.getElementById('budgetDays')?.value) || 7;
  const style = document.querySelector('input[name="budgetStyle"]:checked')?.value || 'mid';
  if (budget <= 0 || days <= 0) {
    showToast('Please enter a valid budget and trip duration');
    return;
  }
  const ratios = {
    budget: { flights: 0.30, accommodation: 0.25, food: 0.20, activities: 0.10, transport: 0.10, misc: 0.05 },
    mid: { flights: 0.25, accommodation: 0.30, food: 0.20, activities: 0.15, transport: 0.05, misc: 0.05 },
    luxury: { flights: 0.20, accommodation: 0.35, food: 0.25, activities: 0.10, transport: 0.05, misc: 0.05 }
  };
  const r = ratios[style] || ratios.mid;
  const breakdown = {
    flights: Math.round(budget * r.flights),
    accommodation: Math.round(budget * r.accommodation),
    food: Math.round(budget * r.food),
    activities: Math.round(budget * r.activities),
    transport: Math.round(budget * r.transport),
    misc: Math.round(budget * r.misc)
  };
  const perDay = Math.round(budget / days);
  const results = document.getElementById('budgetResults');
  if (!results) return;
  results.classList.add('show');
  results.innerHTML = `
    <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:var(--text-primary);margin-bottom:0.5rem">Budget Breakdown</h3>
    <p style="color:var(--text-secondary);margin-bottom:1.5rem">Total: <strong>$${budget.toLocaleString()}</strong> for <strong>${days} days</strong> — <strong>$${perDay.toLocaleString()}/day</strong></p>
    <div class="budget-breakdown">
      ${Object.entries(breakdown).map(([key, val]) => `
        <div class="budget-item">
          <span class="budget-item-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
          <span class="budget-item-amount">$${val.toLocaleString()}</span>
        </div>
      `).join('')}
    </div>
    <div class="budget-bar-container">
      ${Object.entries(breakdown).map(([key, val]) => `
        <div class="budget-bar-item">
          <div class="budget-bar-label">
            <span>${key.charAt(0).toUpperCase() + key.slice(1)}</span>
            <span>$${val.toLocaleString()} (${Math.round(val / budget * 100)}%)</span>
          </div>
          <div class="budget-bar">
            <div class="budget-bar-fill" style="width:${val / budget * 100}%"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ---- PACKING LIST ----
// Moved to packing.js with full editable, shareable, persistent feature set
// (packingTemplates, generatePackingList, renderPackingList, updatePackingProgress, togglePackingCategory)

// ---- TRAVEL CHECKLIST ----
const checklistTemplates = {
  '30 days before': ['Check passport validity (6+ months)', 'Research visa requirements', 'Book flights', 'Book accommodation', 'Purchase travel insurance', 'Schedule vaccinations'],
  '14 days before': ['Apply for visa (if needed)', 'Notify bank of travel', 'Arrange pet/house sitting', 'Check weather forecast', 'Start packing list', 'Download offline maps'],
  '7 days before': ['Confirm all bookings', 'Check in online for flights', 'Exchange currency', 'Print important documents', 'Charge all electronics', 'Buy travel-sized toiletries'],
  '1 day before': ['Final packing check', 'Confirm flight status', 'Set up email auto-reply', 'Water plants', 'Take out trash', 'Charge power bank', 'Download entertainment']
};

function renderChecklist(booking) {
  const container = document.getElementById('checklistContainer');
  if (!container) return;
  const phases = Object.entries(checklistTemplates);
  container.innerHTML = `
    <div class="checklist-timeline">
      ${phases.map(([phase, tasks]) => `
        <div class="checklist-phase" id="phase_${phase.replace(/\s+/g, '_')}">
          <div class="checklist-phase-title">${phase}</div>
          ${tasks.map((task, i) => `
            <div class="checklist-task">
              <input type="checkbox" id="task_${phase.replace(/\s+/g, '_')}_${i}" onchange="updateChecklistProgress()" />
              <label for="task_${phase.replace(/\s+/g, '_')}_${i}">${escapeHtml(task)}</label>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

function updateChecklistProgress() {
  const checkboxes = document.querySelectorAll('.checklist-task input[type="checkbox"]');
  const total = checkboxes.length;
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  const phases = document.querySelectorAll('.checklist-phase');
  phases.forEach(phase => {
    const phaseCheckboxes = phase.querySelectorAll('input[type="checkbox"]');
    const phaseTotal = phaseCheckboxes.length;
    const phaseChecked = Array.from(phaseCheckboxes).filter(cb => cb.checked).length;
    phase.classList.toggle('completed', phaseChecked === phaseTotal);
  });
}

function loadBookingChecklist() {
  const select = document.getElementById('checklistBookingSelect');
  if (!select) return;
  const bookings = JSON.parse(localStorage.getItem('wanderlust_bookings') || '[]');
  select.innerHTML = `<option value="">Select a booking...</option>` + bookings.map((b, i) =>
    `<option value="${i}">${escapeHtml(b.destination)} — ${escapeHtml(b.checkin || 'No date')}</option>`
  ).join('');
}

function selectBookingChecklist() {
  const select = document.getElementById('checklistBookingSelect');
  if (!select || !select.value) return;
  const bookings = JSON.parse(localStorage.getItem('wanderlust_bookings') || '[]');
  const booking = bookings[parseInt(select.value)];
  if (booking) renderChecklist(booking);
}

// ---- TRAVEL JOURNAL ----
function getJournalEntries() {
  try {
    return JSON.parse(localStorage.getItem('wanderlust_journal') || '[]');
  } catch { return []; }
}

function saveJournalEntries(entries) {
  localStorage.setItem('wanderlust_journal', JSON.stringify(entries));
}

function addJournalEntry() {
  const title = document.getElementById('journalTitle')?.value?.trim();
  const destination = document.getElementById('journalDestination')?.value?.trim();
  const tripType = document.getElementById('journalTripType')?.value?.trim();
  const date = document.getElementById('journalDate')?.value;
  const text = document.getElementById('journalText')?.value?.trim();
  if (!title || !text) {
    showToast('Please enter a title and your thoughts');
    return;
  }
  const entries = getJournalEntries();
  entries.unshift({
    id: Date.now(),
    title,
    destination: destination || '',
    tripType: tripType || '',
    date: date || new Date().toISOString().split('T')[0],
    text,
    createdAt: new Date().toISOString()
  });
  saveJournalEntries(entries);
  document.getElementById('journalTitle').value = '';
  document.getElementById('journalDestination').value = '';
  document.getElementById('journalTripType').value = '';
  document.getElementById('journalDate').value = '';
  document.getElementById('journalText').value = '';
  renderJournalEntries();
  showToast('Journal entry saved!');
}

function renderJournalEntries() {
  const container = document.getElementById('journalEntries');
  if (!container) return;
  const entries = getJournalEntries();
  if (entries.length === 0) {
    container.innerHTML = `
      <div class="journal-empty">
        <h2>No journal entries yet</h2>
        <p>Start documenting your travel experiences!</p>
      </div>
    `;
    return;
  }
  const tripTypeLabels = { solo: 'Solo', couple: 'Couple', family: 'Family', friends: 'Friends', business: 'Business', adventure: 'Adventure' };
  container.innerHTML = entries.map(entry => `
    <div class="journal-entry">
      <div class="journal-entry-header">
        <span class="journal-entry-title">${escapeHtml(entry.title)}</span>
        <span class="journal-entry-date">${formatJournalDate(entry.date)}</span>
      </div>
      ${entry.tripType ? `<span class="journal-entry-destination">${escapeHtml(tripTypeLabels[entry.tripType] || entry.tripType)}</span>` : ''}
      ${entry.destination ? `<span class="journal-entry-destination">${escapeHtml(entry.destination)}</span>` : ''}
      <div class="journal-entry-text">${escapeHtml(entry.text)}</div>
      <div class="journal-entry-actions">
        <button onclick="editJournalEntry(${entry.id})">Edit</button>
        <button onclick="exportJournalEntry(${entry.id})">Export</button>
        <button class="delete-btn" onclick="deleteJournalEntry(${entry.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function formatJournalDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}

function deleteJournalEntry(id) {
  let entries = getJournalEntries();
  entries = entries.filter(e => e.id !== id);
  saveJournalEntries(entries);
  renderJournalEntries();
  showToast('Journal entry deleted');
}

function editJournalEntry(id) {
  const entries = getJournalEntries();
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  document.getElementById('journalTitle').value = entry.title;
  document.getElementById('journalDestination').value = entry.destination || '';
  document.getElementById('journalTripType').value = entry.tripType || '';
  document.getElementById('journalDate').value = entry.date;
  document.getElementById('journalText').value = entry.text;
  entries.splice(entries.indexOf(entry), 1);
  saveJournalEntries(entries);
  renderJournalEntries();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exportJournalEntry(id) {
  const entries = getJournalEntries();
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  const text = `${entry.title}\n${entry.destination ? `Destination: ${entry.destination}\n` : ''}Date: ${entry.date}\n\n${entry.text}`;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Journal entry copied to clipboard');
  }).catch(() => {
    showToast('Could not copy to clipboard');
  });
}

// ---- INITIALIZATION ----
function initNewFeatures() {
  initDarkMode();
  initSearchHistory();
  renderRecentlyViewed();
  renderCurrencyConverter();
  if (document.getElementById('compareDest1')) renderComparePage();
  if (document.getElementById('checklistBookingSelect')) loadBookingChecklist();
  if (document.getElementById('journalEntries')) {
    renderJournalEntries();
    populateJournalDestinations();
  }
  if (document.getElementById('packingDestination')) populatePackingDestinations();
}

function populatePackingDestinations() {
  const select = document.getElementById('packingDestination');
  if (!select) return;
  const all = flattenDestinations(travelData);
  select.innerHTML = `<option value="">Select destination...</option>` + all.map(d =>
    `<option value="${escapeHtml(d.name)}">${escapeHtml(d.name)}</option>`
  ).join('');
}

function populateJournalDestinations() {
  const select = document.getElementById('journalDestination');
  if (!select) return;
  const all = flattenDestinations(travelData);
  select.innerHTML = `<option value="">Select a destination...</option>` + all.map(d =>
    `<option value="${escapeHtml(d.name)}">${escapeHtml(d.name)}</option>`
  ).join('');
}
