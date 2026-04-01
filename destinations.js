let allDestinations = [];
let currentDestFilter = 'all';
let currentDestSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  fetch('travel_recommendation_api.json')
    .then(res => res.json())
    .then(data => {
      allDestinations = flattenDestinations(data);
      renderDestinations();
      updateStats();
    });

  initSearch();
  initFilters();
  initNewsletter();
});

function flattenDestinations(data) {
  const destinations = [];
  
  data.countries.forEach(country => {
    country.cities.forEach(city => {
      destinations.push({
        ...city,
        category: 'city',
        country: country.name,
        type: country.name
      });
    });
  });
  
  data.temples.forEach(temple => {
    destinations.push({
      ...temple,
      category: 'temple',
      country: temple.name.split(',').pop()?.trim() || 'Historic Site'
    });
  });
  
  data.beaches.forEach(beach => {
    destinations.push({
      ...beach,
      category: 'beach',
      country: beach.name.split(',').pop()?.trim() || 'Beach'
    });
  });
  
  return destinations;
}

function initSearch() {
  const input = document.getElementById('destSearchInput');
  if (input) {
    input.addEventListener('input', debounce((e) => {
      currentDestSearch = e.target.value.toLowerCase().trim();
      renderDestinations();
    }, 200));
  }
}

function initFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentDestFilter = tab.dataset.filter;
      renderDestinations();
    });
  });
}

function renderDestinations() {
  const grid = document.getElementById('destinationsGrid');
  if (!grid) return;

  let filtered = allDestinations;

  if (currentDestFilter !== 'all') {
    filtered = filtered.filter(d => d.category === currentDestFilter);
  }

  if (currentDestSearch) {
    filtered = filtered.filter(d => 
      d.name.toLowerCase().includes(currentDestSearch) ||
      d.description.toLowerCase().includes(currentDestSearch) ||
      d.country.toLowerCase().includes(currentDestSearch)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="destinations-empty">
        <h3>No destinations found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((dest, i) => {
    const reviews = reviewsData[dest.name] || { rating: 4.5, reviews: 100 };
    const stars = '★'.repeat(Math.floor(reviews.rating)) + (reviews.rating % 1 >= 0.5 ? '½' : '');
    const catLabel = dest.category === 'city' ? dest.country : dest.category === 'beach' ? 'Beach' : 'Landmark';
    const catIcon = dest.category === 'city' ? '🏙️' : dest.category === 'beach' ? '🏖️' : '🏛️';
    
    return `
      <div class="dest-card" onclick="openDetailOverlay('${escapeHtml(dest.name).replace(/'/g, "\\'")}')" role="button" tabindex="0" aria-label="View details for ${escapeHtml(dest.name)}">
        <img class="dest-card-img" src="${dest.imageUrl}" alt="${escapeHtml(dest.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600'" />
        <div class="dest-card-body">
          <div class="dest-card-type">${catIcon} ${escapeHtml(catLabel)}</div>
          <h3>${escapeHtml(dest.name)}</h3>
          <p>${escapeHtml(dest.description)}</p>
          <div class="dest-card-footer">
            <div class="dest-card-stars">
              ${stars} <span>${reviews.rating} (${reviews.reviews.toLocaleString()})</span>
            </div>
            <div class="dest-card-view">View →</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.dest-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

function updateStats() {
  const countEl = document.getElementById('destCount');
  if (countEl) {
    countEl.textContent = allDestinations.length;
  }
}

function openDetailOverlay(destName) {
  const dest = allDestinations.find(d => d.name === destName);
  if (!dest) return;

  const overlay = document.getElementById('detailOverlay');
  const content = document.getElementById('detailContent');
  const reviews = reviewsData[dest.name] || { rating: 4.5, reviews: 100 };
  const weather = getMockWeather(dest.timezone);
  const stars = renderStars(reviews.rating);
  const isFav = getFavorites().includes(dest.name);
  const catLabel = dest.category === 'city' ? dest.country : dest.category === 'beach' ? 'Beach' : 'Landmark';
  const highlights = dest.highlights || ['Cultural Heritage', 'Local Cuisine', 'Scenic Views'];

  content.innerHTML = `
    <div class="detail-hero">
      <img src="${dest.imageUrl}" alt="${escapeHtml(dest.name)}" onerror="this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200'" />
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-content">
        <span class="detail-type">${escapeHtml(catLabel)}</span>
        <h2 class="detail-title" id="detailTitle">${escapeHtml(dest.name)}</h2>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-meta">
        <div class="detail-meta-item">
          <span>⭐</span>
          <span><strong>${reviews.rating}</strong> / 5</span>
        </div>
        <div class="detail-meta-item">
          <span>📝</span>
          <span>${reviews.reviews.toLocaleString()} reviews</span>
        </div>
        ${dest.bestTime ? `
          <div class="detail-meta-item">
            <span>🗓️</span>
            <span>Best: ${escapeHtml(dest.bestTime)}</span>
          </div>
        ` : ''}
        ${dest.currency ? `
          <div class="detail-meta-item">
            <span>💰</span>
            <span>${escapeHtml(dest.currency)}</span>
          </div>
        ` : ''}
      </div>

      <div class="detail-rating">
        <div class="detail-rating-stars">${stars}</div>
        <span class="detail-rating-score">${reviews.rating}</span>
        <span class="detail-rating-count">(${reviews.reviews.toLocaleString()} reviews)</span>
      </div>

      <p class="detail-description">${escapeHtml(dest.description)}</p>

      <div class="detail-highlights">
        <h4>Top Attractions</h4>
        <div class="detail-highlights-list">
          ${highlights.map(h => `<span class="detail-highlight-tag">• ${escapeHtml(h)}</span>`).join('')}
        </div>
      </div>

      <div class="detail-infographics">
        <div class="detail-infographic">
          <div class="detail-infographic-icon">🌡️</div>
          <div class="detail-infographic-value">${weather.temp}°C</div>
          <div class="detail-infographic-label">Current Temp</div>
        </div>
        <div class="detail-infographic">
          <div class="detail-infographic-icon">${weather.icon}</div>
          <div class="detail-infographic-value">${weather.condition}</div>
          <div class="detail-infographic-label">Weather</div>
        </div>
        ${dest.timezone ? `
          <div class="detail-infographic">
            <div class="detail-infographic-icon">🕐</div>
            <div class="detail-infographic-value"><span class="clock" data-timezone="${escapeHtml(dest.timezone)}">${getLocalTime(dest.timezone)}</span></div>
            <div class="detail-infographic-label">Local Time</div>
          </div>
        ` : ''}
        <div class="detail-infographic">
          <div class="detail-infographic-icon">⭐</div>
          <div class="detail-infographic-value">${reviews.rating}</div>
          <div class="detail-infographic-label">User Rating</div>
        </div>
      </div>

      ${dest.timezone ? `
        <div class="detail-weather">
          <span class="detail-weather-icon">${weather.icon}</span>
          <div class="detail-weather-info">
            <h4>${weather.condition} ${weather.temp}°C</h4>
            <p>Current conditions in ${escapeHtml(dest.name)}</p>
          </div>
          <div class="detail-weather-time">
            <div class="time"><span class="clock" data-timezone="${escapeHtml(dest.timezone)}">${getLocalTime(dest.timezone)}</span></div>
            <div class="label">Local Time</div>
          </div>
        </div>
      ` : ''}

      <div class="detail-actions">
        <button class="detail-btn detail-btn-save ${isFav ? 'saved' : ''}" onclick="toggleDetailFavorite('${escapeHtml(dest.name).replace(/'/g, "\\'")}', this, event)">
          ${isFav ? '♥ Saved' : '♡ Save'}
        </button>
        <button class="detail-btn detail-btn-secondary" onclick="shareDetailDestination('${escapeHtml(dest.name).replace(/'/g, "\\'")}', '${escapeHtml(dest.description).replace(/'/g, "\\'")}')">
          ↗ Share
        </button>
        <button class="detail-btn detail-btn-secondary" id="detailItineraryBtn" onclick="viewDetailItinerary('${escapeHtml(dest.name).replace(/'/g, "\\'")}', event)">
          📋 Itinerary
        </button>
        ${destCoords[dest.name] ? `
        <a href="https://www.google.com/maps/search/?api=1&query=${destCoords[dest.name][0]},${destCoords[dest.name][1]}" target="_blank" rel="noopener noreferrer" class="detail-btn detail-btn-secondary" style="text-decoration:none">
          🗺️ View on Map
        </a>
        ` : ''}
        <button class="detail-btn detail-btn-primary" onclick="bookDetailDestination('${escapeHtml(dest.name).replace(/'/g, "\\'")}', '${escapeHtml(dest.imageUrl).replace(/'/g, "\\'")}', '${escapeHtml(catLabel).replace(/'/g, "\\'")}')">
          Book Now
        </button>
      </div>
    </div>
  `;

  overlay.removeAttribute('hidden');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'detailTitle');
  document.body.style.overflow = 'hidden';

  if (window.clockInterval) clearInterval(window.clockInterval);
  window.clockInterval = setInterval(updateClocks, 1000);

  setTimeout(() => {
    overlay.querySelector('.detail-close').focus();
  }, 100);
}

function closeDetailOverlay(event) {
  if (event && event.target !== event.currentTarget) return;
  const overlay = document.getElementById('detailOverlay');
  overlay.setAttribute('hidden', '');
  overlay.removeAttribute('role');
  overlay.removeAttribute('aria-modal');
  document.body.style.overflow = '';
  if (window.clockInterval) {
    clearInterval(window.clockInterval);
    window.clockInterval = null;
  }
}

function toggleDetailFavorite(name, btn, event) {
  event.stopPropagation();
  let favs = getFavorites();
  const idx = favs.indexOf(name);
  if (idx > -1) {
    favs.splice(idx, 1);
    btn.classList.remove('saved');
    btn.innerHTML = '♡ Save';
    showToast(`Removed "${name}" from favorites`);
  } else {
    favs.push(name);
    btn.classList.add('saved');
    btn.innerHTML = '♥ Saved';
    showToast(`Added "${name}" to favorites`);
  }
  saveFavorites(favs);
}

function shareDetailDestination(name, description) {
  shareDestination(name, description);
}

function bookDetailDestination(name, imageUrl, type) {
  closeDetailOverlay();
  openBookingModalInline(name, imageUrl, type);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

document.addEventListener('keydown', (e) => {
  const overlay = document.getElementById('detailOverlay');
  if (!overlay.hasAttribute('hidden') && e.key === 'Escape') {
    closeDetailOverlay();
  }
  const itineraryModal = document.getElementById('itineraryModal');
  if (!itineraryModal.hasAttribute('hidden') && e.key === 'Escape') {
    closeItineraryModal();
  }
  const bookingModal = document.getElementById('bookingModal');
  if (!bookingModal.hasAttribute('hidden') && e.key === 'Escape') {
    closeBookingModal();
  }
});

let detailItineraryData = [];

async function viewDetailItinerary(destName, event) {
  if (event) event.stopPropagation();
  
  if (detailItineraryData.length === 0) {
    try {
      const response = await fetch('itineraries.json');
      const data = await response.json();
      detailItineraryData = data.itineraries || [];
    } catch (e) {
      console.error('Failed to load itinerary data:', e);
    }
  }
  
  const it = detailItineraryData.find(i => i.destination === destName);
  if (!it) {
    showToast('Itinerary not available for this destination');
    return;
  }
  
  closeDetailOverlay();
  showItineraryModal(it);
}

function showItineraryModal(it) {
  const modal = document.getElementById('itineraryModal');
  const content = document.getElementById('itineraryModalContent');
  
  content.innerHTML = `
    <div class="detail-hero">
      <img src="${it.imageUrl || getDestinationImage(it.destination)}" alt="${escapeHtml(it.destination)}" onerror="this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'" />
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-content">
        <span class="detail-type">${it.days} Day Itinerary</span>
        <h2 class="detail-title">${escapeHtml(it.destination)}</h2>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-header">
        <div style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.4rem 0.8rem;background:rgba(201,168,76,0.1);border-radius:50px;font-size:0.8rem;color:var(--warm);margin-bottom:0.75rem">
          <span>📅</span> ${it.days} Days
        </div>
        <p class="detail-description">${escapeHtml(it.description)}</p>
      </div>
      <div style="display:flex;gap:0.5rem;margin-bottom:1.5rem;overflow-x:auto;padding-bottom:0.5rem" id="itineraryDaysNav">
        ${it.daysDetail.map((d, i) => `
          <button class="filter-tab ${i + 1 === 1 ? 'active' : ''}" onclick="switchDetailItineraryDay(${i + 1}, ${it.days})" style="white-space:nowrap">
            Day ${d.day}
          </button>
        `).join('')}
      </div>
      ${it.daysDetail.map((d, i) => `
        <div class="itinerary-day-section ${i + 1 === 1 ? 'active' : ''}" data-day="${i + 1}">
          <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.2rem;color:var(--ink);margin-bottom:1rem">${escapeHtml(d.title)}</h3>
          <ul style="list-style:none">
            ${d.activities.map(a => `
              <li style="display:flex;gap:1rem;padding:0.75rem 0;border-bottom:1px solid rgba(26,22,18,0.06)">
                <div style="flex-shrink:0;width:70px;font-size:0.75rem;font-weight:600;color:var(--gold)">${escapeHtml(a.time)}</div>
                <div style="flex:1">
                  <div style="font-weight:600;font-size:0.9rem;color:var(--ink);margin-bottom:0.2rem">${escapeHtml(a.place)}</div>
                  <div style="font-size:0.8rem;color:var(--muted)">${escapeHtml(a.description)}</div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      `).join('')}
      ${it.tips ? `
        <div style="margin-top:1.5rem;padding:1rem;background:var(--sand);border-radius:8px">
          <h4 style="font-family:'Cormorant Garamond',serif;font-size:1rem;color:var(--ink);margin-bottom:0.5rem">💡 Travel Tips</h4>
          <p style="font-size:0.8rem;color:var(--muted);line-height:1.6">${escapeHtml(it.tips)}</p>
        </div>
      ` : ''}
      <div style="display:flex;gap:0.75rem;margin-top:1.5rem">
        <button class="detail-btn detail-btn-primary" style="flex:1" onclick="closeItineraryModal(); openBookingModalInline('${escapeHtml(it.destination).replace(/'/g, "\\'")}', null, 'Itinerary')">Book This Trip</button>
      </div>
    </div>
  `;
  
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function switchDetailItineraryDay(day, totalDays) {
  document.querySelectorAll('#itineraryDaysNav .filter-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i + 1 === day);
  });
  document.querySelectorAll('.itinerary-day-section').forEach((section, i) => {
    section.classList.toggle('active', i + 1 === day);
  });
}

function closeItineraryModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById('itineraryModal');
  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

function getDestinationImage(destName) {
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
    'Santorini, Greece': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800'
  };
  return images[destName] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';
}

function openBookingModalInline(destName, imageUrl, type) {
  const modal = document.getElementById('bookingModal');
  const destEl = document.getElementById('bookingModalDest');
  const bodyEl = document.getElementById('bookingModalBody');
  
  const safeName = escapeHtml(destName);
  const safeImg = imageUrl ? escapeHtml(imageUrl) : '';
  
  destEl.textContent = safeName;
  
  bodyEl.innerHTML = `
    ${safeImg ? `<img class="modal-thumb" src="${safeImg}" alt="${safeName}" onerror="this.style.display='none'" style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:1.2rem" />` : ''}
    <form onsubmit="handleBookingSubmitInline(event, '${safeName.replace(/'/g, "\\'")}')">
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
          <textarea class="modal-textarea" id="bookingNotes" placeholder="Any special requests..." style="width:100%;padding:0.65rem 0.9rem;border:1px solid rgba(26,22,18,0.15);border-radius:6px;font-family:'DM Sans',sans-serif;font-size:0.88rem;resize:vertical;min-height:80px"></textarea>
        </div>
      </div>
      <button type="submit" class="modal-submit">Confirm Booking</button>
    </form>
  `;
  
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
  
  modal.removeAttribute('hidden');
  modal.classList.add('open');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'bookingModalTitle');
  document.body.style.overflow = 'hidden';
  
  setTimeout(() => {
    const firstInput = document.getElementById('bookingName');
    if (firstInput) firstInput.focus();
  }, 100);
}

function handleBookingSubmitInline(e, destName) {
  e.preventDefault();
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
  closeBookingModal();
}
