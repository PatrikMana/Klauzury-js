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
    usernameElement.textContent = username || 'Pepa Novotný'; // Defaultní jméno, pokud není k dispozici
  }
}

// Načtení jména uživatele při načtení stránky
loadUserProfile();

// Funkce pro nastavení progress baru
function updateProgressBar(accountBalance, accountGoal) {
  const progressBar = document.getElementById('progress');
  const progressPercent = (accountBalance / accountGoal) * 100;

  // Pokud je cíl větší než nula, nastavíme šířku progress baru
  if (accountGoal > 0) {
    progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
  } else {
    progressBar.style.width = '0%';  // Pokud cíl není platný
  }

  document.getElementById('progress-text').textContent = `${progressPercent}%`;
}

// Aktualizace dat na stránce
function updatePageWithAccountData({ accountBalance, accountGoal }) {
  document.getElementById('balance-amount').textContent = formatNumber(accountBalance) + " Kč" || 'N/A';
  document.getElementById('balance-goal').textContent = formatNumber(accountGoal) + " Kč" || 'N/A';

  updateProgressBar(accountBalance, accountGoal);

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

// Funkce pro výpočet a zobrazení součtu transakcí na dashboardu
async function calculateMonthSummary() {
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
      console.error('Chyba při načítání dat pro měsíční přehled.');
      return;
    }

    const summary = await response.json();
    const totalAmount = summary.income + summary.expenses; // Součet příjmů a výdajů
    document.getElementById('dashboard-month-amount').textContent =
      (totalAmount >= 0 ? '+ ' : '- ') + Math.abs(totalAmount) + ' Kč';
  } catch (error) {
    console.error('Chyba při výpočtu měsíčního přehledu:', error);
  }
}

// Volání funkce při načítání stránky 
calculateMonthSummary();
loadAccountData();