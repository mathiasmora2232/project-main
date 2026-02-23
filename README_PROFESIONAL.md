# EduConnect - Plataforma Educativa Profesional

Plataforma educativa moderna, profesional y completamente funcional construida con Node.js, MariaDB y Docker.

## 🎯 Características Principales

### Para Estudiantes
- ✅ Dashboard personal con estadísticas en tiempo real
- ✅ Inscripción a materias
- ✅ Visualización de lecciones y tareas
- ✅ Entrega de tareas con seguimiento de progreso
- ✅ Visualización de calificaciones
- ✅ Calendario académico
- ✅ Perfil configurable con preferencias de notificaciones
- ✅ Historial de actividad

### Para Profesores
- ✅ Panel dedicado con estadísticas de estudiantes
- ✅ Creación y gestión completa de materias
- ✅ Gestión de lecciones con orden secuencial
- ✅ Creación y configuración de tareas
- ✅ Calificación de entregas
- ✅ Visualización de desempeño estudiantil
- ✅ Reportes de estadísticas
- ✅ Análisis por materia

### Para Administradores
- ✅ Panel administrativo completo
- ✅ Gestión de usuarios (estudiantes, profesores, admin)
- ✅ Gestión de materias
- ✅ Asignación de profesores a cursos
- ✅ Monitoreo de sistema
- ✅ Generación de reportes

### Características Generales
- 🔐 Autenticación JWT segura
- 📱 Diseño responsive (móvil, tablet, desktop)
- 🎨 Interfaz moderna y profesional
- 🔔 Sistema de notificaciones
- 📊 Estadísticas y análisis
- 🌙 Diseño limpio y minimalista

## 🏗️ Arquitectura

### Stack Tecnológico

**Frontend:**
- HTML5 semántico
- CSS3 con variables CSS
- JavaScript vanilla (sin dependencias externas)
- API REST client integrado

**Backend:**
- Node.js 18+
- Express 4.18+
- MariaDB 10.6+
- JWT (autenticación)
- bcrypt (hashing de contraseñas)

**DevOps:**
- Docker & Docker Compose
- Nginx (reverse proxy)
- Volúmenes persistentes para datos

### Base de Datos

8 tablas principales:
- **usuarios** - Cuentas de usuario (estudiantes, profesores, admin)
- **materias** - Cursos académicos
- **lecciones** - Contenido de cursos
- **recursos** - Archivos de lecciones (videos, PDFs)
- **tareas** - Asignaciones de estudiantes
- **entregas** - Envíos de tareas
- **inscripciones** - Enrollment tracking
- **calificaciones** - Qualifications
- **progreso_lecciones** - Lesson completion

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Git para clonar el repositorio
- Puerto 5000 (frontend), 3000 (backend), 3306 (database) disponibles

## 🚀 Instalación y Ejecución

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd project-main
```

### 2. Configurar Variables de Entorno
Crear archivo `.env` en la raíz:
```
MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=educonnect
MYSQL_USER=eduuser
MYSQL_PASSWORD=edupass123
NODE_ENV=development
```

### 3. Iniciar con Docker Compose
```bash
docker-compose up -d
```

### 4. Acceder a la Aplicación

**Frontend:** http://localhost:5000
**Backend API:** http://localhost:3000/api
**PhpMyAdmin:** http://localhost:8080 (usuario: root, contraseña: root123)

## 👥 Usuarios de Prueba

### Estudiante
```
Email: estudiante@ejemplo.com
Contraseña: password123
```

### Profesor
```
Email: carlos@ejemplo.com
Contraseña: password123
```

### Administrador
```
Email: admin@ejemplo.com
Contraseña: password123
```

## 📁 Estructura del Proyecto

```
project-main/
├── frontend/
│   ├── *.html (páginas principales)
│   ├── css/ (estilos)
│   ├── js/ (lógica del cliente)
│   ├── img/ (imágenes)
│   └── profesor/ (páginas exclusivas profesor)
│
├── server/
│   ├── src/
│   │   ├── controllers/ (lógica de negocio)
│   │   ├── routes/ (definición de rutas API)
│   │   ├── middleware/ (autenticación, etc)
│   │   ├── models/ (conexión a BD)
│   │   ├── utils/ (utilidades y validaciones)
│   │   └── server.js (entrada principal)
│   │
│   ├── database/
│   │   ├── init.js (creación de tablas)
│   │   └── seed.js (datos de prueba)
│   │
│   ├── uploads/ (almacenamiento de archivos)
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verificar token

### Materias
- `GET /api/materias` - Listar materias (filtrado por rol)
- `GET /api/materias/:id` - Obtener materia específica
- `GET /api/materias/mismateria` - Mis materias (profesor)
- `POST /api/materias` - Crear materia
- `PUT /api/materias/:id` - Actualizar materia
- `DELETE /api/materias/:id` - Eliminar materia
- `POST /api/materias/:id/inscribir` - Inscribirse en materia
- `DELETE /api/materias/:id/desinscribir` - Desinscribirse

### Lecciones
- `GET /api/lecciones/materia/:materiaId` - Lecciones de materia
- `GET /api/lecciones/:id` - Obtener lección
- `POST /api/lecciones` - Crear lección
- `PUT /api/lecciones/:id` - Actualizar lección
- `DELETE /api/lecciones/:id` - Eliminar lección
- `POST /api/lecciones/:id/completar` - Marcar como completada

### Tareas
- `GET /api/tareas` - Listar tareas (filtrado por rol)
- `GET /api/tareas/materia/:materiaId` - Tareas de materia
- `GET /api/tareas/:id` - Obtener tarea
- `POST /api/tareas` - Crear tarea
- `PUT /api/tareas/:id` - Actualizar tarea
- `DELETE /api/tareas/:id` - Eliminar tarea

### Entregas
- `GET /api/entregas` - Listar entregas
- `GET /api/entregas/tarea/:tareaId` - Entregas de tarea
- `POST /api/entregas` - Enviar entrega
- `PUT /api/entregas/:id/calificar` - Calificar entrega

### Usuarios
- `GET /api/usuarios/perfil` - Obtener perfil
- `PUT /api/usuarios/actualizar` - Actualizar perfil
- `GET /api/usuarios/estadisticas` - Estadísticas del usuario
- `POST /api/usuarios/cambiar-password` - Cambiar contraseña

## 🎨 Diseño y UI

### Paleta de Colores
- Primary: #6366f1 (Indigo)
- Dark: #4f46e5
- Success: #10b981 (Green)
- Warning: #f59e0b (Amber)
- Danger: #ef4444 (Red)
- Neutral: #111827 a #f9fafb

### Componentes Principales
- Headers/Navegación
- Cards con información
- Tablas responsivas
- Modales para formularios
- Grid layouts responsivos
- Iconos emoji para mejor UX

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT con expiración
- ✅ Validación de datos en servidor
- ✅ Protección CORS configurada
- ✅ SQL injection prevention (prepared statements)
- ✅ Control de acceso basado en roles (RBAC)

## 🔄 Workflow de Desarrollo

1. **Frontend** → Cambios en HTML/CSS/JS en `/profesor`, `/admin`, archivos raíz
2. **Backend** → Cambios en `/server/src/controllers`, `/routes`
3. **Database** → Cambios en `/server/database/init.js`
4. **Estilos globales** → `/css/Global.css`

## 🐛 Troubleshooting

### Base de datos no conecta
```bash
docker-compose logs mariadb
```

### Puerto ya en uso
```bash
# Cambiar puerto en docker-compose.yml
# O matar proceso
kill $(lsof -t -i :3000)
```

### Limpiar y reiniciar
```bash
docker-compose down -v
docker-compose up -d
```

## 📚 Documentación Adicional

- [API Documentation](./server/API_DOCS.md)
- [Database Schema](./server/DATABASE.md)
- [Frontend Guide](./FRONTEND.md)

## 🤝 Contribuciones

Este es un proyecto educativo profesional. Para mejoras:
1. Crear rama feature (`git checkout -b feature/AmazingFeature`)
2. Commit cambios (`git commit -m 'Add AmazingFeature'`)
3. Push a rama (`git push origin feature/AmazingFeature`)
4. Abrir Pull Request

## 📄 Licencia

MIT License - Ver LICENSE.md

## 👨‍💻 Autor

Desarrollado como plataforma educativa profesional 2024

---

**Última actualización:** 2024  
**Versión:** 2.0 - Mejoras Profesionales
