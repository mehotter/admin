// assets/js/user-details.js

async function loadUserDetails() {
  const uid = new URLSearchParams(location.search).get('id');
  if (!uid) {
    window.location.href = 'users.html';
    return;
  }

  const prof = document.getElementById('profile');

  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) throw new Error('User not found');

    const d = doc.data();

    const formatTimestamp = (timestamp) => {
      if (!timestamp || !timestamp.toDate) return '—';
      return timestamp.toDate().toLocaleString();
    };

    const formatBoolean = (value) => {
      if (value === true) return '<span style="color: green; font-weight: bold;">✔ Yes</span>';
      if (value === false) return '<span style="color: red;">✖ No</span>';
      return '—';
    };

    prof.innerHTML = `
      <div style="position:relative">
        <img class="cover" src="${d.bannerUrl || 'assets/images/placeholder-wide.jpg'}">
        <img class="avatar" src="${d.photoUrl || 'assets/images/placeholder.jpg'}">
      </div>
      <div class="pd-body">
        <h3 style="margin:0">${d.name || 'Unnamed'} ${d.verified === true ? ' <i class="mdi mdi-check-decagram text-primary"></i>' : ''}</h3>
        <p class="text-muted" style="margin:4px 0">${d.location || ''}</p>
        
        <p style="margin-top: 16px;"><strong>Bio:</strong><br>${d.bio || '—'}</p>

        <div class="pd-grid" style="margin-top: 20px;">
          <div class="pd-item"><div class="pd-label">UID</div><div class="pd-val">${uid}</div></div>
          <div class="pd-item"><div class="pd-label">Email</div><div class="pd-val">${d.email || '—'}</div></div>
          <div class="pd-item"><div class="pd-label">DOB</div><div class="pd-val">${d.dob || '—'}</div></div>
          <div class="pd-item"><div class="pd-label">Gender</div><div class="pd-val">${d.gender || '—'}</div></div>
          <div class="pd-item"><div class="pd-label">Relationship Status</div><div class="pd-val">${d.relationship || '—'}</div></div>
          <div class="pd-item"><div class="pd-label">Followers</div><div class="pd-val">${d.followers || 0}</div></div>
          <div class="pd-item"><div class="pd-label">Following</div><div class="pd-val">${d.following || 0}</div></div>
          <div class="pd-item"><div class="pd-label">Post Count</div><div class="pd-val">${d.postCount || 0}</div></div>
          <div class="pd-item"><div class="pd-label">Coins</div><div class="pd-val">${d.coin || 0}</div></div>
          <div class="pd-item"><div class="pd-label">Total Received</div><div class="pd-val">${d.totalReceived || 0}</div></div>
          <div class="pd-item"><div class="pd-label">Total Sent</div><div class="pd-val">${d.totalSent || 0}</div></div>
          <div class="pd-item"><div class="pd-label">Total Recharge</div><div class="pd-val">${d.totalRecharge || 0}</div></div>
          <div class="pd-item"><div class="pd-label">Gift Count</div><div class="pd-val">${d.giftCount || 0}</div></div>
          <div class="pd-item"><div class="pd-label">Income</div><div class="pd-val">${d.income || 0}</div></div>
          <div class="pd-item"><div class="pd-label">Online Status</div><div class="pd-val">${formatBoolean(d.online)}</div></div>
          <div class="pd-item"><div class="pd-label">Host</div><div class="pd-val">${formatBoolean(d.host)}</div></div>
          <div class="pd-item"><div class="pd-label">Verified</div><div class="pd-val">${formatBoolean(d.verified)}</div></div>
          <div class="pd-item"><div class="pd-label">Last Seen</div><div class="pd-val">${formatTimestamp(d.lastSeen)}</div></div>
          <div class="pd-item"><div class="pd-label">Last Updated</div><div class="pd-val">${formatTimestamp(d.lastUpdated)}</div></div>
          <div class="pd-item" style="grid-column: 1 / -1;"><div class="pd-label">FCM Token</div><div class="pd-val" style="white-space: normal; word-break: break-all;">${d.fcmToken || '—'}</div></div>
        </div>
      </div>`;
  } catch (e) {
    console.error(e);
    if(prof) prof.textContent = 'Error loading profile.';
  } finally {
    // This block is crucial. It ensures the loader is hidden
    // even if there was an error fetching the data.
    hideLoader();
  }
}