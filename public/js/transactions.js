document.getElementById('add-transaction').addEventListener('click', () => {
  document.getElementById('addTransactionPopup').style.display = 'flex';  // Otevřít popup
  document.getElementById('transaction-name').value = '';
  document.getElementById('transaction-amount').value = '';
  document.getElementById('transaction-date').value = '';
  document.getElementById('transaction-recurring').checked = false;	
});

document.addEventListener('DOMContentLoaded', () => {
  loadMoreTransactions();
  loadSummary();
  loadUserProfile();
  loadTransactionsSummaryBar();
});

function formatNumber(number) {
  if (number === null || number === undefined || isNaN(number)) return 'N/A';
  return Number(number).toLocaleString('cs-CZ');
}

document.getElementById("transaction-popup-cancel").addEventListener('click', () => document.getElementById('addTransactionPopup').style.display = 'none')

// Funkce pro kontrolu platnosti tokenu při načtení stránky
async function checkAuthToken() {
  const token = localStorage.getItem('authToken');
  if (!token) {
      window.location.href = '/login.html';  // Pokud token není přítomen, přesměrujeme na přihlášení
      return;
  }

  try {
      const response = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
      });

      if (!response.ok) {
          console.error('Token není platný nebo vypršel.');
          localStorage.removeItem('authToken');
          window.location.href = '/login.html';
      }
  } catch (error) {
      console.error('Chyba při ověřování tokenu:', error);
      localStorage.removeItem('authToken');
      window.location.href = '/login.html';
  }
}

// Zavoláme tuto funkci při načítání stránky
checkAuthToken();

// Funkce pro odeslání nové transakce
document.getElementById('transaction-popup-confirm').addEventListener('click', async () => {
  const name = document.getElementById('transaction-name').value;
  const amount = document.getElementById('transaction-amount').value;
  const date = document.getElementById('transaction-date').value;
  const isRecurring = document.getElementById('transaction-recurring').checked;
  const type = document.querySelector('input[name="transactionType"]:checked').value; // Výdaj nebo Příjem

  const adjustedAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

  const token = localStorage.getItem('authToken');
  if (!token) {
      window.location.href = '/login.html';
      return;
  }

  try {
      const response = await fetch('/api/transactions/addtransaction', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
              name: name,
              amount: parseFloat(adjustedAmount),
              date: date,
              isRecurring: isRecurring,
              type: type,
          }),
      });

      if (!response.ok) {
        console.error('Chyba při ukládání transakce.');
        return;
      }

      name.value = '';
      amount.value = '';
      date.value = '';
      isRecurring.checked = false;

      // Po úspěšném odeslání transakce
      document.getElementById('addTransactionPopup').style.display = 'none'; // Zavřít popup

      // Zobrazíme alert okno s úspěšným přidáním
      alert('Transakce byla úspěšně přidána!');
      
  } catch (error) {
      console.error('Chyba při ukládání transakce:', error);
  }
  refreshTransactions()
});

// Funkce pro výpočet příjmů a výdajů za aktuální měsíc
async function loadSummary() {
  const token = localStorage.getItem('authToken');
  if (!token) {
      window.location.href = '/login.html';
      return;
  }

  try {
      const response = await fetch('/api/dashboard/summary', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
          },
      });

      if (!response.ok) {
          console.error('Chyba při získávání měsíčního přehledu.');
          return;
      }

      const summary = await response.json();
      updateSummary(summary);
      const totalAmount = summary.income + summary.expenses; // Součet příjmů a výdajů
      document.getElementById('transactions-total-amount').textContent = (totalAmount >= 0 ? '+ ' : '- ') + formatNumber(Math.abs(totalAmount)) + ' Kč';
  } catch (error) {
      console.error('Chyba při získávání měsíčního přehledu:', error);
  }
}

// Funkce pro aktualizaci přehledu
function updateSummary(summary) {
  document.getElementById('income').textContent = formatNumber(summary.income) + ' Kč';
  document.getElementById('expenses').textContent = formatNumber(summary.expenses) + ' Kč';
}

async function loadTransactionsSummaryBar() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login.html';
      return;
    }

    const response = await fetch('/api/transactions/summary', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch transactions summary.');
      return;
    }

    const { income, expenses } = await response.json();

    // Výpočet procent příjmů a výdajů
    const total = income + Math.abs(expenses); // Celkový objem příjmů a výdajů
    const incomePercentage = total === 0 ? 50 : (income / total) * 100;
    const expensesPercentage = total === 0 ? 50 : (Math.abs(expenses) / total) * 100;

    // Aktualizace šířky příjmové a výdajové části progress baru
    const incomeBar = document.querySelector('.income-bar');
    const expensesBar = document.querySelector('.expenses-bar');

    if (incomeBar && expensesBar) {
      incomeBar.style.width = `${incomePercentage}%`;
      expensesBar.style.width = `${expensesPercentage}%`;

      // Aktualizace textu uvnitř progress baru
      incomeBar.querySelector('.progress-text').textContent = `${incomePercentage.toFixed(0)}%`;
      expensesBar.querySelector('.progress-text').textContent = `${expensesPercentage.toFixed(0)}%`;

      if (incomePercentage < 10) {
        incomeBar.querySelector('.progress-text').style.display = 'none';
      }
      else if (expensesPercentage < 10) {
        expensesBar.querySelector('.progress-text').style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error while loading transactions summary bar:', error);
  }
}

// Odhlášení uživatele
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('authToken');
  window.location.href = '/login.html';
});

// Funkce pro načtení jména uživatele a aktualizaci UI
async function loadUserProfile() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch('/api/users/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.status === 401) {
      console.error('Token je neplatný nebo vypršel.');
      localStorage.removeItem('authToken');
      window.location.href = '/login.html';
      return;
    }

    if (!response.ok) {
      console.error('Chyba při načítání uživatelského profilu.');
      return;
    }

    const data = await response.json();
    updateUserName(data.username); // Funkce pro zobrazení jména
  } catch (error) {
    console.error('Chyba při načítání profilu:', error);
  }
}

// Funkce pro zobrazení jména uživatele v pravém dolním rohu
function updateUserName(username) {
  const usernameElement = document.getElementById('username');
  if (usernameElement) {
    usernameElement.textContent = username; // Defaultní jméno, pokud není k dispozici
  }
}

let offset = 0; // Track the current offset for paginated requests
const limit = 6; // Number of transactions to fetch at a time

// Function to append transactions to the table
function appendTransactions(transactions) {
  const transactionTableBody = document.getElementById('transactions-table-body');
  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    const formattedDate = transactionDate.toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${transaction.name}</td>
      <td>${formattedDate}</td>
      <td>${transaction.recurring ? 'Pravidelná' : 'Jednorázová'}</td>
      <td class="amount ${transaction.amount < 0 ? 'negative' : 'positive'}">${formatNumber(transaction.amount)} Kč</td>
    `;
    transactionTableBody.appendChild(row);
  });
}

// Function to load more transactions
async function loadMoreTransactions() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch(`/api/transactions?offset=${offset}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch transactions.');
      return;
    }

    const data = await response.json();
    const transactions = data.transactions;
    const totalTransactions = data.totalTransactions;

    appendTransactions(transactions);
    offset += transactions.length;

    const remainingTransactions = totalTransactions - offset;

    if (remainingTransactions === 0) {
      document.getElementById('show-more').style.display = 'none';
      return;
    }
  } catch (error) {
    console.error('Error while loading transactions:', error);
  }
}

// Function to refresh transactions after adding a new one
async function refreshTransactions() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch(`/api/transactions?offset=0&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch transactions.');
      return;
    }

    const data = await response.json();
    const transactions = data.transactions;

    // Vyčistíme tabulku a načteme nové transakce
    const transactionTableBody = document.getElementById('transactions-table-body');
    transactionTableBody.innerHTML = '';
    loadTransactionsSummaryBar()
    loadSummary()
    appendTransactions(transactions);

    offset = transactions.length; // Reset offset na počet načtených transakcí

    // Kontrola tlačítka "Zobrazit další"
    if (offset >= (data.totalTransactions)) {
      document.getElementById('show-more').style.display = 'none';
    } else {
      document.getElementById('show-more').style.display = 'block';
    }

  } catch (error) {
    console.error('Error while refreshing transactions:', error);
  }
}

// Přidání listeneru na tlačítko "Zobrazit další"
document.getElementById('show-more').addEventListener('click', loadMoreTransactions);