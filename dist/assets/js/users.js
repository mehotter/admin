// assets/js/users.js

async function loadUsers() {
  const tableBody = document.getElementById('users-table-body');
  if (!tableBody) {
    hideLoader(); // Hide loader if table isn't on the page for some reason
    return;
  }
  
  tableBody.innerHTML = ''; // Start with an empty table body

  try {
    const snap = await db.collection('users').get();
    if (snap.empty) {
      tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No users found.</td></tr>';
      return;
    }

    const formatOnlineStatus = (isOnline) => {
      if (isOnline === true) {
        return '<i class="mdi mdi-check-circle" style="color: green; font-size: 1.2rem;" title="Online"></i>';
      }
      return '<i class="mdi mdi-close-circle" style="color: red; font-size: 1.2rem;" title="Offline"></i>';
    };

    const formatVerifiedStatus = (isVerified) => {
      if (isVerified === true) {
        return '<i class="mdi mdi-check-circle" style="color: green; font-size: 1.2rem;" title="Verified"></i>';
      }
      return '<i class="mdi mdi-close-circle" style="color: red; font-size: 1.2rem;" title="Not Verified"></i>';
    };

    snap.forEach(doc => {
      const d = doc.data();
      const row = document.createElement('tr');
      const photoUrl = d.photoUrl || 'assets/images/faces/face1.jpg';

      row.innerHTML = `
        <td>
          <img src="${photoUrl}" class="me-2" alt="image">
          ${d.name || 'Unnamed'}
        </td>
        <td>${d.email || '—'}</td>
        <td>${d.location || '—'}</td>
        <td>
            <label class="badge badge-gradient-success">${d.level || 0}</label>
        </td>
        <td style="text-align: center;">${formatOnlineStatus(d.online)}</td>
        <td style="text-align: center;">${formatVerifiedStatus(d.verified)}</td>
        <td>${doc.id}</td>
        <td>
          <a href="user-details.html?id=${doc.id}" class="btn btn-gradient-primary btn-sm">View</a>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (e) {
    console.error(e);
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: red;">Failed to load users.</td></tr>';
  } finally {
    hideLoader();
  }
}