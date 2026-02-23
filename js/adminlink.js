// Show admin panel link if user is admin (uses getUser() from api.js)
document.addEventListener('DOMContentLoaded', () => {
  const user = typeof getUser === 'function' ? getUser() : null;
  if (!user) return;

  const adminLink = document.getElementById('adminLink');
  if (adminLink && user.rol === 'admin') {
    adminLink.style.display = 'inline-block';
  }
});
