// dashboard-firebase.js – Fetch and display Total Users, Total Income (20% of gifts), Total Transactions, and Transaction Stats pie chart

// Ensure Firebase Auth and Firestore SDKs are loaded in HTML before this script
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const db   = firebase.firestore();

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location = 'login.html';
  } else {
    console.log('🔐 Admin authenticated:', user.email);
    setTimeout(() => {
      getTotalUsers();
      getTotalIncome();
      getTotalTransactions();
    }, 2000);
  }
});

function getTotalUsers() {
  console.log('👥 Fetching total users...');
  db.collection('users').get()
    .then(snapshot => {
      const totalUsers = snapshot.size;
      console.log('✅ Users:', totalUsers);
      updateUsersCard(totalUsers);
    })
    .catch(err => {
      console.warn('⚠️ Users fetch failed:', err);
      updateUsersCard(0);
    });
}

function getTotalIncome() {
  console.log('💰 Calculating total income as 20% of all users\' received...');
  db.collection('users').get()
    .then(snapshot => {
      let totalReceivedSum = 0;
      snapshot.forEach(doc => {
        const totalReceived = doc.data().received || 0;  // Use 'received' field
        totalReceivedSum += totalReceived;
      });
      const totalIncome = Math.round(totalReceivedSum * 0.2 * 100) / 100; // 20%
      console.log('✅ Sum of received:', totalReceivedSum);
      console.log('💰 Total income (20%):', totalIncome);
      updateIncomeCard(totalIncome);
    })
    .catch(err => {
      console.error('❌ Error fetching users for income calculation:', err);
      updateIncomeCard(0);
    });
}



function getTotalTransactions() {
  console.log('📊 Fetching transaction stats...');
  db.collection('transactions').get()
    .then(snapshot => {
      let total = 0, success = 0, failed = 0;
      snapshot.forEach(doc => {
        total++;
        const s = doc.data().status;
        if (s === 'success') success++;
        else if (s === 'failed') failed++;
      });
      const rate = total ? Math.round((success / total) * 100) : 0;
      console.log('✅ Transactions:', { total, success, failed, rate });
      updateTransactionsCard(total, success, failed, rate);
      updatePieChart(success, failed, rate);
    })
    .catch(err => {
      console.warn('⚠️ Transaction stats fetch failed:', err);
      updateTransactionsCard(0, 0, 0, 0);
      updatePieChart(0, 0, 0);
    });
}

function updateUsersCard(n) {
  console.log('🎯 Updating Total Users card:', n);
  try {
    document.querySelectorAll('.card-body').forEach(card => {
      const h4 = card.querySelector('h4');
      if (h4 && /Weekly Sales|Total Users/.test(h4.textContent)) {
        h4.innerHTML = 'Total Users <i class="ti-user ml-1"></i>';
        card.querySelectorAll('*').forEach(el => {
          if (/\d/.test(el.textContent)) el.textContent = n.toLocaleString();
        });
      }
    });
  } catch (e) {
    console.error('❌ Error in updateUsersCard:', e);
  }
}

function updateIncomeCard(amount) {
  console.log('🎯 Updating Total Income card:', amount);

  try {
    // Find all card bodies and update the relevant card
    document.querySelectorAll('.card-body').forEach(card => {
      const h4 = card.querySelector('h4');
      if (h4 && /Weekly Orders|Total Income/.test(h4.textContent)) {
        // Update the card title with icon
        h4.innerHTML = 'Total Income <i class="ti-money ml-1"></i>';
        
        // Find all elements inside card with numbers or ₹ and update them
        card.querySelectorAll('*').forEach(el => {
          // Check if element contains digits or rupee symbol to update
          if (/\d|₹/.test(el.textContent)) {
            el.textContent = '₹ ' + amount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
          }
        });

        // Optionally update subtext below amount if exists
        const subText = card.querySelector('.sub-text, .text-muted, small, .description');
        if (subText) {
          subText.textContent = 'From 20% of total gifts received';
        }
      }
    });
  } catch (err) {
    console.error('❌ Error updating income card:', err);
  }
}


function updateTransactionsCard(total, success, failed, rate) {
  console.log('🎯 Updating Total Transactions card:', { total, success, failed, rate });
  try {
    document.querySelectorAll('.card-body').forEach(card => {
      const h4 = card.querySelector('h4');
      if (h4 && /Visitors Online|Total Transactions/.test(h4.textContent)) {
        h4.innerHTML = 'Total Transactions <i class="ti-receipt ml-1"></i>';
        card.querySelectorAll('*').forEach(el => {
          if (/\d/.test(el.textContent)) el.textContent = total.toLocaleString();
        });
        card.querySelectorAll('*').forEach(el => {
          if (/Success:|Failed:/.test(el.textContent)) {
            el.innerHTML = `Success: ${success} | Failed: ${failed}<br>Success Rate: ${rate}%`;
          }
        });
      }
    });
  } catch (e) {
    console.error('❌ Error in updateTransactionsCard:', e);
  }
}

function updatePieChart(success, failed, rate) {
  console.log('🥧 Updating pie chart with transaction stats:', { success, failed, rate });
  try {
    document.querySelectorAll('h4').forEach(h4 => {
      if (h4.textContent.includes('Traffic Sources')) {
        h4.textContent = 'Transaction Stats';
      }
    });
    document.querySelectorAll('li').forEach(li => {
      if (li.textContent.includes('Search Engines')) li.textContent = `Successful ${rate}%`;
      if (li.textContent.includes('Direct Click')) li.textContent = `Failed ${100 - rate}%`;
      if (li.textContent.includes('Bookmarks Click')) li.textContent = `Total: ${success + failed}`;
    });
  } catch (e) {
    console.error('❌ Error in updatePieChart:', e);
  }
}
