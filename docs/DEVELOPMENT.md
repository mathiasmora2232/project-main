# 📚 Guía de Desarrollo - EduConnect

Documento técnico para desarrolladores y futuras mejoras del proyecto.

## 📋 Tabla de Contenidos

1. [Arquitectura del Proyecto](#arquitectura)
2. [Estructura de Archivos](#estructura)
3. [API REST](#api-rest)
4. [Base de Datos](#base-de-datos)
5. [Desarrollo Frontend](#desarrollo-frontend)
6. [Desarrollo Backend](#desarrollo-backend)
7. [Mejoras Futuras](#mejoras-futuras)
8. [Estándares de Código](#estándares)

---

## 🏗️ Arquitectura

### Modelo 3-Tier

```
┌─────────────────────────────────────────────────────────┐
│          FRONTEND (Nginx - Puerto 5000)                 │
│  - HTML5 Semántico                                      │
│  - CSS3 Variables                                       │
│  - JavaScript Vanilla                                   │
│  - API Client Integrado (api.js)                        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────┐
│         BACKEND (Node.js Express - Puerto 3000)         │
│  - Controllers (Lógica de negocio)                      │
│  - Routes (Definición de endpoints)                     │
│  - Middleware (Autenticación, validación)               │
│  - Models (Conexión a BD)                               │
│  - Utils (Funciones auxiliares)                         │
└──────────────────────┬──────────────────────────────────┘
                       │ MySQL Protocol
┌──────────────────────▼──────────────────────────────────┐
│    BASE DE DATOS (MariaDB - Puerto 3306)               │
│  - 9 Tablas (usuarios, materias, tareas, etc)          │
│  - Relaciones normalizadas                              │
│  - Índices para optimización                            │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos

```
project-main/
│
├── 📄 Archivos Frontend Principales
│   ├── Login.html              # Página de login
│   ├── Register.html           # Página de registro
│   ├── Homepage.html           # Dashboard principal
│   ├── Cuenta.html             # Perfil de usuario
│   ├── Materias.html           # Listado de materias
│   ├── Calendario.html         # Calendario académico
│   ├── Malla.html              # Malla curricular
│   └── [otros HTML...]
│
├── 📁 profesor/                # Páginas exclusivas del profesor
│   ├── dashboard-profesor.html # Panel principal
│   ├── editar-materia.html     # Editar materia
│   ├── manage-materia.html     # Gestionar materia
│   └── estadisticas-profesor.html # Estadísticas
│
├── 📁 admin/                   # Páginas del administrador
│   ├── dashboard-admin.html    # Panel admin
│   ├── gestion-usuarios.html   # Gestión de usuarios
│   ├── gestion-cursos.html     # Gestión de cursos
│   └── [otros...]
│
├── 📁 css/                     # Estilos CSS
│   ├── Global.css              # Estilos globales
│   ├── admindasbord.css        # Admin dashboard
│   ├── Cuenta.css              # Perfil
│   ├── homepage.css            # Homepage
│   └── [otros estilos...]
│
├── 📁 js/                      # JavaScript Frontend
│   ├── api.js                  # Cliente API REST
│   ├── app.js                  # Scripts globales
│   ├── login.js                # Login logic
│   ├── cuenta.js               # Cuenta logic
│   ├── dashboard-admin.js      # Admin logic
│   └── [otros scripts...]
│
├── 📁 img/                     # Imágenes y assets
│
├── 📁 server/                  # Backend Node.js
│   │
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # Lógica de negocio
│   │   │   ├── authController.js
│   │   │   ├── materiasController.js
│   │   │   ├── tareasController.js
│   │   │   ├── leccionesController.js
│   │   │   ├── usuariosController.js
│   │   │   └── entregasController.js
│   │   │
│   │   ├── 📁 routes/         # Definición de endpoints
│   │   │   ├── auth.js
│   │   │   ├── materias.js
│   │   │   ├── tareas.js
│   │   │   ├── lecciones.js
│   │   │   ├── usuarios.js
│   │   │   └── entregas.js
│   │   │
│   │   ├── 📁 middleware/     # Middleware Express
│   │   │   └── auth.js        # Verificación JWT
│   │   │
│   │   ├── 📁 models/         # Modelos de datos
│   │   │   └── db.js          # Pool de conexión MySQL
│   │   │
│   │   ├── 📁 utils/          # Utilidades
│   │   │   └── validation.js  # Validación de datos
│   │   │
│   │   └── server.js          # Punto de entrada
│   │
│   ├── 📁 database/           # Scripts de BD
│   │   ├── init.js            # Creación de tablas
│   │   └── seed.js            # Datos de prueba
│   │
│   ├── 📁 uploads/            # Almacenamiento de archivos
│   │   ├── tareas/
│   │   └── recursos/
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── 📁 public/                  # Carpeta estática (si aplica)
│   ├── 📁 uploads/
│   │   ├── tareas/
│   │   └── recursos/
│
├── docker-compose.yml          # Configuración Docker
├── nginx.conf                  # Configuración Nginx
├── README.md                   # Documentación principal
├── QUICK_START.md              # Guía rápida
└── DEVELOPMENT.md              # Este archivo
```

---

## 🔌 API REST

### Estructura General

```
Base URL: http://localhost:3000/api/
```

### Autenticación

Todos los endpoints (excepto `/auth/register` y `/auth/login`) requieren token JWT:

```http
Authorization: Bearer <token>
```

### Endpoints por Módulo

#### 🔐 Autenticación (`/auth`)
```
POST   /login           - Login
POST   /register        - Registro
POST   /verify          - Verificar token
POST   /refresh         - Refrescar token
```

#### 📚 Materias (`/materias`)
```
GET    /                - Listar materias (filtrado por rol)
GET    /mismateria      - Mis materias (solo profesor)
GET    /:id             - Obtener materia específica
POST   /                - Crear materia
PUT    /:id             - Actualizar materia
DELETE /:id             - Eliminar materia
POST   /:id/inscribir   - Inscribirse
DELETE /:id/desinscribir - Desinscribirse
```

#### 📖 Lecciones (`/lecciones`)
```
GET    /materia/:id     - Lecciones de materia
GET    /:id             - Obtener lección
POST   /                - Crear lección
PUT    /:id             - Actualizar lección
DELETE /:id             - Eliminar lección
POST   /:id/completar   - Marcar completada
```

#### 📝 Tareas (`/tareas`)
```
GET    /                - Listar tareas (filtrado)
GET    /materia/:id     - Tareas de materia
GET    /:id             - Obtener tarea
POST   /                - Crear tarea
PUT    /:id             - Actualizar tarea
DELETE /:id             - Eliminar tarea
POST   /:id/entregar    - Entregar tarea
```

#### 📦 Entregas (`/entregas`)
```
GET    /                - Listar entregas
GET    /tarea/:id       - Entregas de tarea
POST   /                - Crear entrega
PUT    /:id/calificar   - Calificar
```

#### 👥 Usuarios (`/usuarios`)
```
GET    /perfil          - Obtener perfil
PUT    /actualizar      - Actualizar perfil
GET    /estadisticas    - Estadísticas del usuario
POST   /cambiar-password - Cambiar contraseña
```

---

## 💾 Base de Datos

### Diagrama de Relaciones

```
usuarios (1) ─────────────────── (M) inscripciones
   │                                     │
   │                                     └─── (1) materias
   │                                              │
   │                                              ├─── (M) lecciones
   │                                              ├─── (M) tareas
   │                                              └─── (M) calificaciones
   │
   ├─ (M) materias (como profesor)
   ├─ (M) tareas (entregas)
   ├─ (M) entregas
   └─ (M) calificaciones

lecciones (1) ───────────────── (M) recursos
   │
   └─────────────── (M) progreso_lecciones (1) ───── usuarios

tareas (1) ────────────────── (M) entregas
```

### Tablas Principales

#### `usuarios`
```sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre_completo VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  rol ENUM('estudiante', 'profesor', 'admin'),
  activo BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

#### `materias`
```sql
CREATE TABLE materias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255),
  codigo VARCHAR(50) UNIQUE,
  descripcion TEXT,
  profesor_id INT,
  creditos INT DEFAULT 3,
  semestre INT,
  activa BOOLEAN DEFAULT 1,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### `tareas`
```sql
CREATE TABLE tareas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  materia_id INT,
  titulo VARCHAR(255),
  descripcion TEXT,
  fecha_entrega DATETIME,
  puntos_totales INT DEFAULT 100,
  activa BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### `entregas`
```sql
CREATE TABLE entregas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tarea_id INT,
  usuario_id INT,
  archivo_url VARCHAR(255),
  estado ENUM('no_entregada', 'entregada', 'calificada'),
  calificacion DECIMAL(5,2),
  comentarios TEXT,
  entregada_en TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

## 🎨 Desarrollo Frontend

### Estándares CSS

**Variables CSS Globales:**
```css
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --neutral-900: #111827;
  --neutral-600: #4b5563;
}
```

**Responsive Breakpoints:**
```css
/* Mobile First */
/* Tablet: 768px */
@media (min-width: 768px) { }

/* Desktop: 1024px */
@media (min-width: 1024px) { }

/* Large Desktop: 1280px */
@media (min-width: 1280px) { }
```

### Componentes Reutilizables

**Botones:**
```html
<button class="btn btn-primary">Primario</button>
<button class="btn btn-secondary">Secundario</button>
<button class="btn btn-danger">Peligro</button>
<button class="btn btn-sm">Pequeño</button>
```

**Cards:**
```html
<div class="card">
  <div class="card-header">Título</div>
  <div class="card-body">Contenido</div>
  <div class="card-footer">Footer</div>
</div>
```

**Modales:**
```html
<div class="modal" id="myModal">
  <div class="modal-content">
    <div class="modal-header">Título</div>
    <div class="modal-body">Contenido</div>
    <div class="modal-footer">
      <button onclick="closeModal()">Cerrar</button>
    </div>
  </div>
</div>
```

### JavaScript - Cliente API

**Función para hacer requests:**
```javascript
// GET
const data = await apiRequest('/materias');

// POST
const response = await apiRequest('/materias', 'POST', {
  nombre: 'Nueva Materia',
  codigo: 'CODE'
});

// PUT
await apiRequest('/materias/1', 'PUT', {
  nombre: 'Actualizada'
});

// DELETE
await apiRequest('/materias/1', 'DELETE');
```

**Gestión de Usuario:**
```javascript
// Obtener usuario actual
const user = getUser();

// Verificar si está logeado
if (!user) {
  window.location.href = '/Login.html';
}

// Logout
logout();
```

---

## ⚙️ Desarrollo Backend

### Crear Nuevo Controlador

```javascript
// server/src/controllers/miController.js
const { query } = require('../models/db');

exports.getMisDatos = async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    
    const datos = await query(
      'SELECT * FROM mi_tabla WHERE usuario_id = ?',
      [usuarioId]
    );
    
    res.json(datos);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
};

exports.crearDato = async (req, res) => {
  try {
    // Validar
    const { campo1, campo2 } = req.body;
    
    if (!campo1) {
      return res.status(400).json({ error: 'campo1 es requerido' });
    }
    
    // Insertar
    await query(
      'INSERT INTO mi_tabla (campo1, campo2, usuario_id) VALUES (?, ?, ?)',
      [campo1, campo2, req.user.id]
    );
    
    res.status(201).json({ mensaje: 'Creado exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear' });
  }
};
```

### Crear Nuevas Rutas

```javascript
// server/src/routes/miRuta.js
const express = require('express');
const router = express.Router();
const miController = require('../controllers/miController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, miController.getMisDatos);
router.post('/', authMiddleware, miController.crearDato);
router.put('/:id', authMiddleware, miController.actualizar);
router.delete('/:id', authMiddleware, miController.eliminar);

module.exports = router;
```

### Registrar Rutas en server.js

```javascript
// server/src/server.js
const miRouter = require('./routes/miRuta');
app.use('/api/mi-ruta', miRouter);
```

### Validación de Datos

```javascript
const { validateMateriaData } = require('../utils/validation');

exports.crearMateria = async (req, res) => {
  const { isValid, errors } = validateMateriaData(req.body);
  
  if (!isValid) {
    return res.status(400).json({ errors });
  }
  
  // Procesar...
};
```

---

## 🚀 Mejoras Futuras

### Corto Plazo (Próximas 2 semanas)
- [ ] Sistema de notificaciones en tiempo real (WebSocket)
- [ ] Upload de archivos para tareas
- [ ] Mejor interfaz de calificación para profesores
- [ ] Búsqueda y filtros avanzados
- [ ] Exportar reportes a PDF

### Mediano Plazo (1-2 meses)
- [ ] Chat entre estudiantes y profesores
- [ ] Sistema de foros por materia
- [ ] Videoconferencias integradas (Jitsi/Agora)
- [ ] Gamificación (insignias, puntos)
- [ ] App móvil (React Native)

### Largo Plazo (3-6 meses)
- [ ] Machine Learning para predicción de desempeño
- [ ] Análisis avanzado de datos
- [ ] Integración con sistemas externos (Canvas, Blackboard)
- [ ] Accesibilidad mejorada (WCAG 2.1)
- [ ] Internacionalización (múltiples idiomas)

---

## 📝 Estándares de Código

### JavaScript

**Nomenclatura:**
```javascript
// Variables
const miVariable = 'valor';
let contador = 0;

// Funciones
function miFunction() { }
const arrow = () => { };

// Clases
class MiClase { }

// Constantes
const MI_CONSTANTE = 'valor';
```

**Formato:**
```javascript
// Usar semicolons
const x = 10;

// 2 espacios de indentación
if (condition) {
  console.log('hola');
}

// Comillas simples
const string = 'texto';

// Arrow functions preferentes
const fn = () => { };
```

### SQL

**Mejores prácticas:**
```sql
-- Usar prepared statements siempre
SELECT * FROM usuarios WHERE id = ?

-- Nombrar índices
CREATE INDEX idx_usuario_email ON usuarios(email);

-- Usar aliases legibles
SELECT u.nombre, m.titulo
FROM usuarios u
JOIN materias m ON u.id = m.profesor_id;
```

### Comentarios

```javascript
// Comentario de una línea

/**
 * Comentario de múltiples líneas
 * Útil para funciones complejas
 * @param {string} id - ID del recurso
 * @return {object} Los datos del recurso
 */
```

---

## 🔧 Troubleshooting Desarrollo

### Port already in use
```bash
# Puerto 3000
lsof -i :3000
kill -9 <PID>

# Puerto 5000
lsof -i :5000
kill -9 <PID>
```

### Database connection error
```bash
# Verificar conexión
docker-compose exec mariadb mysql -uroot -proot123 -D educonnect

# Ver logs
docker-compose logs mariadb
```

### Node modules corrupted
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Última actualización:** 2024  
**Versión:** 2.0
