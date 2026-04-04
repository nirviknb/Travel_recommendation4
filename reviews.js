/* =========================================
   WANDERLUST — REVIEWS & RATINGS
   User-generated reviews per destination
   Stored in localStorage
   ========================================= */

const REVIEWS_STORAGE_KEY = 'wanderlust_reviews';

const defaultReviews = {
  'Sydney, Australia': {
    rating: 4.7,
    count: 342,
    reviews: [
      { user: 'Sarah M.', rating: 5, date: '2025-11-15', text: 'Absolutely stunning city! The Opera House at sunset is breathtaking. Bondi Beach is a must-visit.', helpful: 24 },
      { user: 'James K.', rating: 4, date: '2025-10-22', text: 'Great food scene and harbor views. Public transport is excellent. A bit pricey but worth it.', helpful: 18 },
      { user: 'Maria L.', rating: 5, date: '2025-09-08', text: 'The coastal walk from Bondi to Coogee is one of the best experiences of my life.', helpful: 31 }
    ]
  },
  'Tokyo, Japan': {
    rating: 4.9,
    count: 518,
    reviews: [
      { user: 'Alex T.', rating: 5, date: '2025-12-01', text: 'Tokyo is a perfect blend of ancient tradition and cutting-edge technology. Shibuya crossing at night is surreal.', helpful: 45 },
      { user: 'Emma R.', rating: 5, date: '2025-11-10', text: 'The food alone is worth the trip. Tsukiji outer market was incredible. Cherry blossom season is magical.', helpful: 38 },
      { user: 'David W.', rating: 4, date: '2025-10-05', text: 'Amazing city but can be overwhelming. Get a JR Pass and plan your days. The subway system is incredibly efficient.', helpful: 22 }
    ]
  },
  'Paris, France': {
    rating: 4.6,
    count: 623,
    reviews: [
      { user: 'Sophie B.', rating: 5, date: '2025-11-20', text: 'The Louvre could take a week to explore. Montmartre at dusk is pure magic. Every corner is a postcard.', helpful: 52 },
      { user: 'Tom H.', rating: 4, date: '2025-10-15', text: 'Beautiful city but watch out for tourist traps near major attractions. Eat where locals eat.', helpful: 29 },
      { user: 'Yuki S.', rating: 5, date: '2025-09-28', text: 'Seine river cruise at night is unforgettable. The city of lights truly lives up to its name.', helpful: 41 }
    ]
  },
  'Bali, Indonesia': {
    rating: 4.5,
    count: 445,
    reviews: [
      { user: 'Lisa P.', rating: 5, date: '2025-12-05', text: 'Ubud rice terraces at sunrise are life-changing. The spirituality and art scene here is incredible.', helpful: 36 },
      { user: 'Mike D.', rating: 4, date: '2025-11-18', text: 'Beautiful beaches and amazing temples. Traffic in Seminyak is chaotic but the sunsets make up for it.', helpful: 21 },
      { user: 'Anna C.', rating: 4, date: '2025-10-30', text: 'Great value for money. Yoga retreats and healthy food everywhere. Watch out for Bali belly!', helpful: 27 }
    ]
  },
  'New York, USA': {
    rating: 4.6,
    count: 712,
    reviews: [
      { user: 'Carlos R.', rating: 5, date: '2025-11-25', text: 'The energy of this city is unmatched. Central Park in autumn is gorgeous. Broadway shows are world-class.', helpful: 48 },
      { user: 'Rachel G.', rating: 4, date: '2025-10-12', text: 'Incredible food diversity. The subway is confusing at first but you get used to it. Expensive but worth it.', helpful: 33 },
      { user: 'Kenji M.', rating: 5, date: '2025-09-20', text: 'Walking across the Brooklyn Bridge at sunset is a must. The Met museum could take days to explore.', helpful: 29 }
    ]
  },
  'Rome, Italy': {
    rating: 4.7,
    count: 534,
    reviews: [
      { user: 'Isabella F.', rating: 5, date: '2025-12-02', text: 'Standing in the Colosseum gave me chills. The Vatican Museums are overwhelming in the best way.', helpful: 42 },
      { user: 'Peter N.', rating: 4, date: '2025-11-08', text: 'Amazing history everywhere. Trastevere neighborhood has the best authentic Italian food.', helpful: 25 },
      { user: 'Hannah W.', rating: 5, date: '2025-10-15', text: 'Trevi Fountain at 6am before the crowds is pure magic. Gelato every day is a must.', helpful: 37 }
    ]
  },
  'Bangkok, Thailand': {
    rating: 4.4,
    count: 389,
    reviews: [
      { user: 'Jake S.', rating: 5, date: '2025-11-30', text: 'Street food paradise! Khao San Road is wild but fun. The Grand Palace is stunning.', helpful: 31 },
      { user: 'Nina K.', rating: 4, date: '2025-10-20', text: 'Incredible value for money. Tuk-tuks are fun but negotiate price first. Wat Arun at sunset is beautiful.', helpful: 19 },
      { user: 'Oscar L.', rating: 4, date: '2025-09-15', text: 'Chatuchak weekend market is a shopper\'s dream. The heat is intense but the food makes it worthwhile.', helpful: 24 }
    ]
  },
  'Santorini, Greece': {
    rating: 4.8,
    count: 298,
    reviews: [
      { user: 'Claire M.', rating: 5, date: '2025-11-15', text: 'Oia sunset is the most beautiful thing I\'ve ever seen. The blue domes against the white buildings are iconic.', helpful: 55 },
      { user: 'Ryan B.', rating: 5, date: '2025-10-28', text: 'Red Beach is otherworldly. The volcanic landscape is fascinating. Wine tasting tours are excellent.', helpful: 32 },
      { user: 'Aiko T.', rating: 4, date: '2025-09-10', text: 'Stunning but very touristy. Go in shoulder season for better prices and fewer crowds.', helpful: 28 }
    ]
  },
  'Marrakech, Morocco': {
    rating: 4.3,
    count: 267,
    reviews: [
      { user: 'Fatima H.', rating: 5, date: '2025-11-22', text: 'The souks are a sensory overload in the best way. Majorelle Garden is an oasis of calm.', helpful: 26 },
      { user: 'Chris P.', rating: 4, date: '2025-10-18', text: 'Jemaa el-Fnaa square at night is incredible. Haggle hard in the markets. Tagine is amazing.', helpful: 20 },
      { user: 'Lena S.', rating: 4, date: '2025-09-25', text: 'Staying in a riad is a must-do experience. The hammam tradition is wonderfully relaxing.', helpful: 22 }
    ]
  },
  'Queenstown, New Zealand': {
    rating: 4.8,
    count: 312,
    reviews: [
      { user: 'Sam W.', rating: 5, date: '2025-12-01', text: 'Bungee jumping here was the thrill of a lifetime. Milford Sound is absolutely breathtaking.', helpful: 44 },
      { user: 'Olivia T.', rating: 5, date: '2025-11-10', text: 'The scenery is unreal. Every direction looks like a postcard. Lord of the Rings fans will love it.', helpful: 38 },
      { user: 'Marco R.', rating: 4, date: '2025-10-05', text: 'Adventure capital indeed! Skydiving, jet boating, hiking — so much to do. Expensive but worth every penny.', helpful: 27 }
    ]
  }
};

function loadReviewsData() {
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultReviews, ...parsed };
    }
  } catch { /* fall through */ }
  return defaultReviews;
}

function saveReview(destinationName, review) {
  const allReviews = loadReviewsData();
  if (!allReviews[destinationName]) {
    allReviews[destinationName] = { rating: 0, count: 0, reviews: [] };
  }
  allReviews[destinationName].reviews.unshift(review);
  allReviews[destinationName].count = allReviews[destinationName].reviews.length;
  const totalRating = allReviews[destinationName].reviews.reduce((sum, r) => sum + r.rating, 0);
  allReviews[destinationName].rating = Math.round((totalRating / allReviews[destinationName].count) * 10) / 10;
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(allReviews));
  return allReviews[destinationName];
}

function getUserReview(destinationName) {
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed[destinationName]) return null;
    const userEmail = getCurrentUserEmail();
    return parsed[destinationName].reviews.find(r => r.email === userEmail) || null;
  } catch { return null; }
}

function getCurrentUserEmail() {
  try {
    const user = JSON.parse(localStorage.getItem('wanderlust_user') || '{}');
    return user.email || 'anonymous';
  } catch { return 'anonymous'; }
}

function renderStars(rating, size) {
  const s = size || '0.85rem';
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      html += `<span style="color:var(--gold);font-size:${s}">★</span>`;
    } else if (i - 0.5 <= rating) {
      html += `<span style="color:var(--gold);font-size:${s}">★</span>`;
    } else {
      html += `<span style="color:var(--star-inactive);font-size:${s}">★</span>`;
    }
  }
  return html;
}

function renderReviewsSection(destinationName) {
  const container = document.getElementById('reviewsContainer');
  if (!container) return;

  const reviewsData = loadReviewsData();
  const data = reviewsData[destinationName];
  if (!data || !data.reviews.length) {
    container.innerHTML = `
      <div class="reviews-empty">
        <p>No reviews yet. Be the first to review this destination!</p>
      </div>
    `;
    return;
  }

  const avgRating = data.rating;
  const totalCount = data.count;

  let html = `
    <div class="reviews-summary">
      <div class="reviews-average">
        <span class="reviews-big-number">${avgRating}</span>
        <div class="reviews-stars">${renderStars(avgRating, '1.2rem')}</div>
        <span class="reviews-total">${totalCount} review${totalCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
    <div class="reviews-list">
      ${data.reviews.map(r => `
        <div class="review-card">
          <div class="review-header">
            <div class="review-author">
              <span class="review-avatar">${r.user.charAt(0)}</span>
              <div>
                <span class="review-name">${escapeHtml(r.user)}</span>
                <span class="review-date">${new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            <div class="review-rating">${renderStars(r.rating)}</div>
          </div>
          <p class="review-text">${escapeHtml(r.text)}</p>
          <div class="review-footer">
            <button class="review-helpful-btn" onclick="markReviewHelpful('${escapeHtml(destinationName)}', '${escapeHtml(r.user)}', '${escapeHtml(r.date)}')">
              👍 Helpful (${r.helpful || 0})
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function markReviewHelpful(destName, userName, reviewDate) {
  const allReviews = loadReviewsData();
  if (!allReviews[destName]) return;
  const review = allReviews[destName].reviews.find(r => r.user === userName && r.date === reviewDate);
  if (review) {
    review.helpful = (review.helpful || 0) + 1;
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(allReviews));
    renderReviewsSection(destName);
  }
}

function renderReviewForm(destinationName) {
  const container = document.getElementById('reviewFormContainer');
  if (!container) return;

  const existing = getUserReview(destinationName);
  if (existing) {
    container.innerHTML = `
      <div class="review-already-submitted">
        <p>✓ You've already reviewed this destination.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="review-form">
      <h4>Write a Review</h4>
      <div class="review-form-rating">
        <label>Your Rating:</label>
        <div class="star-rating" id="starRating">
          ${[1,2,3,4,5].map(i => `<button type="button" class="star-btn" data-value="${i}" onclick="setReviewRating(${i})" aria-label="Rate ${i} star${i > 1 ? 's' : ''}">★</button>`).join('')}
        </div>
        <span id="ratingLabel">Select rating</span>
      </div>
      <div class="form-group">
        <label for="reviewText">Your Review</label>
        <textarea id="reviewText" rows="4" placeholder="Share your experience..."></textarea>
      </div>
      <div class="form-group">
        <label for="reviewName">Your Name</label>
        <input type="text" id="reviewName" placeholder="Your name" />
      </div>
      <button class="btn-book" onclick="submitReview('${escapeHtml(destinationName)}')">Submit Review</button>
    </div>
  `;
}

let currentReviewRating = 0;

function setReviewRating(value) {
  currentReviewRating = value;
  const stars = document.querySelectorAll('.star-btn');
  stars.forEach((star, i) => {
    star.style.color = i < value ? 'var(--gold)' : 'var(--star-inactive)';
  });
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  document.getElementById('ratingLabel').textContent = labels[value];
}

function submitReview(destinationName) {
  if (currentReviewRating === 0) {
    showToast('Please select a rating');
    return;
  }
  const text = document.getElementById('reviewText')?.value.trim();
  if (!text) {
    showToast('Please write your review');
    return;
  }
  const name = document.getElementById('reviewName')?.value.trim() || 'Anonymous';

  const review = {
    user: name,
    email: getCurrentUserEmail(),
    rating: currentReviewRating,
    date: new Date().toISOString().split('T')[0],
    text: text,
    helpful: 0
  };

  saveReview(destinationName, review);
  currentReviewRating = 0;
  showToast('Review submitted! Thank you.', 'success');
  renderReviewsSection(destinationName);
  renderReviewForm(destinationName);
}
