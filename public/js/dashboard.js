// Formátování čísel
// Vrátí 'N/A' pokud je hodnota neplatná, jinak formátuje číslo podle českých zvyklostí
function formatNumber(number) {
  if (number === null || number === undefined || isNaN(number)) return 'N/A';
  return Number(number).toLocaleString('cs-CZ');
}

document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile(); // Načte profil uživatele po načtení stránky
  calculateMonthSummary(); // Vypočítá měsíční souhrn transakcí po načtení stránky
});

// Funkce pro vložení alertu do seznamu
// Vyčistíme seznam, pokud obsahuje výchozí zprávu
// Vytvoříme nový textový prvek seznamu a přidáme ho do seznamu
function insertAlertAsText(message) {
  const alertList = document.querySelector('.notifications-box ul');

  if (!alertList) {
    console.error('Seznam upozornění nebyl nalezen.');
    return;
  }

  const defaultAlert = alertList.querySelector('li');
  if (defaultAlert && defaultAlert.textContent === 'nemáte žádné upozornění') {
    alertList.innerHTML = '';
  }

  const alertItem = document.createElement('li');
  alertItem.textContent = message;
  alertList.appendChild(alertItem);
}

// Funkce pro načtení alertů z API a jejich zobrazení
// Přesměrování na přihlašovací stránku, pokud není token
// Načítá alerty z API a zobrazuje je v seznamu
async function fetchAndDisplayAlerts() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch('/api/alerts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Nepodařilo se načíst alerty.');
    }

    const alerts = await response.json();

    if (alerts.length === 0) {
      insertAlertAsText('nemáte žádné upozornění');
      return;
    }

    alerts.forEach(alert => {
      insertAlertAsText(alert.message);
    });
  } catch (error) {
    console.error('Chyba při načítání alertů:', error);
    insertAlertAsText('Nepodařilo se načíst upozornění.');
  }
}

// Načtení dat z databáze
// Přesměrování na přihlašovací stránku, pokud není token
// Načítá data účtu z API a aktualizuje stránku
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
    fetchAndDisplayAlerts();
  } catch (error) {
    console.error('Chyba při načítání dat:', error);
  }
}

// Funkce pro načtení jména uživatele a aktualizaci UI
// Přesměrování na přihlašovací stránku, pokud není token
// Načítá profil uživatele z API a aktualizuje UI
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

// Funkce pro nastavení progress baru
// Aktualizuje šířku a text progress baru podle zůstatku a cíle
// Fetch příjmů a výdajů a aktualizace příjmového a výdajového progress baru
async function updateProgressBars(accountBalance, accountGoal) {
  try {
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progress-text');
    const progressPercent = accountGoal > 0 ? (accountBalance / accountGoal) * 100 : 0;

    if (progressPercent < 10) {
      if (progressBar) {
        progressBar.style.display = 'none';
      }
    }

    if (progressPercent < 0) { 
      progressText.style.display = 'none';
    }
    
    if (progressBar) {
      progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
    }

    if (progressText) {
      progressText.textContent = `${Math.round(progressPercent)}%`;
    }

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

    const total = income + Math.abs(expenses);
    const incomePercentage = total === 0 ? 50 : (income / total) * 100;
    const expensesPercentage = total === 0 ? 50 : (Math.abs(expenses) / total) * 100;

    const incomeBar = document.querySelector('.income-bar');
    const expensesBar = document.querySelector('.expenses-bar');

    if (incomeBar && expensesBar) {
      incomeBar.style.width = `${incomePercentage}%`;
      expensesBar.style.width = `${expensesPercentage}%`;

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
    console.error('Error while updating progress bars:', error);
  }
}

// Aktualizace dat na stránce
// Aktualizuje zobrazení zůstatku a cíle na stránce
// Aktualizuje progress bar
function updatePageWithAccountData({ accountBalance, accountGoal }) {
  document.getElementById('balance-amount').textContent = formatNumber(accountBalance) + " Kč" || 'N/A';
  document.getElementById('balance-goal').textContent = formatNumber(accountGoal) + " Kč" || 'N/A';

  updateProgressBars(accountBalance, accountGoal);

  if (accountBalance === null) {
    document.getElementById('accountPopup').style.display = 'flex';
  }
}

// Odeslání formuláře (uložení dat do databáze)
// Přesměrování na přihlašovací stránku, pokud není token
// Odesílá data účtu do API a aktualizuje stránku
document.getElementById('accountForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const accountBalance = parseFloat(document.getElementById('accountBalance').value);
  const accountGoal = parseFloat(document.getElementById('accountGoal').value);
  const errorMessage = document.getElementById('error-message'); // Přidáme pole pro zobrazení chybové zprávy

  if (!errorMessage) {
    const errorContainer = document.createElement('p');
    errorContainer.id = 'error-message';
    errorContainer.style.color = 'red';
    document.getElementById('accountForm').appendChild(errorContainer);
  }

  if (accountGoal <= 0) {
    document.getElementById('error-message').textContent = 'Cílová částka nemůže být záporná.';
    return;
  } else {
    document.getElementById('error-message').textContent = '';
  }

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
// Odstraní token z localStorage a přesměruje na přihlašovací stránku
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('authToken');
  window.location.href = '/login.html';
});

// Funkce pro výpočet a zobrazení součtu transakcí na dashboardu
// Přesměrování na přihlašovací stránku, pokud není token
// Načítá souhrn transakcí z API a zobrazuje je na stránce
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
      (totalAmount >= 0 ? '+ ' : '- ') + formatNumber(Math.abs(totalAmount)) + ' Kč';

    let monthMessage = '';
    if (totalAmount > 0) {
      monthMessage = `Za minulý měsíc jste ${formatNumber(totalAmount)} Kč v plusu, jen tak dál!`;
    } else if (totalAmount < 0) {
      monthMessage = `Za minulý měsíc jste ${formatNumber(Math.abs(totalAmount))} Kč v mínusu, zvažte úpravu rozpočtu.`;
    } else {
      monthMessage = 'Za minulý měsíc jste byli na nule, zlepšete svůj rozpočet!';
    }

    const monthInfoElement = document.querySelector('.month-info');
    if (monthInfoElement) {
      monthInfoElement.textContent = monthMessage;
    }

    loadAccountData();
  } catch (error) {
    console.error('Chyba při výpočtu měsíčního přehledu:', error);
  }
}