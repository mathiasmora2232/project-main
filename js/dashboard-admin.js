// API Base URL
const API_BASE = 'http://localhost:5000/api';

// Variables globales
let usuariosData = [];
let cursosData = [];
let periodosData = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
    cargarDashboard();
});

function verificarAutenticacion() {
    const rol = localStorage.getItem('rol');
    if (!rol || !rol.toLowerCase().includes('admin')) {
        alert('Acceso denegado. Solo administradores pueden acceder.');
        window.location.href = '../Homepage.html';
        return;
    }
    
    document.querySelector('.text-white-50').textContent = 
        `Bienvenido, ${localStorage.getItem('username')}`;
}

function cargarDashboard() {
    mostrarDashboard();
    cargarUsuarios();
    cargarCursos();
    cargarPeriodos();
    cargarEstadisticas();
}

// ==================== NAVEGACIÓN ====================

function mostrarDashboard() {
    ocultarTodosLosContenidos();
    document.getElementById('dashboard-content').style.display = 'block';
    document.getElementById('page-title').textContent = 'Dashboard Administrador';
    cargarEstadisticas();
}

function mostrarGestionUsuarios() {
    ocultarTodosLosContenidos();
    document.getElementById('usuarios-content').style.display = 'block';
    document.getElementById('page-title').textContent = 'Gestión de Usuarios';
    cargarUsuarios();
}

function mostrarGestionCursos() {
    ocultarTodosLosContenidos();
    document.getElementById('cursos-content').style.display = 'block';
    document.getElementById('page-title').textContent = 'Gestión de Cursos';
    cargarCursos();
}

function mostrarGestionPeriodos() {
    ocultarTodosLosContenidos();
    document.getElementById('periodos-content').style.display = 'block';
    document.getElementById('page-title').textContent = 'Períodos Académicos';
    cargarPeriodos();
}

function ocultarTodosLosContenidos() {
    document.getElementById('dashboard-content').style.display = 'none';
    document.getElementById('usuarios-content').style.display = 'none';
    document.getElementById('cursos-content').style.display = 'none';
    document.getElementById('periodos-content').style.display = 'none';
}

// ==================== USUARIOS ====================

async function cargarUsuarios() {
    try {
        const response = await fetch(`${API_BASE}/usuarios`);
        const data = await response.json();
        
        if (data.success) {
            usuariosData = data.usuarios;
            mostrarTablaUsuarios();
        } else {
            console.error('Error cargando usuarios:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarTablaUsuarios() {
    const tbody = document.querySelector('#tabla-usuarios tbody');
    tbody.innerHTML = '';
    
    usuariosData.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.username}</td>
            <td>${usuario.email}</td>
            <td><span class="badge bg-info">${usuario.rol}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario(${usuario.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function abrirModalCrearUsuario() {
    const modal = new bootstrap.Modal(document.getElementById('modalCrearUsuario'));
    modal.show();
}

async function crearUsuario() {
    const email = document.getElementById('usuario-email').value;
    const username = document.getElementById('usuario-username').value;
    const password = document.getElementById('usuario-password').value;
    const rol = document.getElementById('usuario-rol').value;
    
    if (!email || !username || !password || !rol) {
        alert('Todos los campos son requeridos');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password,
                rol: rol
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Usuario creado correctamente');
            bootstrap.Modal.getInstance(document.getElementById('modalCrearUsuario')).hide();
            document.getElementById('formCrearUsuario').reset();
            cargarUsuarios();
            cargarEstadisticas();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/usuarios/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Usuario eliminado correctamente');
            cargarUsuarios();
            cargarEstadisticas();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// ==================== CURSOS ====================

async function cargarCursos() {
    try {
        const response = await fetch(`${API_BASE}/cursos`);
        const data = await response.json();
        
        if (data.success) {
            cursosData = data.cursos;
            mostrarTablaCursos();
        }
    } catch (error) {
        console.error('Error cargando cursos:', error);
    }
}

function mostrarTablaCursos() {
    const tbody = document.querySelector('#tabla-cursos tbody');
    tbody.innerHTML = '';
    
    cursosData.forEach(curso => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${curso.id}</td>
            <td>${curso.nombre}</td>
            <td>Profesor ${curso.profesor_id || 'No asignado'}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarCurso(${curso.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==================== PERÍODOS ====================

async function cargarPeriodos() {
    try {
        const response = await fetch(`${API_BASE}/periodos`);
        const data = await response.json();
        
        if (data.success) {
            periodosData = data.periodos;
            mostrarTablaPeriodos();
            actualizarPeriodoActivo();
        }
    } catch (error) {
        console.error('Error cargando períodos:', error);
    }
}

function mostrarTablaPeriodos() {
    const tbody = document.querySelector('#tabla-periodos tbody');
    tbody.innerHTML = '';
    
    periodosData.forEach(periodo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${periodo.id}</td>
            <td>${periodo.nombre}</td>
            <td>
                <span class="badge ${periodo.activo ? 'bg-success' : 'bg-secondary'}">
                    ${periodo.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                ${!periodo.activo ? `
                    <button class="btn btn-sm btn-outline-success" onclick="activarPeriodo(${periodo.id})">
                        <i class="fas fa-play"></i> Activar
                    </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function abrirModalCrearPeriodo() {
    const modal = new bootstrap.Modal(document.getElementById('modalCrearPeriodo'));
    modal.show();
}

async function crearPeriodo() {
    const nombre = document.getElementById('periodo-nombre').value;
    
    if (!nombre) {
        alert('El nombre del período es requerido');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/periodos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Período creado correctamente');
            bootstrap.Modal.getInstance(document.getElementById('modalCrearPeriodo')).hide();
            document.getElementById('formCrearPeriodo').reset();
            cargarPeriodos();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

async function activarPeriodo(id) {
    try {
        const response = await fetch(`${API_BASE}/periodos/${id}/activar`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Período activado correctamente');
            cargarPeriodos();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

function actualizarPeriodoActivo() {
    const periodoActivo = periodosData.find(p => p.activo);
    const badge = document.getElementById('periodo-activo');
    
    if (periodoActivo) {
        badge.textContent = `Período: ${periodoActivo.nombre}`;
        badge.className = 'badge bg-success';
    } else {
        badge.textContent = 'Sin período activo';
        badge.className = 'badge bg-warning';
    }
}

// ==================== ESTADÍSTICAS ====================

function cargarEstadisticas() {
    // Actualizar contadores
    document.getElementById('total-usuarios').textContent = usuariosData.length;
    document.getElementById('total-cursos').textContent = cursosData.length;
    
    // Contar por rol
    const profesores = usuariosData.filter(u => u.rol.toLowerCase().includes('profesor')).length;
    const estudiantes = usuariosData.filter(u => u.rol.toLowerCase().includes('estudiante')).length;
    
    document.getElementById('total-profesores').textContent = profesores;
    document.getElementById('total-estudiantes').textContent = estudiantes;
    
    // Crear gráfico de roles
    crearGraficoRoles();
    
    // Actualizar actividad reciente
    actualizarActividadReciente();
}

function crearGraficoRoles() {
    const ctx = document.getElementById('rolesChart').getContext('2d');
    
    // Contar roles
    const conteoRoles = {};
    usuariosData.forEach(usuario => {
        const rol = usuario.rol;
        conteoRoles[rol] = (conteoRoles[rol] || 0) + 1;
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conteoRoles),
            datasets: [{
                data: Object.values(conteoRoles),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function actualizarActividadReciente() {
    const actividadDiv = document.getElementById('actividad-reciente');
    actividadDiv.innerHTML = `
        <div class="list-group list-group-flush">
            <div class="list-group-item border-0 px-0">
                <small class="text-muted">Hace 5 min</small><br>
                <strong>Usuario creado:</strong> Nuevo estudiante registrado
            </div>
            <div class="list-group-item border-0 px-0">
                <small class="text-muted">Hace 1 hora</small><br>
                <strong>Período activado:</strong> ${periodosData.find(p => p.activo)?.nombre || 'Ninguno'}
            </div>
            <div class="list-group-item border-0 px-0">
                <small class="text-muted">Hace 3 horas</small><br>
                <strong>Sistema iniciado:</strong> Servidor web activo
            </div>
        </div>
    `;
}

// ==================== SESIÓN ====================

function cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        localStorage.clear();
        window.location.href = '../Homepage.html';
    }
}