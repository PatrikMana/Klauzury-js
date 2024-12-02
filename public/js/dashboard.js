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
      console.error('Chyba při načítání zůstatku.');
      return;
    }

    const data = await response.json();
    const { accountBalance, accountGoal } = data;

    document.getElementById('balance-amount').textContent = formatNumber(accountBalance) || 'N/A';
    document.getElementById('balance-goal').textContent = formatNumber(accountGoal) || 'N/A';

    if (accountBalance === null) {
      document.getElementById('accountPopup').style.display = 'block';
    }
  } catch (error) {
    console.error('Chyba při načítání informací:', error);
  }
}

function formatNumber(number) {
  if (number === null || number === undefined || isNaN(number)) return 'N/A';
  return Number(number).toLocaleString('cs-CZ');
}

window.addEventListener('DOMContentLoaded', loadAccountData);

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
    const response = await fetch('/api/users/update-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ accountBalance, accountGoal }),
    });

    if (!response.ok) {
      console.error('Chyba při ukládání údajů.');
      return;
    }

    document.getElementById('accountPopup').style.display = 'none';
    window.location.reload();
  } catch (error) {
    console.error('Chyba při ukládání:', error);
  }
});

document.getElementById('closePopup').addEventListener('click', () => {
  document.getElementById('accountPopup').style.display = 'none';
});

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('authToken');
  window.location.href = '/login.html';
});
