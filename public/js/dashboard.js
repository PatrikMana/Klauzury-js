// Formátování čísel
function formatNumber(number) {
  if (number === null || number === undefined || isNaN(number)) return 'N/A';
  return Number(number).toLocaleString('cs-CZ');
}

// Načtení dat z databáze
async function loadAccountData() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch('/api/users/balance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      console.error('Token je neplatný nebo vypršel.');
      localStorage.removeItem('authToken');
      window.location.href = '/login.html';
      return;
    }

    if (!response.ok) {
      console.error('Chyba při načítání dat.');
      return;
    }

    const data = await response.json();
    updatePageWithAccountData(data);
  } catch (error) {
    console.error('Chyba při načítání dat:', error);
  }
}

// Aktualizace dat na stránce
function updatePageWithAccountData({ accountBalance, accountGoal }) {
  document.getElementById('balance-amount').textContent = formatNumber(accountBalance) || 'N/A';
  document.getElementById('balance-goal').textContent = formatNumber(accountGoal) || 'N/A';

  if (accountBalance === null) {
    document.getElementById('accountPopup').style.display = 'flex';
  }
}

// Odeslání formuláře (uložení dat do databáze)
document.getElementById('accountForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const accountBalance = document.getElementById('accountBalance').value;
  const accountGoal = document.getElementById('accountGoal').value;

  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch('/api/users/update-balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ accountBalance, accountGoal }),
    });

    if (!response.ok) {
      console.error('Chyba při ukládání dat.');
      return;
    }

    const updatedData = await response.json();
    updatePageWithAccountData(updatedData);

    document.getElementById('accountPopup').style.display = 'none';
  } catch (error) {
    console.error('Chyba při ukládání dat:', error);
  }
});

// Odhlášení uživatele
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('authToken');
  window.location.href = '/login.html';
});

loadAccountData();