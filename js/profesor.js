// Profesor panel - uses api.js functions
document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();

  const coursesDiv = document.getElementById('courses');
  if (!coursesDiv) return;

  try {
    const materias = await getMaterias();
    coursesDiv.innerHTML = '';

    if (!materias.length) {
      coursesDiv.innerHTML = '<p class="empty-state">No tienes materias asignadas.</p>';
      return;
    }

    materias.forEach(m => {
      const card = document.createElement('div');
      card.className = 'materia-card';
      card.innerHTML = `
        <div class="materia-header">
          <div class="materia-code">${m.codigo || ''}</div>
          <h3 class="materia-title">${m.nombre}</h3>
        </div>
        <div class="materia-body">
          <div class="materia-info">
            <div class="materia-info-item"><span>${m.total_lecciones || 0} lecciones</span></div>
            <div class="materia-info-item"><span>${m.total_tareas || 0} tareas</span></div>
            <div class="materia-info-item"><span>${m.total_inscritos || 0} inscritos</span></div>
          </div>
        </div>
        <div class="materia-footer">
          <a href="/Materias.html?id=${m.id}" class="materia-btn materia-btn-primary">Ver Detalle</a>
        </div>
      `;
      coursesDiv.appendChild(card);
    });
  } catch (error) {
    coursesDiv.innerHTML = '<p class="error-state">Error al cargar materias.</p>';
  }
});
