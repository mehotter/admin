// assets/js/users.js

auth.onAuthStateChanged(async user => {
  if (!user) return window.location.href = 'login.html';

  const grid = document.getElementById('userGrid');
  try {
    const snap = await db.collection('users').get();
    if (snap.empty) { grid.textContent = 'No users found.'; return; }

    grid.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      const card = document.createElement('div');
      card.className = 'user-card';
      card.innerHTML = `
        <div style="position:relative">
          <img class="banner-img" src="${d.bannerUrl||'assets/images/placeholder-wide.jpg'}">
          <img class="profile-img" src="${d.photoUrl||'assets/images/placeholder.jpg'}">
        </div>
        <div class="uc-body">
          <div class="uc-name">${d.name||'Unnamed'}</div>
          <div class="text-muted">${d.location||''}</div>
        </div>`;
      card.onclick = () => window.location.href = `user-details.html?id=${doc.id}`;
      grid.appendChild(card);
    });
  } catch (e) {
    console.error(e);
    grid.textContent = 'Failed to load users.';
  }
});
