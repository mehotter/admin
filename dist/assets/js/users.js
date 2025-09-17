auth.onAuthStateChanged(async user => {
  if (!user) return (window.location.href = 'login.html');

  const grid = document.getElementById('userGrid');
  try {
    const snap = await db.collection('users').get();
    if (snap.empty) { grid.textContent = 'No users found.'; return; }

    grid.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      const banner = d.bannerUrl || '../assets/images/placeholder-wide.jpg';
      const avatar = d.photoUrl  || `https://via.placeholder.com/64x64/7c4dff/fff?text=${(d.name||'U').charAt(0)}`;
      const name = d.name || 'Unnamed';
      const loc  = d.location || '';

      const card = document.createElement('div');
      card.className = 'user-card';
      card.innerHTML = `
        <div style="position:relative">
          <img class="banner-img" src="${banner}" alt="">
          <img class="profile-img" src="${avatar}" alt="">
        </div>
        <div class="uc-body">
          <div class="uc-name">${name}</div>
          <div class="text-muted">${loc}</div>
        </div>`;
      card.onclick = () => window.location.href = `user-details.html?id=${doc.id}`;
      grid.appendChild(card);
    });
  } catch (e) {
    console.error(e);
    grid.textContent = 'Failed to load users.';
  }
});
