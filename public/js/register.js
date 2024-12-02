document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
  
    errorMessage.textContent = '';
  
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        alert('Registrace byla úspěšná!');
        window.location.href = '/login.html';
      } else {
        const errorData = await response.json();
        errorMessage.textContent = errorData.message || 'Registrace selhala.';
      }
    } catch (error) {
      console.error('Chyba při registraci:', error);
      errorMessage.textContent = 'Chyba při připojení k serveru.';
    }
  });  