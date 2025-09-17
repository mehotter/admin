const uid = new URLSearchParams(location.search).get('id');

auth.onAuthStateChanged(async admin => {
  if (!admin) return (location.href = 'login.html');

  const prof = document.getElementById('profile');
  if (!uid) { prof.innerHTML = '<div class="alert alert-danger m-3">No user id in URL</div>'; return; }

  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) { prof.innerHTML = '<div class="alert alert-warning m-3">User not found</div>'; return; }

    const d = doc.data();
    const banner = d.bannerUrl || '../assets/images/placeholder-wide.jpg';
    const avatar = d.photoUrl  || `https://via.placeholder.com/96x96/7c4dff/fff?text=${(d.name||'U').charAt(0)}`;

    prof.innerHTML = `
      <div style="position:relative">
        <img class="cover" src="${banner}" alt="">
        <img class="avatar" src="${avatar}" alt="">
      </div>
      <div class="pd-body">
        <h3 class="mb-1">${d.name || 'Unnamed User'}</h3>
        <p class="text-muted mb-2">${d.location || ''}</p>
        <div class="pd-grid">
          <div class="pd-item"><div class="pd-label">UID</div><div class="pd-val">${uid}</div></div>
          <div class="pd-item"><div class="pd-label">Email</div><div class="pd-val">${d.email||'—'}</div></div>
          <div class="pd-item"><div class="pd-label">Gifts Received</div><div class="pd-val">${d.received||0}</div></div>
          <div class="pd-item"><div class="pd-label">Level</div><div class="pd-val">${d.level||0}</div></div>
          <div class="pd-item" style="grid-column:1/3;">
            <div class="pd-label">Bio</div><div class="pd-val">${d.bio||'—'}</div>
          </div>
        </div>
      </div>`;
  } catch (e) {
    console.error(e);
    prof.innerHTML = `<div class="alert alert-danger m-3">Error: ${e.message}</div>`;
  }
});
