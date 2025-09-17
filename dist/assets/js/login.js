document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('login-form');
  const emailEl = document.getElementById('email');
  const pwdEl = document.getElementById('password');
  const togglePwd = document.getElementById('togglePwd');
  const errorEl = document.getElementById('error-msg');
  const forgotLink = document.getElementById('forgot-link');
  const rememberEl = document.getElementById('remember');

  // 1) Prevent auto-login: clear any existing persisted session on login page
  try {
    await auth.signOut(); // ensures login page always shows the form
    await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION); // default to session-only
  } catch (e) {
    /* ignore */
  }

  // 2) Do NOT redirect here on auth state; show the form no matter what
  // Only redirect after a deliberate successful sign-in

  togglePwd.addEventListener('click', () => {
    const type = pwdEl.type === 'password' ? 'text' : 'password';
    pwdEl.type = type;
    togglePwd.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
  });

  forgotLink.addEventListener('click', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const email = emailEl.value.trim();
    if (!email) { errorEl.textContent = 'Enter the email to reset password.'; return; }
    try {
      await auth.sendPasswordResetEmail(email);
      errorEl.textContent = 'Password reset link sent.';
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const email = emailEl.value.trim();
    const password = pwdEl.value;

    if (!email || !password) {
      errorEl.textContent = 'Email and password are required.';
      return;
    }

    try {
      // Remember me -> persistent across restarts; otherwise session-only
      const persistence = rememberEl.checked
        ? firebase.auth.Auth.Persistence.LOCAL
        : firebase.auth.Auth.Persistence.SESSION;
      await auth.setPersistence(persistence);

      await auth.signInWithEmailAndPassword(email, password);
      window.location.href = 'index.html'; // redirect only after success
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
});
