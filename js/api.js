// EduConnect API Client - Single source of truth for all API calls
const API_BASE_URL = '/api';
const TOKEN_KEY = 'educonnect_token';

// ==================== UTILIDADES ====================

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: getAuthHeaders()
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (response.status === 401) {
    throw new Error('No autorizado');
  }

  if (!response.ok) {
    let errorMsg = `Error ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMsg = errorBody.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return await response.json();
}

// ==================== AUTENTICACION ====================

async function login(email, password) {
  const response = await apiRequest('/auth/login', 'POST', { email, password });
  if (response && response.token) {
    saveToken(response.token);
    localStorage.setItem('usuario', JSON.stringify(response.usuario));
  }
  return response;
}

async function register(nombre_completo, email, password, rol = 'estudiante') {
  return await apiRequest('/auth/register', 'POST', { nombre_completo, email, password, rol });
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('usuario');
  window.location.href = '/Login.html';
}

function isLoggedIn() {
  return !!getToken();
}

function getUser() {
  try {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// ==================== MATERIAS ====================

async function getMaterias() {
  try { return await apiRequest('/materias'); }
  catch { return []; }
}

async function getMateriaById(id) {
  try { return await apiRequest(`/materias/${id}`); }
  catch { return null; }
}

async function getTodasMaterias() {
  try { return await apiRequest('/materias/todas'); }
  catch { return []; }
}

async function getMateriasDisponibles() {
  try { return await apiRequest('/materias/disponibles'); }
  catch { return []; }
}

async function crearMateria(materiaData) {
  return await apiRequest('/materias', 'POST', materiaData);
}

async function inscribirseMateria(materia_id) {
  return await apiRequest('/materias/inscribir', 'POST', { materia_id });
}

async function desinscribirseMateria(materia_id) {
  return await apiRequest(`/materias/desinscribir/${materia_id}`, 'DELETE');
}

// ==================== TAREAS ====================

async function getTareasPendientes() {
  try { return await apiRequest('/tareas/pendientes/lista'); }
  catch { return []; }
}

async function getTareasPorMateria(materiaId) {
  try { return await apiRequest(`/tareas/materia/${materiaId}`); }
  catch { return []; }
}

async function crearTarea(materiaIdOrData, tareaData = null) {
  if (tareaData) {
    tareaData.materia_id = materiaIdOrData;
    return await apiRequest('/tareas', 'POST', tareaData);
  }
  return await apiRequest('/tareas', 'POST', materiaIdOrData);
}

async function entregarTarea(tareaId, archivo_url, comentarios = '') {
  return await apiRequest(`/tareas/${tareaId}/entregar`, 'POST', { archivo_url, comentarios });
}

// ==================== LECCIONES ====================

async function getLeccionesPorMateria(materiaId) {
  try { return await apiRequest(`/lecciones/materia/${materiaId}`); }
  catch { return []; }
}

async function getLeccionById(id) {
  try { return await apiRequest(`/lecciones/${id}`); }
  catch { return null; }
}

async function completarLeccion(id) {
  return await apiRequest(`/lecciones/${id}/completar`, 'POST');
}

// ==================== USUARIOS ====================

async function getPerfil() {
  try { return await apiRequest('/usuarios/perfil'); }
  catch { return null; }
}

async function getEstadisticas() {
  try { return await apiRequest('/usuarios/estadisticas'); }
  catch {
    return { materias_inscritas: 0, tareas_pendientes: 0, lecciones_completadas: 0, promedio_general: 0 };
  }
}

async function actualizarPerfil(nombre_completo) {
  return await apiRequest('/usuarios/perfil', 'PUT', { nombre_completo });
}

async function getProgresoMaterias() {
  try { return await apiRequest('/usuarios/progreso'); }
  catch { return []; }
}

async function getProgresoMateria(materiaId) {
  try { return await apiRequest(`/usuarios/progreso/${materiaId}`); }
  catch { return null; }
}

// ==================== ADMIN ====================

async function adminGetStats() {
  return await apiRequest('/admin/stats');
}

async function adminGetUsuarios() {
  return await apiRequest('/admin/usuarios');
}

async function adminCreateUsuario(data) {
  return await apiRequest('/admin/usuarios', 'POST', data);
}

async function adminUpdateUsuario(id, data) {
  return await apiRequest(`/admin/usuarios/${id}`, 'PUT', data);
}

async function adminDeleteUsuario(id) {
  return await apiRequest(`/admin/usuarios/${id}`, 'DELETE');
}

async function adminGetMaterias() {
  return await apiRequest('/admin/materias');
}

async function adminCreateMateria(data) {
  return await apiRequest('/admin/materias', 'POST', data);
}

async function adminUpdateMateria(id, data) {
  return await apiRequest(`/admin/materias/${id}`, 'PUT', data);
}

async function adminDeleteMateria(id) {
  return await apiRequest(`/admin/materias/${id}`, 'DELETE');
}

async function adminGetInscripciones() {
  return await apiRequest('/admin/inscripciones');
}

async function adminCreateInscripcion(data) {
  return await apiRequest('/admin/inscripciones', 'POST', data);
}

async function adminDeleteInscripcion(id) {
  return await apiRequest(`/admin/inscripciones/${id}`, 'DELETE');
}

// ==================== UTILIDADES UI ====================

function showNotification(mensaje, tipo = 'info') {
  const existing = document.querySelector('.notif-toast');
  if (existing) existing.remove();

  const notifDiv = document.createElement('div');
  notifDiv.className = `notif-toast notif-toast-${tipo}`;
  notifDiv.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 15px 20px;
    background-color: ${tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : tipo === 'warning' ? '#f59e0b' : '#3b82f6'};
    color: white; border-radius: 8px; box-shadow: 0 10px 15px rgba(0,0,0,0.2);
    z-index: 9999; animation: slideInDown 0.3s ease; font-weight: 500; max-width: 400px;
  `;
  notifDiv.textContent = mensaje;
  document.body.appendChild(notifDiv);

  setTimeout(() => {
    notifDiv.style.opacity = '0';
    notifDiv.style.transform = 'translateY(-20px)';
    notifDiv.style.transition = 'all 0.3s ease';
    setTimeout(() => notifDiv.remove(), 300);
  }, 3000);
}

function formatDate(date) {
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(date) {
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function getDaysUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getUrgencyClass(dateStr) {
  const days = getDaysUntil(dateStr);
  if (days < 3) return 'urgency-danger';
  if (days < 7) return 'urgency-warning';
  return 'urgency-success';
}

// ==================== INICIALIZACION ====================
// Auth redirect desactivado para desarrollo
