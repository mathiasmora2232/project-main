// Cuenta page - uses api.js functions
document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();

  // Init tabs
  const tabBtns = document.querySelectorAll('.tabs .tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.getElementById(tab + '-content').classList.add('active');
      if (tab === 'stats') loadStats();
    });
  });

  // Load profile
  try {
    const perfil = await getPerfil();
    if (perfil) {
      fillProfile(perfil);
    }
  } catch {
    if (user) fillProfile(user);
  }

  function fillProfile(data) {
    const nombre = data.nombre_completo || data.nombre || '';
    const email = data.email || '';
    const rol = data.rol || '';

    const avatar = document.getElementById('profileAvatar');
    if (avatar) avatar.textContent = nombre.charAt(0).toUpperCase();

    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = nombre;

    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail) profileEmail.textContent = email;

    const profileRol = document.getElementById('profileRol');
    if (profileRol) profileRol.textContent = rol.charAt(0).toUpperCase() + rol.slice(1);

    const infoNombre = document.getElementById('infoNombre');
    if (infoNombre) infoNombre.textContent = nombre;

    const infoEmail = document.getElementById('infoEmail');
    if (infoEmail) infoEmail.textContent = email;

    const infoRol = document.getElementById('infoRol');
    if (infoRol) infoRol.textContent = rol.charAt(0).toUpperCase() + rol.slice(1);

    const editName = document.getElementById('editName');
    if (editName) editName.value = nombre;

    const editEmail = document.getElementById('editEmail');
    if (editEmail) editEmail.value = email;
  }

  // Edit profile form
  const editForm = document.getElementById('editProfileForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('editName');
      try {
        await actualizarPerfil(nameInput.value);
        const updatedUser = { ...user, nombre_completo: nameInput.value };
        localStorage.setItem('usuario', JSON.stringify(updatedUser));
        fillProfile(updatedUser);
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = nameInput.value.split(' ')[0];
        showNotification('Perfil actualizado exitosamente', 'success');
      } catch (error) {
        showNotification('Error al actualizar perfil: ' + error.message, 'error');
      }
    });
  }

  // Load stats
  async function loadStats() {
    try {
      const stats = await getEstadisticas();
      if (stats) {
        document.getElementById('statMaterias').textContent = stats.materias_inscritas || 0;
        document.getElementById('statTareas').textContent = stats.tareas_pendientes || 0;
        document.getElementById('statLecciones').textContent = stats.lecciones_completadas || 0;
        document.getElementById('statPromedio').textContent = stats.promedio_general
          ? Number(stats.promedio_general).toFixed(1)
          : 'N/A';
      }
    } catch {
      document.getElementById('statMaterias').textContent = '-';
    }
  }
});
