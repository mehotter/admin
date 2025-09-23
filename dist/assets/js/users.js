// Listen for the custom 'auth-ready' event from main-auth.js
document.addEventListener('auth-ready', () => {
  // Only run the user page logic if this is the users.html page
  if (window.location.pathname.includes('users.html')) {
    loadUsers();
  }
});

let allUsers = [];
let currentlyDisplayedUsers = [];

async function loadUsers() {
  const tableBody = document.getElementById('users-table-body');
  if (!tableBody) {
    hideLoader();
    return;
  }
  
  tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Fetching user data...</td></tr>';

  try {
    const snap = await db.collection('users').get();
    if (snap.empty) {
      tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No users found in the database.</td></tr>';
      return;
    }

    allUsers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    setupUserControls();
    
    applyFiltersAndSort();

  } catch (e) {
    console.error("Failed to load users:", e);
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: red;">Failed to load users.</td></tr>';
  } finally {
    hideLoader();
  }
}

function applyFiltersAndSort() {
  let processedUsers = [...allUsers];
  
  const searchTerm = document.getElementById('filter-input').value.toLowerCase();
  const onlineStatus = document.getElementById('filter-online').value;
  const verifiedStatus = document.getElementById('filter-verified').value;
  const sortValue = document.getElementById('sort-select').value;

  if (searchTerm) {
    processedUsers = processedUsers.filter(user =>
      (user.name?.toLowerCase().includes(searchTerm) ||
       user.email?.toLowerCase().includes(searchTerm))
    );
  }

  if (onlineStatus !== 'all') {
    processedUsers = processedUsers.filter(user => user.online === (onlineStatus === 'true'));
  }

  if (verifiedStatus !== 'all') {
    processedUsers = processedUsers.filter(user => user.verified === (verifiedStatus === 'true'));
  }

  const [field, direction] = sortValue.split('-');
  processedUsers.sort((a, b) => {
    const valA = a[field] || (field === 'level' ? 0 : '');
    const valB = b[field] || (field === 'level' ? 0 : '');
    
    let comparison = 0;
    if (valA > valB) comparison = 1;
    else if (valA < valB) comparison = -1;
    return (direction === 'asc') ? comparison : -comparison;
  });

  currentlyDisplayedUsers = processedUsers;
  displayUsers(processedUsers);
}

function displayUsers(users) {
  const tableBody = document.getElementById('users-table-body');
  tableBody.innerHTML = '';

  if (users.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No users match the filters.</td></tr>';
    return;
  }

  users.forEach(user => {
    const row = document.createElement('tr');
    const photoUrl = user.photoUrl || 'assets/images/faces/face1.jpg';

    row.innerHTML = `
      <td><img src="${photoUrl}" class="me-2" alt="image"> ${user.name || 'Unnamed'}</td>
      <td>${user.email || '—'}</td>
      <td>${user.location || '—'}</td>
      <td><label class="badge badge-gradient-success">${user.level || 0}</label></td>
      <td style="text-align: center;">${formatStatus(user.online)}</td>
      <td style="text-align: center;">${formatStatus(user.verified)}</td>
      <td>${user.id}</td>
      <td><a href="user-details.html?id=${user.id}" class="btn btn-gradient-primary btn-sm">View</a></td>
    `;
    tableBody.appendChild(row);
  });
}

function formatStatus(isTrue) {
  if (isTrue === true) return '<i class="mdi mdi-check-circle" style="color: green; font-size: 1.2rem;"></i>';
  return '<i class="mdi mdi-close-circle" style="color: red; font-size: 1.2rem;"></i>';
}

function setupUserControls() {
  document.getElementById('apply-filters').addEventListener('click', applyFiltersAndSort);

  document.getElementById('reset-filters').addEventListener('click', () => {
    document.getElementById('filter-input').value = '';
    document.getElementById('filter-online').value = 'all';
    document.getElementById('filter-verified').value = 'all';
    document.getElementById('sort-select').value = 'name-asc';
    applyFiltersAndSort();
  });

  document.getElementById('download-csv').addEventListener('click', () => {
    if (allUsers.length === 0) {
      alert("No data to download.");
      return;
    }
    const csv = Papa.unparse(allUsers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "all-users-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}