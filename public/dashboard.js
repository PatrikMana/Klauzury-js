async function loadDashboard() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login.html';
      return;
    }
  
    try {
      // Získání zůstatku
      const balanceResponse = await fetch('/api/dashboard/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const balanceData = await balanceResponse.json();
      document.getElementById('balance').textContent = `${balanceData.balance} Kč`;
  
      // Získání měsíčního přehledu
      const summaryResponse = await fetch('/api/dashboard/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const summaryData = await summaryResponse.json();
      document.getElementById('income').textContent = `Příjmy: ${summaryData.income} Kč`;
      document.getElementById('expenses').textContent = `Výdaje: ${summaryData.expenses} Kč`;
  
      // Získání upozornění
      const alertsResponse = await fetch('/api/dashboard/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const alertsData = await alertsResponse.json();
      const alertsList = document.getElementById('alerts');
      alertsList.innerHTML = '';
      alertsData.forEach(alert => {
        const li = document.createElement('li');
        li.textContent = alert.message;
        alertsList.appendChild(li);
      });
    } catch (error) {
      console.error('Chyba při načítání dashboardu:', error);
    }
  }
  
  loadDashboard();  