// Validación de login y redirección según rol para Login.html
function handleLogin(event) {
  event.preventDefault();
  const email = document.querySelector('input[name="login[username]"]').value;
  const password = document.querySelector('input[name="login[password]"]').value;
  fetch('http://127.0.0.1:5000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem('rol', data.rol);
      localStorage.setItem('usuario', data.username); // username único
      localStorage.setItem('email', data.email);
      // Aceptar varias normalizaciones de rol que pueda devolver el servidor
      const role = (data.rol || '').toString().toLowerCase();
      if (role === 'admin' || role === 'administrador' || role === 'administrativo') {
        window.location.href = 'admin/dashboard-admin.html';
      } else {
        window.location.href = 'Cuenta.html';
      }
    } else {
      alert('Credenciales incorrectas');
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var form = document.querySelector('.form-for-login');
  if(form) form.addEventListener('submit', handleLogin);
});