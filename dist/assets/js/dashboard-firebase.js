/**
 * This function is called by main-auth.js after the user is authenticated
 * and the page is ready.
 */
function startDashboard() {
  // Load all cards in parallel after a small paint delay
  setTimeout(() => {
    getTotalUsers();
    getTotalTransactions();
    getTotalIncome();
  }, 300);
}

// ---------- Users ----------
async function getTotalUsers() {
  try {
    const snap = await db.collection('users').get();
    const totalUsers = snap.size;
    updateUsersCard(totalUsers);
    console.log('Users count:', totalUsers);
  } catch (err) {
    console.error('Users fetch error:', err);
    updateUsersCard(0);
  }
}

// ---------- Transactions (UPDATED) ----------
async function getTotalTransactions() {
  try {
    const snap = await db.collection('transactions').get();
    let totalCount = 0,
      successCount = 0,
      failedCount = 0,
      successfulValue = 0; // This will hold the sum of successful transaction amounts

    snap.forEach((doc) => {
      totalCount++;
      const data = doc.data();
      const status = (data.status || '').toLowerCase();

      if (status === 'success') {
        successCount++;
        // We now add the transaction amount to our total value
        if (data && typeof data.amount === 'number') {
          successfulValue += data.amount;
        }
      } else if (status === 'failed') {
        failedCount++;
      }
    });

    const rate = totalCount ? Math.round((successCount / totalCount) * 100) : 0;
    // Pass the new summed value to the card updater
    updateTransactionsCard(successfulValue, successCount, failedCount, rate);

    if (typeof updatePieChart === 'function') {
      updatePieChart(successCount, failedCount, totalCount - successCount - failedCount);
    }
  } catch (err) {
    console.error('Transactions fetch error:', err);
    updateTransactionsCard(0, 0, 0, 0);
  }
}

// ---------- Income (FIXED) ----------
async function getTotalIncome() {
  try {
    const snap = await db.collection('users').get();
    let totalReceivedValue = 0;
    snap.forEach(doc => {
      const userData = doc.data();
      // FIXED: Corrected typo from "totalRecived" to "totalReceived"
      if (userData && typeof userData.totalReceived === 'number') {
        totalReceivedValue += userData.totalReceived;
      }
    });
    const totalIncome = totalReceivedValue * 0.20;
    updateIncomeCard(totalIncome);
  } catch (err)
 {
    console.error('Income fetch error:', err);
    updateIncomeCard(0);
  }
}


// ---------- Card Updaters ----------
function updateUsersCard(total) {
  const card = document.querySelector('[data-card-id="total-users"] .card-body');
  setCardNumber(card, total);
}

// UPDATED: This function now handles the new data format
function updateTransactionsCard(value, successCount, failedCount, rate) {
  const card = document.querySelector('[data-card-id="total-transactions"] .card-body');
  // Display the total value of transactions in currency format
  setCardCurrency(card, value);
  // Update the subtext to show counts and success rate
  setCardSubtext(card, `Success: ${successCount} | Failed: ${failedCount} | Rate: ${rate}%`);
}

function updateIncomeCard(amount) {
  const card = document.querySelector('[data-card-id="total-income"] .card-body');
  setCardCurrency(card, amount);
  setCardSubtext(card, '20% of all received funds');
}


// ---------- Card Helpers ----------
function setCardTitle(card, title, iconClass) {
  if (!card) return;
  let h4 = card.querySelector('h4');
  if (!h4) {
    h4 = document.createElement('h4');
    h4.className = 'font-weight-normal mb-3';
    card.prepend(h4);
  }
  h4.innerHTML = `${title} <i class="${iconClass} ml-1\"></i>`;
}

function setCardNumber(card, n) {
  if (!card) return;
  let main = card.querySelector('.card-metric');
  if (!main) {
    main = card.querySelector('h2'); // The template uses h2 for the main number
    if (main) main.classList.add('card-metric');
  }
  if (!main) {
    main = document.createElement('h2');
    main.className = 'card-metric mb-5';
    card.appendChild(main);
  }
  main.textContent = Number(n).toLocaleString();
}

function setCardCurrency(card, amount) {
  if (!card) return;
  let main = card.querySelector('.card-metric');
  if (!main) {
    main = card.querySelector('h2'); // The template uses h2 for the main number
    if (main) main.classList.add('card-metric');
  }
  if (!main) {
    main = document.createElement('h2');
    main.className = 'card-metric mb-5';
    card.appendChild(main);
  }
  // Ensure amount is treated as a number to prevent "NaN"
  const numericAmount = Number(amount) || 0;
  main.textContent = '₹ ' + numericAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function setCardSubtext(card, text) {
  if (!card) return;
  let sub = card.querySelector('.card-text');
  if (!sub) {
    sub = document.createElement('h6');
    sub.className = 'card-text';
    card.appendChild(sub);
  }
  sub.textContent = text;
}