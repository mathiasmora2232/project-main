# 🚀 Guía de Inicio Rápido - EduConnect

## 1️⃣ Instalación (5 minutos)

```bash
# Clonar proyecto
git clone <url>
cd project-main

# Iniciar con Docker
docker-compose up -d

# Esperar a que se inicialice (~30 segundos)
sleep 30

# Verificar que esté corriendo
docker-compose ps
```

✅ **Listo!** La aplicación está disponible en http://localhost:5000

## 2️⃣ Login de Prueba

### Como Estudiante 👨‍🎓
```
Email: estudiante@ejemplo.com
Contraseña: password123
```
→ Ir a http://localhost:5000/Homepage.html

### Como Profesor 👨‍🏫
```
Email: carlos@ejemplo.com
Contraseña: password123
```
→ Ir a http://localhost:5000/profesor/dashboard-profesor.html

### Como Admin 👨‍💼
```
Email: admin@ejemplo.com
Contraseña: password123
```
→ Ir a http://localhost:5000/admin/dashboard-admin.html

## 3️⃣ Flujos Principales

### 📚 Como Estudiante

1. **Login** → Ir a Homepage
2. **Ver Materias** → Click en "Materias"
3. **Inscribirse** → "Inscribirse" en una materia
4. **Ver Lecciones** → Click en materia inscrita
5. **Hacer Tareas** → Enviar tarea
6. **Ver Calificaciones** → En "Mi Cuenta" → Estadísticas

### 👨‍🏫 Como Profesor

1. **Login** → Ir a Panel del Profesor
2. **Crear Materia** → Click "+ Crear Nueva Materia"
3. **Gestionar Materia** → Click "Gestionar"
4. **Agregar Lecciones** → Tab "Lecciones" → "+ Nueva Lección"
5. **Agregar Tareas** → Tab "Tareas" → "+ Nueva Tarea"
6. **Calificar** → Tab "Entregas" → Revisar y calificar
7. **Ver Estadísticas** → "Ver Estadísticas"

### 👨‍💼 Como Admin

1. **Login** → Ir a Panel Admin
2. **Gestionar Usuarios** → Ver lista de usuarios
3. **Gestionar Materias** → Ver todas las materias
4. **Asignar Profesores** → Editar materia → asignar profesor
5. **Ver Reportes** → Estadísticas del sistema

## 4️⃣ Características Principales

### ⭐ Destacadas por Rol

**Estudiante:**
- 📱 Dashboard con progreso en tiempo real
- 📚 Ver lecciones por materia
- 📝 Entregar tareas
- 📊 Ver calificaciones
- 🎯 Seguimiento de progreso

**Profesor:**
- 📊 Panel personalizado
- ➕ Crear/editar materias
- 📖 Gestionar lecciones
- 📝 Crear/calificar tareas
- 📈 Estadísticas de estudiantes
- 👥 Ver lista de inscritos

**Admin:**
- 👥 Gestión completa de usuarios
- 📚 Gestión de materias
- 📊 Reportes del sistema
- 🔧 Configuración global

## 5️⃣ Estructura URL

```
Frontend (Nginx):
├── http://localhost:5000/ - Homepage
├── http://localhost:5000/Login.html - Login
├── http://localhost:5000/Register.html - Registro
├── http://localhost:5000/Cuenta.html - Mi Cuenta
├── http://localhost:5000/profesor/ - Páginas profesor
│   ├── dashboard-profesor.html
│   ├── editar-materia.html
│   ├── manage-materia.html
│   └── estadisticas-profesor.html
└── http://localhost:5000/admin/ - Páginas admin
    └── dashboard-admin.html

Backend (Express):
└── http://localhost:3000/api/
    ├── /auth/... - Autenticación
    ├── /materias/... - Materias
    ├── /tareas/... - Tareas
    ├── /lecciones/... - Lecciones
    ├── /entregas/... - Entregas
    └── /usuarios/... - Usuarios
```

## 6️⃣ Pruebas Rápidas

### Test de API (desde terminal)
```bash
# Obtener materias
curl -X GET http://localhost:3000/api/materias \
  -H "Authorization: Bearer <tu-token>"

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos@ejemplo.com","password":"password123"}'
```

### Test en Navegador (Developer Tools → Console)
```javascript
// Llamar API
const response = await apiRequest('/materias');
console.log(response);

// Obtener usuario
const user = getUser();
console.log(user);

// Hacer logout
logout();
```

## 7️⃣ Trabajar con Datos

### Acceder a Base de Datos
```bash
# phpMyAdmin
→ http://localhost:8080
→ Usuario: root
→ Contraseña: root123
→ Servidor: mariadb
```

### Ver Logs
```bash
# Logs del backend
docker-compose logs backend -f

# Logs de nginx
docker-compose logs nginx -f

# Logs de base de datos
docker-compose logs mariadb -f
```

## 8️⃣ Comandos Útiles

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reiniciar todo
docker-compose restart

# Limpiar y reiniciar (borra datos)
docker-compose down -v && docker-compose up -d

# Entrar a bash del backend
docker-compose exec backend bash

# Ejecutar SQL
docker-compose exec mariadb mysql -uroot -proot123 -D educonnect
```

## 9️⃣ Crear Nueva Materia (Paso a Paso)

1. **Login como Profesor**
   - Email: carlos@ejemplo.com
   - Contraseña: password123

2. **Ir a Panel del Profesor**
   - URL: http://localhost:5000/profesor/dashboard-profesor.html

3. **Crear Materia**
   - Click "+ Crear Nueva Materia"
   - Llenar formulario:
     - Nombre: "Programación Avanzada"
     - Código: "PRG-401"
     - Créditos: 3
     - Semestre: 4
   - Click "Guardar Materia"

4. **Gestionar Materia**
   - Click "Gestionar" en la materia creada
   - Agregar Lecciones:
     - Click "Lecciones"
     - "+ Nueva Lección"
     - Título: "Introducción a OOP"
     - Contenido: "Los conceptos básicos..."
   - Agregar Tareas:
     - Click "Tareas"
     - "+ Nueva Tarea"
     - Título: "Ejercicio 1: Clases"
     - Fecha: Seleccionar fecha
     - Puntos: 100

5. **Ver Entregas**
   - Click "Entregas"
   - Ver entregas de estudiantes
   - Click para ver detalles y calificar

## 🔟 Solucionar Problemas

### No se abre localhost:5000
```bash
# Verificar que nginx está corriendo
docker-compose ps

# Reiniciar nginx
docker-compose restart nginx

# Ver logs
docker-compose logs nginx
```

### Error de conexión a BD
```bash
# Verificar MariaDB
docker-compose exec mariadb ping

# Reiniciar BD
docker-compose restart mariadb

# Ver logs
docker-compose logs mariadb
```

### Limpiar caché del navegador
- Presionar: `Ctrl+Shift+Del` (Windows/Linux) o `Cmd+Shift+Del` (Mac)
- Seleccionar "Todo"
- Click "Limpiar datos"

## 📞 Soporte

Para reportar issues:
1. Verificar logs: `docker-compose logs`
2. Reiniciar servicios: `docker-compose restart`
3. Si persiste, limpiar: `docker-compose down -v && docker-compose up -d`

---

**¡Listo!** Ya puedes empezar a usar EduConnect. 🎓✨
