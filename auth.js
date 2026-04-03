/* =========================================
   WANDERLUST — AUTH JS
   Login & Signup Functionality
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initSignupForm();
  initPasswordStrengthMeter();
});

/* =========== GOOGLE AUTH CALLBACKS =========== */
function handleGoogleSignIn(response) {
  const payload = parseJwt(response.credential);
  storeUserSession({
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
    sub: payload.sub,
    provider: 'google'
  });
  showMessage('loginMessage', 'Signed in successfully! Redirecting...', 'success');
  setTimeout(() => {
    window.location.href = 'travel_recommendation.html';
  }, 1500);
}

function handleGoogleSignUp(response) {
  const payload = parseJwt(response.credential);
  storeUserSession({
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
    sub: payload.sub,
    provider: 'google'
  });
  showMessage('signupMessage', 'Account created successfully! Redirecting...', 'success');
  setTimeout(() => {
    window.location.href = 'travel_recommendation.html';
  }, 1500);
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

/* =========== SESSION MANAGEMENT =========== */
function storeUserSession(user) {
  localStorage.setItem('wanderlust_user', JSON.stringify(user));
  localStorage.setItem('wanderlust_auth_time', Date.now().toString());
}

function getUserSession() {
  const user = localStorage.getItem('wanderlust_user');
  return user ? JSON.parse(user) : null;
}

function clearUserSession() {
  localStorage.removeItem('wanderlust_user');
  localStorage.removeItem('wanderlust_auth_time');
}

/* =========== LOGIN FORM =========== */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const rememberMe = document.getElementById('rememberMe');
    let isValid = true;

    if (!validateEmail(email.value.trim())) {
      showFieldError('email', 'emailError');
      isValid = false;
    }

    if (password.value.length < 1) {
      showFieldError('password', 'passwordError');
      isValid = false;
    }

    if (!isValid) return;

    const submitBtn = document.getElementById('loginSubmitBtn');
    setLoading(submitBtn, true);

    try {
      await simulateAuth(email.value.trim(), password.value);

      const user = {
        name: email.value.split('@')[0],
        email: email.value.trim(),
        provider: 'email'
      };

      if (rememberMe.checked) {
        localStorage.setItem('wanderlust_remember', email.value.trim());
      } else {
        localStorage.removeItem('wanderlust_remember');
      }

      storeUserSession(user);
      showMessage('loginMessage', 'Signed in successfully! Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = 'travel_recommendation.html';
      }, 1500);
    } catch (error) {
      showMessage('loginMessage', error.message, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });

  const remembered = localStorage.getItem('wanderlust_remember');
  if (remembered) {
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.value = remembered;
    const rememberCheckbox = document.getElementById('rememberMe');
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }
}

/* =========== SIGNUP FORM =========== */
function initSignupForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('signupEmail');
    const password = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const agreeTerms = document.getElementById('agreeTerms');
    let isValid = true;

    if (firstName.value.trim().length < 1) {
      showFieldError('firstName', 'firstNameError');
      isValid = false;
    }

    if (lastName.value.trim().length < 1) {
      showFieldError('lastName', 'lastNameError');
      isValid = false;
    }

    if (!validateEmail(email.value.trim())) {
      showFieldError('signupEmail', 'signupEmailError');
      isValid = false;
    }

    if (password.value.length < 8) {
      showFieldError('signupPassword', 'signupPasswordError');
      isValid = false;
    }

    if (password.value !== confirmPassword.value) {
      showFieldError('confirmPassword', 'confirmPasswordError');
      isValid = false;
    }

    if (!agreeTerms.checked) {
      document.getElementById('termsError').classList.add('show');
      isValid = false;
    }

    if (!isValid) return;

    const submitBtn = document.getElementById('signupSubmitBtn');
    setLoading(submitBtn, true);

    try {
      await simulateAuth(email.value.trim(), password.value);

      const user = {
        name: `${firstName.value.trim()} ${lastName.value.trim()}`,
        email: email.value.trim(),
        provider: 'email'
      };

      storeUserSession(user);
      showMessage('signupMessage', 'Account created successfully! Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = 'travel_recommendation.html';
      }, 1500);
    } catch (error) {
      showMessage('signupMessage', error.message, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

/* =========== PASSWORD STRENGTH =========== */
function initPasswordStrengthMeter() {
  const passwordInput = document.getElementById('signupPassword');
  if (!passwordInput) return;

  const strengthContainer = document.getElementById('passwordStrength');
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');

  passwordInput.addEventListener('input', () => {
    const value = passwordInput.value;
    if (value.length === 0) {
      strengthContainer.classList.remove('show');
      return;
    }

    strengthContainer.classList.add('show');
    const strength = calculatePasswordStrength(value);

    strengthFill.className = 'strength-fill';
    strengthText.className = 'strength-text';

    if (strength.score <= 1) {
      strengthFill.classList.add('weak');
      strengthText.classList.add('weak');
      strengthText.textContent = 'Weak — add uppercase, numbers, or symbols';
    } else if (strength.score <= 2) {
      strengthFill.classList.add('medium');
      strengthText.classList.add('medium');
      strengthText.textContent = 'Medium — getting better';
    } else {
      strengthFill.classList.add('strong');
      strengthText.classList.add('strong');
      strengthText.textContent = 'Strong — excellent password';
    }
  });
}

function calculatePasswordStrength(password) {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password)
  };

  if (checks.length) score++;
  if (checks.uppercase && checks.lowercase) score++;
  if (checks.numbers) score++;
  if (checks.symbols) score++;
  if (password.length >= 12) score++;

  return { score: Math.min(score, 3), checks };
}

/* =========== PASSWORD VISIBILITY TOGGLE =========== */
function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  const eyeOpen = button.querySelector('.eye-open');
  const eyeClosed = button.querySelector('.eye-closed');

  if (input.type === 'password') {
    input.type = 'text';
    eyeOpen.style.display = 'none';
    eyeClosed.style.display = 'block';
    button.setAttribute('aria-label', 'Hide password');
  } else {
    input.type = 'password';
    eyeOpen.style.display = 'block';
    eyeClosed.style.display = 'none';
    button.setAttribute('aria-label', 'Show password');
  }
}

/* =========== VALIDATION HELPERS =========== */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (error) error.classList.add('show');
}

function clearErrors() {
  document.querySelectorAll('.form-input').forEach(input => {
    input.classList.remove('error', 'valid');
  });
  document.querySelectorAll('.field-error').forEach(error => {
    error.classList.remove('show');
  });
}

function showMessage(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `auth-message show ${type}`;
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

/* =========== SIMULATED AUTH (Replace with real backend) =========== */
function simulateAuth(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password.length < 6) {
        reject(new Error('Invalid credentials. Please try again.'));
      } else {
        resolve({ user: { email, name: email.split('@')[0] } });
      }
    }, 1000);
  });
}

/* =========== DYNAMIC NAVIGATION =========== */
function updateNavigation() {
  const user = getUserSession();
  const navLogin = document.getElementById('nav-login');
  const navSignup = document.getElementById('nav-signup');
  const navAccount = document.getElementById('nav-account');
  const navLogout = document.getElementById('nav-logout');

  if (user) {
    if (navLogin) navLogin.style.display = 'none';
    if (navSignup) navSignup.style.display = 'none';
    if (navAccount) navAccount.style.display = '';
    if (navLogout) navLogout.style.display = '';
  } else {
    if (navLogin) navLogin.style.display = '';
    if (navSignup) navSignup.style.display = '';
    if (navAccount) navAccount.style.display = 'none';
    if (navLogout) navLogout.style.display = 'none';
  }
}

function handleLogout() {
  clearUserSession();
  window.location.href = 'login.html';
}

function requireAuth() {
  const user = getUserSession();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}
