let allBookings = [];
let itineraryData = [];
let currentItineraryDestination = null;
let currentDay = 1;
let pendingDestination = null;
let dataLoaded = false;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const destParam = urlParams.get('destination');
  if (destParam) {
    pendingDestination = decodeURIComponent(destParam);
  }

  console.log('Loading booking data...');
  
  Promise.all([
    fetch('travel_recommendation_api.json').then(r => {
      if (!r.ok) throw new Error('Failed to load API');
      return r.json();
    }),
    fetch('itineraries.json').then(r => {
      if (!r.ok) throw new Error('Failed to load itineraries');
      return r.json();
    })
  ]).then(([apiData, itineraryJson]) => {
    console.log('Data loaded successfully');
    allBookings = flattenBookings(apiData);
    itineraryData = itineraryJson.itineraries || [];
    dataLoaded = true;
    console.log(`Loaded ${allBookings.length} destinations`);
    
    renderBookings();
    initBookingSearch();
    initNewsletter();

    if (pendingDestination) {
      handlePendingDestination();
    }
  }).catch(err => {
    console.error('Failed to load data:', err);
    const grid = document.getElementById('bookingsGrid');
    if (grid) {
      grid.innerHTML = '<div class="bookings-empty"><h3>Failed to load destinations</h3><p>Please refresh the page</p></div>';
    }
  });
});

function handlePendingDestination() {
  setTimeout(() => {
    const cards = document.querySelectorAll('.result-card');
    cards.forEach(card => {
      const title = card.querySelector('h3');
      if (title && title.textContent === pendingDestination) {
        card.classList.add('result-card-highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => card.classList.remove('result-card-highlight'), 5000);
      }
    });
  }, 100);
}

function flattenBookings(data) {
  const bookings = [];
  data.countries.forEach(country => {
    country.cities.forEach(city => {
      const it = itineraryData.find(i => i.destination === city.name);
      bookings.push({
        ...city,
        category: 'city',
        country: country.name,
        hasItinerary: !!it,
        days: it ? it.days : 3,
        typeLabel: country.name
      });
    });
  });
  data.temples.forEach(temple => {
    bookings.push({
      ...temple,
      category: 'temple',
      country: temple.name.split(',').pop()?.trim() || 'Historic Site',
      hasItinerary: false,
      days: 1,
      typeLabel: 'Landmark'
    });
  });
  data.beaches.forEach(beach => {
    const it = itineraryData.find(i => i.destination === beach.name);
    bookings.push({
      ...beach,
      category: 'beach',
      country: beach.name.split(',').pop()?.trim() || 'Beach',
      hasItinerary: !!it,
      days: it ? it.days : 1,
      typeLabel: 'Beach'
    });
  });
  return bookings;
}

function renderBookings(filter = '') {
  const grid = document.getElementById('bookingsGrid');
  const title = document.getElementById('resultsTitle');
  const count = document.getElementById('resultsCount');
  if (!grid) return;

  if (!dataLoaded || allBookings.length === 0) {
    grid.innerHTML = `
      <div class="bookings-empty">
        <h3>Loading destinations...</h3>
        <p>Please wait while we fetch travel destinations</p>
      </div>
    `;
    return;
  }

  if (filter) {
    title.textContent = 'Search results';
    count.textContent = `${allBookings.length} recommendations found`;
  } else {
    title.textContent = 'All Destinations';
    count.textContent = `${allBookings.length} destinations available`;
  }

  let filtered = allBookings;
  if (filter) {
    const searchTerm = filter.toLowerCase();
    filtered = filtered.filter(b => 
      b.name.toLowerCase().includes(searchTerm) ||
      (b.description && b.description.toLowerCase().includes(searchTerm)) ||
      (b.country && b.country.toLowerCase().includes(searchTerm)) ||
      (b.typeLabel && b.typeLabel.toLowerCase().includes(searchTerm))
    );
    count.textContent = `${filtered.length} recommendation${filtered.length !== 1 ? 's' : ''} found`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="bookings-empty">
        <h3>No destinations found</h3>
        <p>Try adjusting your search terms</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((dest, index) => {
    const reviews = reviewsData[dest.name] || { rating: 4.5, reviews: Math.floor(Math.random() * 500 + 100) };
    const rating = Math.round(reviews.rating * 10) / 10;
    const stars = '★'.repeat(Math.floor(reviews.rating));
    const weather = getMockWeather(dest.timezone);
    const isFav = getFavorites().includes(dest.name);
    
    const coords = destCoords[dest.name];
    const mapHtml = coords ? getMapPreviewHTML(dest.name, coords) : '';
    
    const escapedName = escapeHtml(dest.name);
    const escapedDesc = escapeHtml(dest.description || '');
    
    return `
      <div class="result-card" style="animation-delay: ${index * 0.08}s">
        <img class="result-card-img" src="${dest.imageUrl}" alt="${escapedName}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600'" />
        <div class="result-card-body">
          <span class="result-tag">${dest.typeLabel || 'Destination'}</span>
          <h3>${escapedName}</h3>
          <p>${escapedDesc}</p>
          <div class="result-card-footer">
            <div class="result-stars" title="${rating}/5 (${reviews.reviews.toLocaleString()} reviews)">
              ${stars}
              <span style="font-size:0.7rem;color:var(--muted);margin-left:3px">${rating}</span>
            </div>
            <div class="result-weather" title="Current weather">
              <span class="weather-icon">${weather.icon}</span>
              <span>${weather.temp}°C</span>
            </div>
          </div>
          ${dest.timezone ? `
            <div class="result-time">
              🕐 Local time: <span class="clock" data-timezone="${escapeHtml(dest.timezone)}">${getLocalTime(dest.timezone)}</span>
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
                    onclick="shareDestination('${escapedName.replace(/'/g, "\\'")}', '${escapedDesc.replace(/'/g, "\\'")}')"
                    title="Share this destination">
              ↗ Share
            </button>
            ${dest.hasItinerary ? `
              <button class="result-btn result-btn-itinerary"
                      onclick="openItinerary('${escapedName.replace(/'/g, "\\'")}', event)"
                      title="View itinerary">
                📋 Itinerary
              </button>
            ` : ''}
            <button class="result-btn result-btn-book"
                    onclick="openBookingModalBookings('${escapedName.replace(/'/g, "\\'")}', '${escapeHtml(dest.imageUrl).replace(/'/g, "\\'")}', '${escapeHtml(dest.typeLabel || 'Destination').replace(/'/g, "\\'")}', event)">
              Book Now
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.clockInterval) clearInterval(window.clockInterval);
  window.clockInterval = setInterval(updateClocks, 1000);
}

let bookingAutocompleteIndex = -1;
let bookingAutocompleteDebounceTimer = null;

function initBookingSearch() {
  const input = document.getElementById('bookingSearchInput');
  const dropdown = document.getElementById('bookingAutocomplete');
  if (!input || !dropdown) return;
  
  if (!dataLoaded) {
    const checkDataLoaded = setInterval(() => {
      if (dataLoaded) {
        clearInterval(checkDataLoaded);
        setupBookingAutocomplete(input, dropdown);
      }
    }, 100);
    setTimeout(() => clearInterval(checkDataLoaded), 5000);
  } else {
    setupBookingAutocomplete(input, dropdown);
  }
}

function setupBookingAutocomplete(input, dropdown) {
  const debouncedSearch = debounce((val) => {
    const query = val.trim().toLowerCase();
    if (query.length < 1) { 
      hideBookingAutocomplete(); 
      renderBookings('');
      return; 
    }
    showBookingAutocompleteSuggestions(query);
  }, 150);

  input.addEventListener('input', (e) => {
    bookingAutocompleteDebounceTimer = debouncedSearch(e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.autocomplete-item:not([hidden])');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        bookingAutocompleteIndex = Math.min(bookingAutocompleteIndex + 1, items.length - 1);
        updateBookingAutocompleteSelection(items);
        break;
      case 'ArrowUp':
        e.preventDefault();
        bookingAutocompleteIndex = Math.max(bookingAutocompleteIndex - 1, -1);
        updateBookingAutocompleteSelection(items);
        break;
      case 'Enter':
        e.preventDefault();
        if (bookingAutocompleteIndex >= 0 && items[bookingAutocompleteIndex]) {
          items[bookingAutocompleteIndex].click();
        } else {
          handleBookingSearch();
        }
        break;
      case 'Escape':
        hideBookingAutocomplete();
        break;
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrap')) {
      hideBookingAutocomplete();
    }
  });
}

function showBookingAutocompleteSuggestions(query) {
  const dropdown = document.getElementById('bookingAutocomplete');
  const input = document.getElementById('bookingSearchInput');
  if (!dropdown || !input) return;

  const matches = allBookings.filter(b => 
    b.name.toLowerCase().includes(query) ||
    (b.description && b.description.toLowerCase().includes(query)) ||
    (b.country && b.country.toLowerCase().includes(query))
  ).slice(0, 8);

  if (matches.length === 0) {
    hideBookingAutocomplete();
    return;
  }

  dropdown.innerHTML = matches.map((m, i) => `
    <div class="autocomplete-item" id="booking-autocomplete-item-${i}" onclick="selectBookingDestination('${escapeHtml(m.name).replace(/'/g, "\\'")}')" role="option" aria-selected="false">
      <img class="autocomplete-img" src="${m.imageUrl}" alt="${escapeHtml(m.name)}" onerror="this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=100'" />
      <div class="autocomplete-text">
        <div class="autocomplete-name">${escapeHtml(m.name)}</div>
        <div class="autocomplete-type">${escapeHtml(m.typeLabel || 'Destination')}</div>
      </div>
    </div>
  `).join('');

  dropdown.classList.add('show');
  input.setAttribute('aria-expanded', 'true');
  bookingAutocompleteIndex = -1;
}

function hideBookingAutocomplete() {
  const dropdown = document.getElementById('bookingAutocomplete');
  const input = document.getElementById('bookingSearchInput');
  if (dropdown) dropdown.classList.remove('show');
  if (input) input.setAttribute('aria-expanded', 'false');
  bookingAutocompleteIndex = -1;
}

function updateBookingAutocompleteSelection(items) {
  items.forEach((item, i) => {
    if (i === bookingAutocompleteIndex) {
      item.classList.add('selected');
      item.setAttribute('aria-selected', 'true');
    } else {
      item.classList.remove('selected');
      item.setAttribute('aria-selected', 'false');
    }
  });
}

function selectBookingDestination(destName) {
  hideBookingAutocomplete();
  const input = document.getElementById('bookingSearchInput');
  if (input) input.value = destName;
  renderBookings(destName);
}

function handleBookingSearch() {
  const input = document.getElementById('bookingSearchInput');
  if (input) {
    renderBookings(input.value.trim());
  }
  hideBookingAutocomplete();
}

function openItinerary(destName, event) {
  if (event) event.stopPropagation();
  const it = itineraryData.find(i => i.destination === destName);
  if (!it) {
    showToast('Itinerary not available for this destination');
    return;
  }
  currentItineraryDestination = it;
  currentDay = 1;

  const modal = document.getElementById('itineraryModal');
  const content = document.getElementById('itineraryContent');

  content.innerHTML = `
    <div class="itinerary-hero">
      <img src="${it.highlights[0] ? getImageForDestination(it.destination) : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'}" alt="${it.destination}" onerror="this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'" />
      <div class="itinerary-hero-overlay"></div>
      <div class="itinerary-hero-content">
        <span class="itinerary-type">${it.days} Day Itinerary</span>
        <h2 class="itinerary-title" id="itineraryTitle">${it.destination}</h2>
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
          <button class="itinerary-day-tab ${i + 1 === 1 ? 'active' : ''}" onclick="switchItineraryDay(${i + 1})">
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
        <button class="booking-btn booking-btn-primary" onclick="closeItineraryModal(); setTimeout(() => openBookingModalBookings('${escapeHtml(it.destination).replace(/'/g, "\\'")}', null), 300)">
          Book This Trip
        </button>
      </div>
    </div>
  `;

  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function switchItineraryDay(day) {
  currentDay = day;
  document.querySelectorAll('.itinerary-day-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i + 1 === day);
  });
  document.querySelectorAll('.itinerary-day-content').forEach((content, i) => {
    content.classList.toggle('active', i + 1 === day);
  });
}

function closeItineraryModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById('itineraryModal') || document.getElementById('searchItineraryModal');
  if (modal) {
    modal.setAttribute('hidden', '');
  }
  document.body.style.overflow = '';
}

function getImageForDestination(destName) {
  const dest = allBookings.find(d => d.name === destName);
  return dest ? dest.imageUrl : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';
}

function openBookingModalBookings(destName, imageUrl, type, event) {
  if (event) event.stopPropagation();
  
  const modal = document.getElementById('bookingModal');
  const content = document.getElementById('bookingModalContent');
  const safeName = escapeHtml(destName);
  const safeImg = imageUrl ? escapeHtml(imageUrl) : '';

  content.innerHTML = `
    <div class="modal-header">
      <div>
        <h2 class="modal-title" id="modalTitle">Book Your Journey</h2>
        <p class="modal-dest">${safeName}</p>
      </div>
      <button class="modal-close" onclick="closeBookingModalBookings()" aria-label="Close modal">✕</button>
    </div>
    <div class="modal-body">
      ${safeImg ? `<img class="modal-thumb" src="${safeImg}" alt="${safeName}" onerror="this.style.display='none'" />` : ''}
      <form id="bookingForm" onsubmit="handleBookingSubmitBookings(event, '${safeName.replace(/'/g, "\\'")}')">
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
            <label class="modal-label" for="bookingNotes">Special Requests</label>
            <textarea class="modal-textarea" id="bookingNotes" placeholder="Any special requests or requirements..."></textarea>
          </div>
        </div>
        <button type="submit" class="modal-submit">Confirm Booking</button>
      </form>
    </div>
  `;

  modal.removeAttribute('hidden');
  
  const today = new Date().toISOString().split('T')[0];
  const checkin = document.getElementById('bookingCheckin');
  const checkout = document.getElementById('bookingCheckout');
  if (checkin) checkin.min = today;
  if (checkout) checkout.min = today;
  if (checkin) {
    checkin.addEventListener('change', () => {
      if (checkout) {
        checkout.min = checkin.value;
        if (checkout.value && checkout.value < checkin.value) {
          checkout.value = '';
        }
      }
    });
  }
}

function closeBookingModalBookings(event) {
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById('bookingModal');
  modal.setAttribute('hidden', '');
}

function handleBookingSubmitBookings(event, destName) {
  event.preventDefault();
  const name = document.getElementById('bookingName').value;
  const email = document.getElementById('bookingEmail').value;
  const checkin = document.getElementById('bookingCheckin').value;
  const checkout = document.getElementById('bookingCheckout').value;
  const travelers = document.getElementById('bookingTravelers').value;
  const tripType = document.getElementById('bookingType').value;
  const notes = document.getElementById('bookingNotes').value;

  const bookings = JSON.parse(localStorage.getItem('wanderlust_bookings') || '[]');
  bookings.push({ 
    destination: destName, 
    name, 
    email, 
    checkin,
    checkout,
    travelers,
    tripType,
    notes,
    createdAt: new Date().toISOString() 
  });
  localStorage.setItem('wanderlust_bookings', JSON.stringify(bookings));

  showToast(`Booking confirmed for ${destName}! We'll contact you at ${email}`);
  closeBookingModalBookings();
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function initNewsletter() {
  const footerCopy = document.querySelector('.footer-copy');
  if (footerCopy) footerCopy.textContent = `© ${new Date().getFullYear()} Wanderlust Travel. All rights reserved.`;
}

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
  setTimeout(() => { if (success) success.classList.remove('show'); }, 6000);
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeItineraryModal();
    closeBookingModalBookings();
  }
});
