// assets/js/main-auth.js

function hideLoader() {
  const loader = document.querySelector('.page-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 300);
  }
  document.body.classList.remove('is-loading');
}

document.addEventListener('DOMContentLoaded', () => {
  const signoutLink = document.getElementById('signout-link');
  if (signoutLink) {
    signoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await auth.signOut();
        window.location.href = 'login.html';
      } catch (error) {
        console.error('Sign out error:', error);
      }
    });
  }

  const updateProfileDisplay = (user) => {
    if (!user || !user.email) return;
    const email = user.email;

    const navbarProfileName = document.getElementById('navbar-profile-name');
    if (navbarProfileName) navbarProfileName.textContent = email;

    const sidebarProfileName = document.getElementById('sidebar-profile-name');
    if (sidebarProfileName) sidebarProfileName.textContent = email;
  };

  auth.onAuthStateChanged(user => {
    const isLoginPage = window.location.pathname.endsWith('login.html');

    if (user) {
      console.log('User is authenticated:', user.email);
      updateProfileDisplay(user);
      
      // **ADDED THIS LINE**
      // This ensures the dashboard code only runs after login is confirmed.
      if (typeof startDashboard === 'function') {
        startDashboard();
      }
      
      // Dispatch a custom event to notify other scripts that authentication is complete
      document.dispatchEvent(new Event('auth-ready'));

    } else if (!isLoginPage) {
      console.log('No user found, redirecting to login.');
      window.location.href = 'login.html';
    } else {
      hideLoader();
    }
  });
});