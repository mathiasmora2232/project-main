// Validación de login y redirección según rol para Login.html
function handleLogin(event) {
  event.preventDefault();
  const email = document.querySelector('input[name="login[username]"]').value;
  const password = document.querySelector('input[name="login[password]"]').value;
  const payload = { email, password };
  // Intentar contra servidor (ruta relativa); si falla, usar backend local
  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (!res.ok) throw new Error('server');
    return res.json();
  })
  .then(data => handleLoginResponse(data))
  .catch(async () => {
    if (typeof LocalBackend !== 'undefined') {
      const data = await LocalBackend.login(email, password);
      handleLoginResponse(data, /*local*/ true);
    } else {
      alert('No se pudo contactar al servidor.');
    }
  });
}

function handleLoginResponse(data, local=false){
  if (data.success) {
    localStorage.setItem('rol', data.rol);
    localStorage.setItem('usuario', data.username); // username único
    localStorage.setItem('email', data.email);
    if (data.id !== undefined) {
      localStorage.setItem('user_id', String(data.id));
    }
    if (!local && data.token) {
      localStorage.setItem('token', data.token);
    }
    // Aceptar varias normalizaciones de rol que pueda devolver el servidor
    const role = (data.rol || '').toString().toLowerCase();
    if (role === 'admin' || role === 'administrador' || role === 'administrativo') {
      window.location.href = 'admin/dashboard-admin.html';
    } else if (role === 'profesor') {
      window.location.href = 'profesor/dashboard-profesor.html';
    } else {
      window.location.href = 'Cuenta.html';
    }
  } else {
    alert('Credenciales incorrectas');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var form = document.querySelector('.form-for-login');
  if(form) form.addEventListener('submit', handleLogin);
});