// Use the auth and db initialized in firebase-config.js
// Do NOT redeclare auth, just use the existing one
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = 'index.html';  // Redirect on success
    })
    .catch(error => {
      document.getElementById('error-msg').textContent = error.message;
    });
});

// Auto redirect if already logged in
auth.onAuthStateChanged(user => {
  if (user) {
    window.location.href = 'index.html';
  }
});