/* =========================================
   WANDERLUST — ACCOUNT JS
   Profile Management, Avatar Upload,
   Preferences, Security
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  initAccountPage();
});

function initAccountPage() {
  const user = getUserSession();

  if (!user) {
    document.getElementById('accountGuest').style.display = 'flex';
    document.getElementById('accountPage').style.display = 'none';
    return;
  }

  document.getElementById('accountGuest').style.display = 'none';
  document.getElementById('accountPage').style.display = 'block';

  loadProfileData(user);
  initTabNavigation();
  initAvatarUpload();
  initPreferences();
}

/* =========== LOAD PROFILE DATA =========== */
function loadProfileData(user) {
  const profile = getProfileData();

  const name = profile.name || user.name || '';
  const email = profile.email || user.email || '';
  const phone = profile.phone || '';
  const bio = profile.bio || '';
  const avatar = profile.avatar || '';

  document.getElementById('accountName').value = name;
  document.getElementById('accountEmail').value = email;
  document.getElementById('accountPhone').value = phone;
  document.getElementById('accountBio').value = bio;

  document.getElementById('sidebarName').textContent = name || 'Traveler';
  document.getElementById('sidebarEmail').textContent = email;

  const avatarImg = document.getElementById('avatarPreview');
  if (avatar) {
    avatarImg.src = avatar;
  } else {
    const initials = (name || 'T').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    avatarImg.src = generateAvatarSVG(initials);
  }
}

function getProfileData() {
  try {
    return JSON.parse(localStorage.getItem('wanderlust_profile') || '{}');
  } catch {
    return {};
  }
}

function saveProfileData(data) {
  localStorage.setItem('wanderlust_profile', JSON.stringify(data));
}

function generateAvatarSVG(initials) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#c9a84c"/>
      <stop offset="100%" style="stop-color:#8b6f47"/>
    </linearGradient></defs>
    <rect width="96" height="96" fill="url(#g)"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
      font-family="serif" font-size="32" fill="white" font-weight="600">${initials}</text>
  </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/* =========== TAB NAVIGATION =========== */
function initTabNavigation() {
  const navBtns = document.querySelectorAll('.account-nav-btn[data-tab]');
  const tabs = document.querySelectorAll('.account-tab');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabs.forEach(tab => {
        tab.classList.toggle('active', tab.id === `tab-${tabId}`);
      });
    });
  });
}

/* =========== AVATAR UPLOAD =========== */
function initAvatarUpload() {
  const input = document.getElementById('avatarUpload');
  if (!input) return;

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFormMessage('profileMessage', 'Please select a valid image file.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showFormMessage('profileMessage', 'Image must be smaller than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      document.getElementById('avatarPreview').src = dataUrl;

      const profile = getProfileData();
      profile.avatar = dataUrl;
      saveProfileData(profile);

      showFormMessage('profileMessage', 'Profile photo updated!', 'success');
    };
    reader.readAsDataURL(file);
  });
}

/* =========== PROFILE UPDATE =========== */
function handleProfileUpdate(e) {
  e.preventDefault();

  const name = document.getElementById('accountName').value.trim();
  const email = document.getElementById('accountEmail').value.trim();
  const phone = document.getElementById('accountPhone').value.trim();
  const bio = document.getElementById('accountBio').value.trim();

  if (!name) {
    showFormMessage('profileMessage', 'Name is required.', 'error');
    return;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFormMessage('profileMessage', 'Please enter a valid email address.', 'error');
    return;
  }

  const btn = document.getElementById('profileSaveBtn');
  setLoading(btn, true);

  setTimeout(() => {
    const profile = getProfileData();
    profile.name = name;
    profile.email = email;
    profile.phone = phone;
    profile.bio = bio;
    saveProfileData(profile);

    const user = getUserSession();
    if (user) {
      user.name = name;
      user.email = email;
      localStorage.setItem('wanderlust_user', JSON.stringify(user));
    }

    document.getElementById('sidebarName').textContent = name;
    document.getElementById('sidebarEmail').textContent = email;

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const avatarImg = document.getElementById('avatarPreview');
    if (!profile.avatar) {
      avatarImg.src = generateAvatarSVG(initials);
    }

    setLoading(btn, false);
    showFormMessage('profileMessage', 'Profile updated successfully!', 'success');
  }, 800);
}

/* =========== SECURITY UPDATE =========== */
function handleSecurityUpdate(e) {
  e.preventDefault();

  const current = document.getElementById('currentPassword').value;
  const newPass = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;

  if (!current) {
    showFormMessage('securityMessage', 'Please enter your current password.', 'error');
    return;
  }

  if (newPass.length < 8) {
    showFormMessage('securityMessage', 'New password must be at least 8 characters.', 'error');
    return;
  }

  if (newPass !== confirm) {
    showFormMessage('securityMessage', 'Passwords do not match.', 'error');
    return;
  }

  const btn = document.getElementById('securitySaveBtn');
  setLoading(btn, true);

  setTimeout(() => {
    setLoading(btn, false);
    showFormMessage('securityMessage', 'Password updated successfully!', 'success');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  }, 1000);
}

/* =========== PREFERENCES =========== */
function initPreferences() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const darkToggle = document.getElementById('prefDarkMode');
  if (darkToggle) darkToggle.checked = isDark;

  const prefs = getPreferences();
  const notifToggle = document.getElementById('prefNotifications');
  if (notifToggle && prefs.notifications !== undefined) {
    notifToggle.checked = prefs.notifications;
  }

  const langSelect = document.getElementById('prefLanguage');
  if (langSelect && prefs.language) {
    langSelect.value = prefs.language;
  }

  const currSelect = document.getElementById('prefCurrency');
  if (currSelect && prefs.currency) {
    currSelect.value = prefs.currency;
  }
}

function getPreferences() {
  try {
    return JSON.parse(localStorage.getItem('wanderlust_preferences') || '{}');
  } catch {
    return {};
  }
}

function savePreference(key, value) {
  const prefs = getPreferences();
  prefs[key] = value;
  localStorage.setItem('wanderlust_preferences', JSON.stringify(prefs));
}

/* =========== DELETE ACCOUNT =========== */
function handleDeleteAccount() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone. All your data, bookings, and preferences will be permanently removed.')) {
    if (confirm('This is your last chance. Click OK to permanently delete your account.')) {
      localStorage.removeItem('wanderlust_user');
      localStorage.removeItem('wanderlust_profile');
      localStorage.removeItem('wanderlust_preferences');
      localStorage.removeItem('wanderlust_auth_time');
      localStorage.removeItem('wanderlust_remember');
      window.location.href = 'login.html';
    }
  }
}

/* =========== HELPERS =========== */
function showFormMessage(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `form-message show ${type}`;
  setTimeout(() => {
    el.className = 'form-message';
  }, 5000);
}

function setLoading(button, isLoading) {
  const text = button.querySelector('.btn-text');
  const loader = button.querySelector('.btn-loader');
  if (isLoading) {
    button.disabled = true;
    text.style.display = 'none';
    loader.style.display = 'flex';
  } else {
    button.disabled = false;
    text.style.display = 'inline';
    loader.style.display = 'none';
  }
}
