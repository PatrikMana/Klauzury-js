document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
  
    errorMessage.textContent = '';
  
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        window.location.href = '/dashboard';
      } else {
        const errorData = await response.json();
        errorMessage.textContent = errorData.message || 'Přihlášení selhalo.';
      }
    } catch (error) {
      console.error('Chyba při přihlašování:', error);
      errorMessage.textContent = 'Chyba při připojení k serveru.';
    }
  });
  
  async function checkAuthToken() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return;
  }

  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      window.location.href = '/dashboard.html';
    } else {
      console.error('Token je neplatný nebo vypršel.');
      localStorage.removeItem('authToken');
    }
  } catch (error) {
    console.error('Chyba při ověřování tokenu:', error);
  }
}

checkAuthToken();