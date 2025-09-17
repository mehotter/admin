// assets/js/user-details.js

const uid = new URLSearchParams(location.search).get('id');
if (!uid) location.href = 'users.html';

auth.onAuthStateChanged(async admin => {
  if (!admin) return location.href = 'login.html';

  const prof = document.getElementById('profile');
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) throw 'User not found';

    const d = doc.data();
    prof.innerHTML = `
      <div style="position:relative">
        <img class="cover" src="${d.bannerUrl||'assets/images/placeholder-wide.jpg'}">
        <img class="avatar" src="${d.photoUrl||'assets/images/placeholder.jpg'}">
      </div>
      <div class="pd-body">
        <h3 style="margin:0">${d.name||'Unnamed'}</h3>
        <p class="text-muted" style="margin:4px 0">${d.location||''}</p>
        <div class="pd-grid">
          <div class="pd-item"><div class="pd-label">UID</div><div class="pd-val">${uid}</div></div>
          <div class="pd-item"><div class="pd-label">Email</div><div class="pd-val">${d.email||'—'}</div></div>
          <div class="pd-item"><div class="pd-label">Total Gifts</div><div class="pd-val">${d.received||0}</div></div>
          <div class="pd-item"><div class="pd-label">Level</div><div class="pd-val">${d.level||0}</div></div>
          <!-- add more fields as needed -->
        </div>
      </div>`;
  } catch (e) {
    console.error(e);
    prof.textContent = 'Error loading profile.';
  }
});
