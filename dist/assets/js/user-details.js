document.addEventListener('auth-ready', () => {
  if (window.location.pathname.includes('user-details.html')) {
    loadUserDetails();
  }
});

// Global variable to hold the current user's data
let currentUserData = null;
const uid = new URLSearchParams(location.search).get('id');

async function loadUserDetails() {
  if (!uid) {
    window.location.href = 'users.html';
    return;
  }

  const profileContainer = document.getElementById('profile-container');
  if (!profileContainer) {
    console.error("Profile container not found!");
    hideLoader();
    return;
  }

  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) throw new Error('User not found');

    currentUserData = doc.data();
    // Initially, render the complete read-only view
    renderDisplayView(profileContainer, currentUserData);

  } catch (e) {
    console.error(e);
    if(profileContainer) profileContainer.textContent = 'Error loading profile.';
  } finally {
    hideLoader();
  }
}

// Renders the complete, read-only view of all user details
function renderDisplayView(container, d) {
  const bannerUrl = d.coverUrl || 'assets/images/test.jpg'; // Using your corrected logic
  
  container.innerHTML = `
    <div style="position:relative">
      <img class="cover" src="${bannerUrl}" alt="Cover photo">
      <img class="avatar" src="${d.photoUrl || 'assets/images/placeholder.jpg'}">
    </div>
    <div class="pd-body">
      <h3 style="margin:0">${d.name || 'Unnamed'} ${d.verified === true ? ' <i class="mdi mdi-check-decagram text-primary"></i>' : ''}</h3>
      <p class="text-muted" style="margin:4px 0">${d.location || ''}</p>
      <p style="margin-top: 16px;"><strong>Bio:</strong><br>${d.bio || '—'}</p>
      <div class="pd-grid" style="margin-top: 20px;">
        <div class="pd-item"><div class="pd-label">UID</div><div class="pd-val">${uid}</div></div>
        <div class="pd-item"><div class="pd-label">Login ID</div><div class="pd-val">${d.loginId || '—'}</div></div>
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
      </div>
    </div>`;
}

// Renders the editable form view (only showing editable fields)
function renderEditView(container, d) {
  container.innerHTML = `
    <form id="edit-user-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" class="form-control" id="email" value="${d.email || ''}">
      </div>
      <div class="form-group">
        <label for="dob">Date of Birth</label>
        <input type="text" class="form-control" id="dob" value="${d.dob || ''}" placeholder="YYYY-MM-DD">
      </div>
      <div class="form-group">
        <label for="gender">Gender</label>
        <select class="form-control" id="gender">
          <option value="Male" ${d.gender === 'Male' ? 'selected' : ''}>Male</option>
          <option value="Female" ${d.gender === 'Female' ? 'selected' : ''}>Female</option>
          <option value="Other" ${d.gender === 'Other' ? 'selected' : ''}>Other</option>
        </select>
      </div>
      <div class="form-group">
        <label for="relationship">Relationship Status</label>
        <select class="form-control" id="relationship">
          <option value="Single" ${d.relationship === 'Single' ? 'selected' : ''}>Single</option>
          <option value="In a relationship" ${d.relationship === 'In a relationship' ? 'selected' : ''}>In a relationship</option>
          <option value="Married" ${d.relationship === 'Married' ? 'selected' : ''}>Married</option>
        </select>
      </div>
      <div class="form-group">
        <label for="verified">Verified Status</label>
        <select class="form-control" id="verified">
          <option value="true" ${d.verified === true ? 'selected' : ''}>Verified</option>
          <option value="false" ${d.verified === false ? 'selected' : ''}>Not Verified</option>
        </select>
      </div>
      <button type="submit" class="btn btn-gradient-success me-2">Save Changes</button>
      <button type="button" id="cancel-edit-btn" class="btn btn-light">Cancel</button>
    </form>`;

    document.getElementById('edit-user-form').addEventListener('submit', handleSaveChanges);
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
      renderDisplayView(document.getElementById('profile-container'), currentUserData);
    });
}

// Handles the form submission to save changes
async function handleSaveChanges(event) {
  event.preventDefault();
  
  const updatedData = {
    email: document.getElementById('email').value,
    dob: document.getElementById('dob').value,
    gender: document.getElementById('gender').value,
    relationship: document.getElementById('relationship').value,
    verified: document.getElementById('verified').value === 'true'
  };

  try {
    await db.collection('users').doc(uid).update(updatedData);
    alert('User updated successfully!');
    loadUserDetails(); // Reload data to show the updated view
  } catch (error) {
    console.error("Error updating user:", error);
    alert('Failed to update user. See console for details.');
  }
}

// Helper to format boolean values
function formatBoolean(value) {
  if (value === true) return '<span style="color: green; font-weight: bold;">✔ Yes</span>';
  if (value === false) return '<span style="color: red;">✖ No</span>';
  return '—';
}

// Helper to format timestamps
function formatTimestamp(timestamp) {
    if (!timestamp || !timestamp.toDate) return '—';
    return timestamp.toDate().toLocaleString();
}

// Initial setup of the main edit button
document.getElementById('edit-user-btn').addEventListener('click', () => {
  if (currentUserData) {
    renderEditView(document.getElementById('profile-container'), currentUserData);
  }
});