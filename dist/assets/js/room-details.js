function startRoomDetails() {
  console.log("startRoomDetails() has been called.");
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('id');
  const body = document.querySelector('body');

  if (!roomId) {
    document.getElementById('room-details-container').innerHTML = '<p class="text-danger">No Room ID provided.</p>';
    if (body) body.classList.remove('is-loading');
    return;
  }

  const db = firebase.firestore();

  async function fetchRoomDetails() {
    try {
      const docRef = db.collection('partyRooms').doc(roomId);
      const doc = await docRef.get();

      if (doc.exists) {
        const room = doc.data();
        displayRoomDetails(room, doc.id);

        if (room.members && Array.isArray(room.members) && room.members.length > 0) {
          fetchAndDisplayMembers(room.members);
        } else {
          document.getElementById('members-list').innerHTML = '<p>No members in this room.</p>';
        }

      } else {
        document.getElementById('room-details-container').innerHTML = `<p class="text-danger">No room found with ID: ${roomId}</p>`;
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
      document.getElementById('room-details-container').innerHTML = `<p class="text-danger">Error loading room data. Check security rules and collection name.</p>`;
    } finally {
      if (body) body.classList.remove('is-loading');
    }
  }

  function displayRoomDetails(room, roomId) {
    document.getElementById('room-title').textContent = room.title || 'N/A';
    document.getElementById('room-id').textContent = roomId;
    document.getElementById('room-theme').textContent = room.theme || 'N/A';
    document.getElementById('room-creator-id').textContent = room.createdBy || 'N/A';
    document.getElementById('room-image').src = room.photoURL || 'assets/images/logo.jpg';
    
    const membersCount = room.members ? room.members.length : 0;
    document.getElementById('room-members-count').textContent = `${membersCount} Members`;
  }

  async function fetchAndDisplayMembers(memberUids) {
    const membersList = document.getElementById('members-list');
    let html = '';
    
    for (const uid of memberUids) {
      try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
          const user = userDoc.data();
          html += `
            <div class="member-item">
              <img src="${user.photoURL || 'assets/images/faces/face1.jpg'}" alt="${user.name}" />
              <div>
                <strong>${user.name || 'Unknown Name'}</strong>
                <p class="text-muted">${uid}</p>
              </div>
            </div>
          `;
        } else {
           html += `<div class="member-item"><p>Unknown user: ${uid}</p></div>`;
        }
      } catch (error) {
        console.error(`Failed to fetch user ${uid}`, error);
        html += `<div class="member-item"><p>Error loading user: ${uid}</p></div>`;
      }
    }
    membersList.innerHTML = html;
  }

  const deleteBtn = document.getElementById('delete-room-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const isConfirmed = confirm(`Are you sure you want to permanently delete this room? This action cannot be undone.`);
      if (isConfirmed) {
        try {
          deleteBtn.disabled = true;
          deleteBtn.textContent = 'Deleting...';
          await db.collection('partyRooms').doc(roomId).delete();
          alert('Room successfully deleted.');
          window.location.href = 'rooms.html'; 
        } catch (error) {
          console.error("Error deleting room:", error);
          alert(`Failed to delete room. Please check the console for errors.`);
          deleteBtn.disabled = false;
          deleteBtn.textContent = 'Delete Room';
        }
      }
    });
  }

  fetchRoomDetails();
}