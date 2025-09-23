document.addEventListener('DOMContentLoaded', function () {
  console.log("Rooms.js script loaded.");
  const db = firebase.firestore();
  const tableBody = document.getElementById('rooms-table-body');
  const body = document.querySelector('body');

  if (!db) {
    console.error("Firebase Firestore is not initialized!");
    body.classList.remove('is-loading');
    return;
  }

  async function getUserData(uid) {
    if (!uid) {
      console.warn("getUserData called with no UID.");
      return null;
    }
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        return userDoc.data();
      } else {
        console.warn(`No user found with uid: ${uid}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching user data for UID: ${uid}`, error);
      return null;
    }
  }

  async function fetchRooms() {
    console.log("Attempting to fetch rooms from 'partyRooms' collection...");
    try {
      const snapshot = await db.collection('partyRooms').get();
      console.log(`Query successful. Found ${snapshot.size} documents.`);

      if (snapshot.empty) {
        tableBody.innerHTML = '<tr><td colspan="6">No rooms found in the database.</td></tr>';
        body.classList.remove('is-loading');
        return;
      }

      let roomsHtml = '';
      let processedCount = 0;
      for (const doc of snapshot.docs) {
        processedCount++;
        console.log(`Processing room ${processedCount}/${snapshot.size}, ID: ${doc.id}`);
        const room = doc.data();
        const roomId = doc.id;
        
        const creatorData = await getUserData(room.createdBy); 
        const creatorName = creatorData ? creatorData.name : 'Unknown User';

        roomsHtml += `
          <tr>
            <td>
              <img src="${room.photoURL || 'assets/images/logo.jpg'}" class="me-2" alt="image" style="width: 50px; height: 50px; border-radius: 5px;">
            </td>
            <td>${room.title || 'No Title'}</td>
            <td>${room.theme || 'No Theme'}</td>
            <td>${creatorName}</td>
            <td>${roomId}</td>
            <td>
              <a href="room-details.html?id=${roomId}" class="btn btn-gradient-info btn-sm">View Details</a>
            </td>
          </tr>
        `;
      }
      tableBody.innerHTML = roomsHtml;
      console.log("Successfully rendered all rooms.");

    } catch (error) {
      console.error("CRITICAL: Error fetching rooms collection. Check Firestore Security Rules.", error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-danger">Error: Could not load rooms. Check the console for details.</td></tr>`;
    } finally {
      body.classList.remove('is-loading');
    }
  }

  fetchRooms();
});