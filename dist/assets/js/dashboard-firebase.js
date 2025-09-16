// dashboard-firebase.js – Unified Firestore integration with safe fallbacks

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Starting admin panel with Firestore...');

  setTimeout(() => {
    console.log('🔍 Getting data from Firestore...');
    getTotalUsers();
    getTotalIncome();
    getTotalTransactions();
  }, 2000);
});

function getTotalUsers() {
  console.log('👥 Trying to get total users from Firestore...');
  if (typeof db !== 'undefined') {
    db.collection('users').get().then((snapshot) => {
      const totalUsers = snapshot.size;
      console.log('✅ Total users from Firestore:', totalUsers);
      updateUsersCard(totalUsers);
    }).catch((error) => {
      console.warn('⚠️ Failed to fetch users, setting to 0', error);
      updateUsersCard(0);
    });
  } else {
    console.warn('⚠️ Firestore not available, setting users to 0');
    updateUsersCard(0);
  }
}

function getTotalIncome() {
  console.log('💰 Trying to get total income from Firestore...');
  if (typeof db !== 'undefined') {
    db.collection('transactions').get().then((querySnapshot) => {
      let totalIncome = 0;
      querySnapshot.forEach((doc) => {
        const tx = doc.data();
        if (tx.status === 'success') totalIncome += tx.amount || 0;
      });
      console.log('✅ Total income from Firestore:', totalIncome);
      updateIncomeCard(totalIncome);
    }).catch((error) => {
      console.warn('⚠️ Failed to fetch income, setting to 0', error);
      updateIncomeCard(0);
    });
  } else {
    console.warn('⚠️ Firestore not available, setting income to 0');
    updateIncomeCard(0);
  }
}

function getTotalTransactions() {
  console.log('📊 Trying to get transaction stats from Firestore...');
  if (typeof db !== 'undefined') {
    db.collection('transactions').get().then((snapshot) => {
      let total = 0, success = 0, failed = 0;
      snapshot.forEach((doc) => {
        const tx = doc.data();
        total++;
        if (tx.status === 'success') success++;
        else if (tx.status === 'failed') failed++;
      });
      const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
      console.log('✅ Transaction stats:', { total, success, failed, successRate });
      updateTransactionsCard(total, success, failed, successRate);
      updatePieChart(success, failed, successRate);
    }).catch((error) => {
      console.warn('⚠️ Failed to fetch transactions, setting to zeros', error);
      updateTransactionsCard(0, 0, 0, 0);
      updatePieChart(0, 0, 0);
    });
  } else {
    console.warn('⚠️ Firestore not available, setting transactions to zeros');
    updateTransactionsCard(0, 0, 0, 0);
    updatePieChart(0, 0, 0);
  }
}

function updateUsersCard(totalUsers) {
  console.log('🎯 Updating Total Users card:', totalUsers);
  try {
    document.querySelectorAll('.card-body').forEach(card => {
      const h4 = card.querySelector('h4');
      if (h4 && /Weekly Sales|Total Users/.test(h4.textContent)) {
        h4.innerHTML = 'Total Users <i class="ti-user ml-1"></i>';
        card.querySelectorAll('*').forEach(el => {
          // Replace any number in that card with totalUsers
          if (/\d/.test(el.textContent)) {
            el.textContent = totalUsers.toLocaleString();
          }
        });
      }
    });
  } catch (e) {
    console.error('❌ Error in updateUsersCard:', e);
  }
}

function updateIncomeCard(totalIncome) {
  console.log('🎯 Updating Total Income card:', totalIncome);
  try {
    document.querySelectorAll('.card-body').forEach(card => {
      const h4 = card.querySelector('h4');
      if (h4 && /Weekly Orders|Total Income/.test(h4.textContent)) {
        h4.innerHTML = 'Total Income <i class="ti-money ml-1"></i>';
        card.querySelectorAll('*').forEach(el => {
          if (/\d|₹/.test(el.textContent)) {
            el.textContent = '₹ ' + totalIncome.toLocaleString();
          }
        });
      }
    });
  } catch (e) {
    console.error('❌ Error in updateIncomeCard:', e);
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
          if (/\d/.test(el.textContent)) {
            el.textContent = total.toLocaleString();
          }
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
      if (li.textContent.includes('Search Engines')) {
        li.textContent = `Successful ${rate}%`;
      }
      if (li.textContent.includes('Direct Click')) {
        li.textContent = `Failed ${100 - rate}%`;
      }
      if (li.textContent.includes('Bookmarks Click')) {
        li.textContent = `Total: ${success + failed}`;
      }
    });
  } catch (e) {
    console.error('❌ Error in updatePieChart:', e);
  }
}
