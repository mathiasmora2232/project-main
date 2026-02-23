// Admin Dashboard - uses api.js functions
let currentTab = 'dashboard';
let editingUserId = null;
let editingMateriaId = null;

document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();
  if (!user || user.rol !== 'admin') {
    window.location.href = '../Homepage.html';
    return;
  }

  initTabs();
  loadDashboard();
});

// ==================== TABS ====================

function initTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      showTab(tabName);
    });
  });
}

function showTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  const content = document.getElementById(`${tabName}-content`);
  if (content) content.style.display = 'block';

  if (tabName === 'dashboard') loadDashboard();
  else if (tabName === 'usuarios') loadUsuarios();
  else if (tabName === 'materias') loadMaterias();
  else if (tabName === 'inscripciones') loadInscripciones();
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
  try {
    const stats = await adminGetStats();
    document.getElementById('stat-usuarios').textContent = stats.total_usuarios || 0;
    document.getElementById('stat-estudiantes').textContent = stats.total_estudiantes || 0;
    document.getElementById('stat-profesores').textContent = stats.total_profesores || 0;
    document.getElementById('stat-materias').textContent = stats.total_materias || 0;
    document.getElementById('stat-tareas').textContent = stats.total_tareas || 0;
    document.getElementById('stat-lecciones').textContent = stats.total_lecciones || 0;
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// ==================== USUARIOS ====================

async function loadUsuarios() {
  const tbody = document.getElementById('usuarios-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Cargando...</td></tr>';

  try {
    const usuarios = await adminGetUsuarios();
    tbody.innerHTML = '';

    if (!usuarios.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No hay usuarios</td></tr>';
      return;
    }

    usuarios.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.nombre_completo}</td>
        <td>${u.email}</td>
        <td><span class="badge badge-${u.rol}">${u.rol}</span></td>
        <td><span class="badge badge-${u.activo ? 'success' : 'danger'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td class="actions-cell">
          <button class="btn-action btn-edit" onclick="editUsuario(${u.id}, '${u.nombre_completo.replace(/'/g, "\\'")}', '${u.email}', '${u.rol}')">Editar</button>
          <button class="btn-action btn-delete" onclick="deleteUsuario(${u.id})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6" class="error-cell">Error al cargar usuarios</td></tr>';
  }
}

function showUsuarioModal(editing = false) {
  const modal = document.getElementById('usuario-modal');
  const title = document.getElementById('usuario-modal-title');
  title.textContent = editing ? 'Editar Usuario' : 'Crear Usuario';
  document.getElementById('usuario-password-group').style.display = editing ? 'none' : 'block';
  modal.style.display = 'flex';
}

function closeUsuarioModal() {
  document.getElementById('usuario-modal').style.display = 'none';
  document.getElementById('usuario-form').reset();
  editingUserId = null;
}

function editUsuario(id, nombre, email, rol) {
  editingUserId = id;
  document.getElementById('usuario-nombre').value = nombre;
  document.getElementById('usuario-email').value = email;
  document.getElementById('usuario-rol').value = rol;
  showUsuarioModal(true);
}

async function submitUsuario(e) {
  e.preventDefault();
  const nombre_completo = document.getElementById('usuario-nombre').value;
  const email = document.getElementById('usuario-email').value;
  const rol = document.getElementById('usuario-rol').value;

  try {
    if (editingUserId) {
      await adminUpdateUsuario(editingUserId, { nombre_completo, email, rol, activo: 1 });
      showNotification('Usuario actualizado', 'success');
    } else {
      const password = document.getElementById('usuario-password').value;
      if (!password) { showNotification('La contrasena es requerida', 'error'); return; }
      await adminCreateUsuario({ nombre_completo, email, password, rol });
      showNotification('Usuario creado', 'success');
    }
    closeUsuarioModal();
    loadUsuarios();
    loadDashboard();
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

async function deleteUsuario(id) {
  if (!confirm('Desactivar este usuario?')) return;
  try {
    await adminDeleteUsuario(id);
    showNotification('Usuario desactivado', 'success');
    loadUsuarios();
    loadDashboard();
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

// ==================== MATERIAS ====================

async function loadMaterias() {
  const tbody = document.getElementById('materias-tbody');
  tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">Cargando...</td></tr>';

  try {
    const materias = await adminGetMaterias();
    tbody.innerHTML = '';

    if (!materias.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">No hay materias</td></tr>';
      return;
    }

    materias.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${m.id}</td>
        <td>${m.nombre}</td>
        <td>${m.codigo || '-'}</td>
        <td>${m.profesor_nombre || 'Sin asignar'}</td>
        <td>${m.creditos || 0}</td>
        <td>${m.total_inscritos || 0}</td>
        <td class="actions-cell">
          <button class="btn-action btn-edit" onclick="editMateria(${m.id}, '${m.nombre.replace(/'/g, "\\'")}', '${m.codigo || ''}', '${m.descripcion ? m.descripcion.replace(/'/g, "\\'") : ''}', ${m.creditos || 3}, ${m.semestre || 1}, ${m.profesor_id || 0})">Editar</button>
          <button class="btn-action btn-delete" onclick="deleteMateria(${m.id})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="7" class="error-cell">Error al cargar materias</td></tr>';
  }
}

function showMateriaModal(editing = false) {
  const modal = document.getElementById('materia-modal');
  document.getElementById('materia-modal-title').textContent = editing ? 'Editar Materia' : 'Crear Materia';
  modal.style.display = 'flex';
  loadProfesoresSelect();
}

async function loadProfesoresSelect() {
  try {
    const usuarios = await adminGetUsuarios();
    const select = document.getElementById('materia-profesor');
    const currentVal = select.value;
    select.innerHTML = '<option value="">Sin asignar</option>';
    usuarios.filter(u => u.rol === 'profesor').forEach(p => {
      select.innerHTML += `<option value="${p.id}" ${p.id == currentVal ? 'selected' : ''}>${p.nombre_completo}</option>`;
    });
  } catch {}
}

function closeMateriaModal() {
  document.getElementById('materia-modal').style.display = 'none';
  document.getElementById('materia-form').reset();
  editingMateriaId = null;
}

function editMateria(id, nombre, codigo, descripcion, creditos, semestre, profesor_id) {
  editingMateriaId = id;
  document.getElementById('materia-nombre').value = nombre;
  document.getElementById('materia-codigo').value = codigo;
  document.getElementById('materia-descripcion').value = descripcion;
  document.getElementById('materia-creditos').value = creditos;
  document.getElementById('materia-semestre').value = semestre;
  document.getElementById('materia-profesor').value = profesor_id || '';
  showMateriaModal(true);
}

async function submitMateria(e) {
  e.preventDefault();
  const data = {
    nombre: document.getElementById('materia-nombre').value,
    codigo: document.getElementById('materia-codigo').value,
    descripcion: document.getElementById('materia-descripcion').value,
    creditos: parseInt(document.getElementById('materia-creditos').value) || 3,
    semestre: parseInt(document.getElementById('materia-semestre').value) || 1,
    profesor_id: document.getElementById('materia-profesor').value || null
  };

  try {
    if (editingMateriaId) {
      await adminUpdateMateria(editingMateriaId, data);
      showNotification('Materia actualizada', 'success');
    } else {
      await adminCreateMateria(data);
      showNotification('Materia creada', 'success');
    }
    closeMateriaModal();
    loadMaterias();
    loadDashboard();
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

async function deleteMateria(id) {
  if (!confirm('Desactivar esta materia?')) return;
  try {
    await adminDeleteMateria(id);
    showNotification('Materia desactivada', 'success');
    loadMaterias();
    loadDashboard();
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

// ==================== INSCRIPCIONES ====================

async function loadInscripciones() {
  const tbody = document.getElementById('inscripciones-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Cargando...</td></tr>';

  try {
    const inscripciones = await adminGetInscripciones();
    tbody.innerHTML = '';

    if (!inscripciones.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No hay inscripciones</td></tr>';
      return;
    }

    inscripciones.forEach(i => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i.id}</td>
        <td>${i.estudiante_nombre}</td>
        <td>${i.materia_nombre} (${i.materia_codigo})</td>
        <td><span class="badge badge-${i.estado === 'activa' ? 'success' : 'warning'}">${i.estado}</span></td>
        <td>${new Date(i.fecha_inscripcion).toLocaleDateString('es-ES')}</td>
        <td class="actions-cell">
          <button class="btn-action btn-delete" onclick="deleteInscripcion(${i.id})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6" class="error-cell">Error al cargar inscripciones</td></tr>';
  }
}

function showInscripcionModal() {
  document.getElementById('inscripcion-modal').style.display = 'flex';
  loadInscripcionSelects();
}

function closeInscripcionModal() {
  document.getElementById('inscripcion-modal').style.display = 'none';
  document.getElementById('inscripcion-form').reset();
}

async function loadInscripcionSelects() {
  try {
    const [usuarios, materias] = await Promise.all([adminGetUsuarios(), adminGetMaterias()]);

    const estudianteSelect = document.getElementById('inscripcion-estudiante');
    estudianteSelect.innerHTML = '<option value="">Seleccionar estudiante</option>';
    usuarios.filter(u => u.rol === 'estudiante' && u.activo).forEach(e => {
      estudianteSelect.innerHTML += `<option value="${e.id}">${e.nombre_completo} (${e.email})</option>`;
    });

    const materiaSelect = document.getElementById('inscripcion-materia');
    materiaSelect.innerHTML = '<option value="">Seleccionar materia</option>';
    materias.filter(m => m.activa).forEach(m => {
      materiaSelect.innerHTML += `<option value="${m.id}">${m.nombre} (${m.codigo})</option>`;
    });
  } catch {}
}

async function submitInscripcion(e) {
  e.preventDefault();
  const usuario_id = document.getElementById('inscripcion-estudiante').value;
  const materia_id = document.getElementById('inscripcion-materia').value;

  if (!usuario_id || !materia_id) {
    showNotification('Selecciona estudiante y materia', 'error');
    return;
  }

  try {
    await adminCreateInscripcion({ usuario_id: parseInt(usuario_id), materia_id: parseInt(materia_id) });
    showNotification('Inscripcion creada', 'success');
    closeInscripcionModal();
    loadInscripciones();
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

async function deleteInscripcion(id) {
  if (!confirm('Eliminar esta inscripcion?')) return;
  try {
    await adminDeleteInscripcion(id);
    showNotification('Inscripcion eliminada', 'success');
    loadInscripciones();
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}
