// js/adminlink.js
// Muestra el enlace de admin si el usuario es admin (usando localStorage)
document.addEventListener('DOMContentLoaded', function() {
    var adminLink = document.getElementById('admin-link');
    var rol = localStorage.getItem('rol');

    // Función para normalizar roles
    function esAdministrador(rol) {
        if (!rol) return false;

        const rolLower = rol.toLowerCase().trim();
        const rolesAdmin = [
            'administrador',
            'administrator',
            'admin'
        ];

        return rolesAdmin.includes(rolLower);
    }

    if (!adminLink) return;

    if (esAdministrador(rol)) {
        adminLink.style.display = 'inline-block';
        adminLink.style.visibility = 'visible';
    } else {
        adminLink.style.display = 'none';
        adminLink.style.visibility = 'hidden';
    }
});

// Función adicional para verificar en tiempo real
function verificarEstadoAdmin() {
    var rol = localStorage.getItem('rol');
    var username = localStorage.getItem('username');
    
    console.log('=== VERIFICACIÓN ADMIN ===');
    console.log('Username:', username);
    console.log('Rol:', rol);
    console.log('LocalStorage completo:', {
        rol: localStorage.getItem('rol'),
        username: localStorage.getItem('username'),
        email: localStorage.getItem('email')
    });
}

// Ejecutar verificación al cargar
verificarEstadoAdmin();
