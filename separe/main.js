async function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      console.log('Uživatel je přihlášen.');
    } else {
      redirectToLogin();
    }
  } catch (error) {
    console.error('Chyba při ověřování tokenu:', error);
    redirectToLogin();
  }
}

function redirectToLogin() {
  window.location.href = '/login';
}

checkAuth();