// Otevření popupu
document.getElementById('add-transaction').addEventListener('click', () => {
  document.getElementById('addTransactionPopup').style.display = 'flex';  // Otevřít popup
});

// Zavření popupu
document.querySelector('.transaction-popup-cancel').addEventListener('click', () => {
  document.getElementById('addTransactionPopup').style.display = 'none'; // Zavřít popup
});

// Odeslání formuláře pro transakci
document.getElementById('transaction-confirm').addEventListener('click', async () => {
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
      const response = await fetch('/api/transactions/addtransaction', {  // Odesíláme data na nový endpoint
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
              name: name,
              amount: parseFloat(amount), // Převod na číslo
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
      // Můžeme přidat kód pro zobrazení nové transakce na stránce nebo automatické obnovení seznamu
  } catch (error) {
      console.error('Chyba při ukládání transakce:', error);
  }
});