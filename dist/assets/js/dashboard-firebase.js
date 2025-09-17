// dashboard-firebase.js
// Protect dashboard, then load metrics once authenticated.

(function initDashboard() {
  // Require a signed-in session to view the dashboard
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = 'login.html'; // gate here only
      return;
    }
    console.log('Authenticated as:', user.email);
    startDashboard();
  });
})();

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

// ---------- Transactions ----------
async function getTotalTransactions() {
  try {
    const snap = await db.collection('transactions').get();
    let total = 0, success = 0, failed = 0;

    snap.forEach((doc) => {
      total++;
      const s = (doc.data().status || '').toLowerCase();
      if (s === 'success') success++;
      else if (s === 'failed') failed++;
    });

    const rate = total ? Math.round((success / total) * 100) : 0;
    updateTransactionsCard(total, success, failed, rate);
    updatePieChart(success, failed, rate);
    console.log('Transactions:', { total, success, failed, rate });
  } catch (err) {
    console.error('Transactions fetch error:', err);
    updateTransactionsCard(0, 0, 0, 0);
    updatePieChart(0, 0, 0);
  }
}

// ---------- Income (20% of gifts received) ----------
const INCOME_FIELD = 'received'; // change to 'totalReceived' or 'totalrecived' if needed

async function getTotalIncome() {
  try {
    let sum = 0;
    const snap = await db.collection('users').get();
    snap.forEach((doc) => {
      const v = Number(doc.data()?.[INCOME_FIELD]) || 0;
      sum += v;
    });
    const income = Math.round(sum * 0.2 * 100) / 100; // 20%, 2 decimals
    updateIncomeCard(income);
    console.log(`Income from 20% of ${INCOME_FIELD}:`, { sum, income });
  } catch (err) {
    console.error('Income calc error:', err);
    updateIncomeCard(0);
  }
}

// ---------- UI updates ----------
function updateUsersCard(n) {
  try {
    const card = findCardByTitle(/Total Users|Weekly Sales/);
    if (!card) return;
    setCardTitle(card, 'Total Users', 'ti-user');
    setCardNumber(card, n);
  } catch (e) {
    console.error('updateUsersCard error:', e);
  }
}

function updateIncomeCard(amount) {
  try {
    const card = findCardByTitle(/Total Income|Weekly Orders/);
    if (!card) return;
    setCardTitle(card, 'Total Income', 'ti-money');
    setCardCurrency(card, amount);
    setCardSubtext(card, 'From 20% of total gifts received');
  } catch (e) {
    console.error('updateIncomeCard error:', e);
  }
}

function updateTransactionsCard(total, success, failed, rate) {
  try {
    const card = findCardByTitle(/Total Transactions|Visitors Online/);
    if (!card) return;
    setCardTitle(card, 'Total Transactions', 'ti-receipt');
    setCardNumber(card, total);

    // If card has a stats line, render it; otherwise append one
    let statsEl = card.querySelector('.tx-stats');
    if (!statsEl) {
      statsEl = document.createElement('div');
      statsEl.className = 'tx-stats text-muted mt-1';
      card.appendChild(statsEl);
    }
    statsEl.innerHTML = `Success: ${success} • Failed: ${failed} • Rate: ${rate}%`;
  } catch (e) {
    console.error('updateTransactionsCard error:', e);
  }
}

function updatePieChart(success, failed, rate) {
  try {
    // Retitle the demo pie to Transaction Stats
    document.querySelectorAll('h4').forEach((h4) => {
      if (h4.textContent.includes('Traffic Sources')) h4.textContent = 'Transaction Stats';
    });
    document.querySelectorAll('li').forEach((li) => {
      if (li.textContent.includes('Search Engines')) li.textContent = `Successful ${rate}%`;
      if (li.textContent.includes('Direct Click')) li.textContent = `Failed ${Math.max(0, 100 - rate)}%`;
      if (li.textContent.includes('Bookmarks Click')) li.textContent = `Total: ${success + failed}`;
    });
  } catch (e) {
    console.error('updatePieChart error:', e);
  }
}

// ---------- Helpers ----------
function findCardByTitle(regex) {
  const bodies = document.querySelectorAll('.card-body');
  for (const body of bodies) {
    const h4 = body.querySelector('h4');
    if (h4 && regex.test(h4.textContent)) return body;
  }
  return null;
}

function setCardTitle(card, title, iconClass) {
  const h4 = card.querySelector('h4') || document.createElement('h4');
  h4.innerHTML = `${title} <i class="${iconClass} ml-1"></i>`;
  if (!card.contains(h4)) card.prepend(h4);
}

function setCardNumber(card, n) {
  // Find a prominent numeric element or create one
  let main = card.querySelector('.card-metric');
  if (!main) {
    main = document.createElement('h2');
    main.className = 'card-metric';
    card.appendChild(main);
  }
  main.textContent = Number(n).toLocaleString();
}

function setCardCurrency(card, amount) {
  let main = card.querySelector('.card-metric');
  if (!main) {
    main = document.createElement('h2');
    main.className = 'card-metric';
    card.appendChild(main);
  }
  main.textContent = '₹ ' + Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function setCardSubtext(card, text) {
  let sub = card.querySelector('.card-sub');
  if (!sub) {
    sub = document.createElement('small');
    sub.className = 'card-sub text-muted d-block';
    card.appendChild(sub);
  }
  sub.textContent = text;
}
