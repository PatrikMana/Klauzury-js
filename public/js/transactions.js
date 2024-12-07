document.getElementById('add-transaction').addEventListener('click', () => {
  document.getElementById('addTransactionPopup').style.display = 'flex';  // Otevřít popup
});

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

// Načteme transakce a zobrazíme je v tabulce (s limitem 6)
async function loadTransactions() {
  const token = localStorage.getItem('authToken');
  if (!token) {
      window.location.href = '/login.html';
      return;
  }

  try {
      const response = await fetch('/api/transactions', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
          },
      });

      if (!response.ok) {
          console.error('Chyba při načítání transakcí.');
          return;
      }

      const transactions = await response.json();
      displayTransactions(transactions);
  } catch (error) {
      console.error('Chyba při načítání transakcí:', error);
  }
}

// Funkce pro zobrazení transakcí v tabulce
function displayTransactions(transactions) {
  const transactionTableBody = document.getElementById('transactions-table-body');
  if (!transactionTableBody) {
      console.error('Element "transactions-table-body" nebyl nalezen.');
      return;
  }

  transactionTableBody.innerHTML = ''; // Vyprázdníme předchozí obsah

  // Nastavíme limit zobrazených transakcí (6)
  const limitedTransactions = transactions.slice(0, 6);
  limitedTransactions.forEach(transaction => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${transaction.name}</td>
          <td>${transaction.date}</td>
          <td>${transaction.recurring ? 'Pravidelná' : 'Jednorázová'}</td>
          <td class="amount ${transaction.amount < 0 ? 'negative' : 'positive'}">${transaction.amount} Kč</td>
      `;
      transactionTableBody.appendChild(row);
  });

  // Pokud máme více než 6 transakcí, zobrazíme tlačítko pro zobrazení dalších
  if (transactions.length > 6) {
      const showMoreButton = document.getElementById('show-more');
      showMoreButton.style.display = 'block';
  }
}

// Funkce pro odeslání nové transakce
document.getElementById('transaction-popup-confirm').addEventListener('click', async () => {
  const name = document.getElementById('transaction-name').value;
  const amount = document.getElementById('transaction-amount').value;
  const date = document.getElementById('transaction-date').value;
  const isRecurring = document.getElementById('transaction-recurring').checked;
  const type = document.querySelector('input[name="transactionType"]:checked').value; // Výdaj nebo Příjem

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
              amount: parseFloat(amount),
              date: date,
              isRecurring: isRecurring,
              type: type,
          }),
      });

      if (!response.ok) {
          console.error('Chyba při ukládání transakce.');
          return;
      }

      // Po úspěšném odeslání transakce
      document.getElementById('addTransactionPopup').style.display = 'none'; // Zavřít popup

      // Zobrazíme alert okno s úspěšným přidáním
      alert('Transakce byla úspěšně přidána!');

      // Načteme znovu transakce
      loadTransactions();
  } catch (error) {
      console.error('Chyba při ukládání transakce:', error);
  }
});

// Zobrazení dalších transakcí (pokud existují)
document.getElementById('show-more').addEventListener('click', async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
      window.location.href = '/login.html';
      return;
  }

  try {
      const response = await fetch('/api/transactions', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
          },
      });

      if (!response.ok) {
          console.error('Chyba při načítání transakcí.');
          return;
      }

      const transactions = await response.json();
      displayTransactions(transactions);
      document.getElementById('show-more').style.display = 'none'; // Skryjeme tlačítko po zobrazení všech transakcí
  } catch (error) {
      console.error('Chyba při načítání transakcí:', error);
  }
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
  } catch (error) {
      console.error('Chyba při získávání měsíčního přehledu:', error);
  }
}

// Funkce pro aktualizaci přehledu
function updateSummary(summary) {
  document.getElementById('income').textContent = summary.income + ' Kč';
  document.getElementById('expenses').textContent = summary.expenses + ' Kč';
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

// Zavoláme při načítání stránky
loadTransactions();
loadSummary();
loadUserProfile();