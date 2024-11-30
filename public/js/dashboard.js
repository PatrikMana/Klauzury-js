async function loadUserBalance() {
  const token = localStorage.getItem('authToken');

  if (!token) {
    console.warn('Token není uložen. Přesměrovávám na přihlášení.');
    redirectToLogin();
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

    if (response.ok) {
      const data = await response.json();
      document.getElementById('balance-amount').textContent = `${data.accountBalance} Kč`;
    } else if (response.status === 401) {
      console.warn('Token je neplatný nebo vypršel.');
      redirectToLogin();
    } else {
      console.error('Nepodařilo se načíst zůstatek:', await response.text());
    }
  } catch (error) {
    console.error('Chyba při načítání zůstatku:', error);
    redirectToLogin();
  }
}

function redirectToLogin() {
  localStorage.removeItem('authToken');
  window.location.href = '/login.html';
}

document.getElementById('logout').addEventListener('click', () => redirectToLogin());

loadUserBalance();