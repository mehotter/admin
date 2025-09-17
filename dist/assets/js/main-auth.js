// assets/js/main-auth.js

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
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('login.html');

    if (user) {
      console.log('User is authenticated:', user.email);
      // FIRST, update the display name.
      updateProfileDisplay(user);

      // THEN, run the logic for the current page.
      if (path.endsWith('index.html') || path.endsWith('/')) {
        if (typeof startDashboard === 'function') startDashboard();
      } else if (path.endsWith('users.html')) {
        if (typeof loadUsers === 'function') loadUsers();
      } else if (path.endsWith('user-details.html')) {
        if (typeof loadUserDetails === 'function') loadUserDetails();
      }

    } else if (!isLoginPage) {
      console.log('No user found, redirecting to login.');
      window.location.href = 'login.html';
    }
  });
});