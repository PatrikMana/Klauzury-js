document.addEventListener('DOMContentLoaded', async () => {
  async function loadUserBalance() {
    const token = localStorage.getItem('token');

    if (!token) {
      redirectToLogin();
      return;
    }

    try {
      const response = await fetch('/api/users/verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const balanceElement = document.getElementById('user-balance');
        if (balanceElement) {
          balanceElement.textContent = `${data.accountBalance} Kč`;
        } else {
          console.error('Element s ID "user-balance" nebyl nalezen.');
        }
      } else if (response.status === 401) {
        console.warn('Token je neplatný nebo vypršel.');
        redirectToLogin();
      } else {
        console.error('Nepodařilo se načíst kapitál uživatele:', await response.text());
      }
    } catch (error) {
      console.error('Chyba při načítání zůstatku uživatele:', error);
      redirectToLogin();
    }
  }

  function redirectToLogin() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  await loadUserBalance();
});