# 🎓 EduConnect - Plataforma Educativa Moderna

> Una plataforma educativa fullstack moderna, responsiva y lista para producción.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![Docker](https://img.shields.io/badge/docker-ready-blue)

---

## ✨ Características

### 📚 Para Estudiantes
- ✅ Dashboard dinámico con estadísticas en tiempo real
- ✅ Acceso a materias y lecciones estructuradas
- ✅ Sistema de tareas con seguimiento
- ✅ Calendario académico integrado
- ✅ Perfil y registro de calificaciones
- ✅ Notificaciones de eventos importantes

### 👨‍🏫 Para Profesores
- ✅ Panel de control de estudiantes
- ✅ Creación y gestión de materias
- ✅ Publicación de lecciones y recursos
- ✅ Asignación de tareas
- ✅ Evaluación de entregas
- ✅ Generación de reportes

### 🔐 Seguridad
- ✅ Autenticación con JWT
- ✅ Contraseñas encriptadas (bcrypt)
- ✅ Validación de datos en frontend y backend
- ✅ Protección CORS
- ✅ Control de roles (estudiante/profesor/admin)

---

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con variables CSS
- **JavaScript (Vanilla)** - Sin dependencias innecesarias
- **Responsive Design** - Mobile-first

### Backend
- **Node.js** (v18+) - Runtime de JavaScript
- **Express.js** - Framework web ligero
- **MySQL/MariaDB** - Base de datos relacional
- **JWT** - Autenticación segura
- **bcryptjs** - Hash de contraseñas

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación de servicios
- **Nginx** - Servidor web y proxy reverso

---

## 📋 Requisitos

- Node.js 18+
- Docker & Docker Compose
- 2GB RAM disponible
- Conexión a Internet

---

## 🚀 Inicio Rápido

### Opción 1: Con Docker (⭐ Recomendado)

```bash
# 1. Clonar proyecto
git clone <repo-url>
cd project-main

# 2. Iniciar servicios
docker-compose up -d

# 3. Esperar a que se inicialice (~1-2 minutos)
docker-compose logs -f backend

# 4. Acceder
🌐 http://localhost:5000
```

**Credenciales de prueba:**
- Email: `carlos@ejemplo.com`
- Contraseña: `password123`

### Opción 2: Sin Docker (Desarrollo Local)

```bash
# 1. Backend
cd server
npm install
cp .env.example .env
npm run db:init
npm run db:seed
npm run dev

# 2. Frontend (en otra terminal)
# Usar VS Code Live Server o http-server
# Acceder a http://localhost:5000
```

---

## 📁 Estructura del Proyecto

```
educonnect/
├── server/                          # Backend Node.js
│   ├── src/
│   │   ├── controllers/            # Lógica de negocio
│   │   │   ├── authController.js
│   │   │   ├── materiasController.js
│   │   │   ├── tareasController.js
│   │   │   ├── leccionesController.js
│   │   │   └── usuariosController.js
│   │   ├── routes/                 # Definición de rutas
│   │   │   ├── auth.js
│   │   │   ├── materias.js
│   │   │   ├── tareas.js
│   │   │   ├── lecciones.js
│   │   │   └── usuarios.js
│   │   ├── models/
│   │   │   └── db.js              # Conexión a BD
│   │   ├── middleware/
│   │   │   └── auth.js            # Validación de JWT
│   │   └── server.js              # Punto de entrada
│   ├── database/
│   │   ├── init.js                # Crear tablas
│   │   └── seed.js                # Datos iniciales
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── css/                             # Estilos
│   ├── Global.css                 # Estilos base con variables
│   ├── homepage.css
│   ├── login.css
│   ├── materias.css
│   ├── Cuenta.css
│   ├── calendario.css
│   ├── malla.css
│   └── admindasbord.css
├── js/                              # JavaScript
│   ├── api.js                     # ⭐ Cliente API (IMPORTANTE)
│   ├── app.js                     # Lógica general
│   ├── adminlink.js
│   ├── dashboard-admin.js
│   └── ...
├── img/                             # Imágenes y recursos
├── html/                            # Páginas HTML
│   ├── Homepage.html              # Dashboard principal
│   ├── Homepage-dinamico.html     # Dashboard con datos reales
│   ├── Login.html
│   ├── Register.html
│   ├── Materias.html
│   ├── Cuenta.html
│   ├── Calendario.html
│   ├── Malla.html
│   └── ...
├── admin/                           # Páginas de administración
│   ├── dashboard-admin.html
│   ├── gestion-estudiantes.html
│   └── ...
├── profesor/                        # Páginas de profesor
│   ├── dashboard-profesor.html
│   └── ...
├── docker-compose.yml             # Orquestación de servicios
├── nginx.conf                      # Configuración web
├── .gitignore
├── DOCKER_GUIA.md                 # ⭐ Guía Docker (IMPORTANTE)
└── README.md                       # Este archivo
```

---

## 🌐 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token

### Materias
- `GET /api/materias` - Obtener todas las materias
- `GET /api/materias/:id` - Obtener materia específica
- `POST /api/materias` - Crear materia (profesor)

### Tareas
- `GET /api/tareas/pendientes/lista` - Tareas pendientes
- `GET /api/tareas/materia/:materiaId` - Tareas de una materia
- `POST /api/tareas/:tareaId/entregar` - Entregar tarea

### Lecciones
- `GET /api/lecciones/materia/:materiaId` - Lecciones de materia
- `GET /api/lecciones/:id` - Obtener lección
- `POST /api/lecciones/:id/completar` - Marcar como completada

### Usuarios
- `GET /api/usuarios/perfil` - Obtener perfil
- `GET /api/usuarios/estadisticas` - Estadísticas del estudiante
- `PUT /api/usuarios/perfil` - Actualizar perfil

---

## 🗄️ Base de Datos

### Tablas Principales

```
usuarios
├── id (PK)
├── nombre_completo
├── email (UNIQUE)
├── password (encriptada)
├── rol (estudiante|profesor|admin)
└── timestamp

materias
├── id (PK)
├── nombre
├── codigo (UNIQUE)
├── creditos
├── semestre
├── profesor_id (FK)
└── timestamp

lecciones
├── id (PK)
├── materia_id (FK)
├── titulo
├── contenido
├── numero_leccion
└── duracion_estimada

tareas
├── id (PK)
├── materia_id (FK)
├── titulo
├── descripcion
├── fecha_entrega
└── puntos_totales

entregas
├── id (PK)
├── tarea_id (FK)
├── usuario_id (FK)
├── archivo_url
├── estado
└── calificacion
```

---

## 🔐 Seguridad

### Autenticación JWT
- Tokens con expiración de 7 días
- Renovación de token en cada login
- Validación de token en cada request autenticado

### Encriptación
- Contraseñas hasheadas con bcrypt
- Variables sensibles en `.env`
- CORS configurado para dominios específicos

### Validación
- Validación de entrada en frontend
- Validación de entrada en backend
- Control de roles por endpoint

---

## 🚢 Deploy a Producción

### Cambios Necesarios

1. **Actualizar variables de entorno**
   ```bash
   # server/.env
   NODE_ENV=production
   DB_HOST=tu-db-remota.com
   DB_USER=usuario_prod
   DB_PASSWORD=contraseña_segura
   JWT_SECRET=clave_muy_segura
   FRONTEND_URL=https://tudominio.com
   ```

2. **Subir a servidor**
   ```bash
   # Opción A: VPS con Docker
   docker-compose -f docker-compose.prod.yml up -d
   
   # Opción B: Usar Railway/Render/Heroku
   # Ver DOCKER_GUIA.md para instrucciones
   ```

3. **Configurar HTTPS**
   - Usar Let's Encrypt con Certbot
   - O usar servicio de hosting que proporcione SSL gratis

### Servicios Recomendados
- **Frontend**: Vercel, Netlify (gratis)
- **Backend**: Railway, Render, DigitalOcean
- **Base de datos**: Aiven, PlanetScale, Heroku Postgres

---

## 📚 Documentación Adicional

- [🐳 DOCKER_GUIA.md](DOCKER_GUIA.md) - Instalación y deployment con Docker
- [📖 MEJORAS.md](MEJORAS.md) - Cambios técnicos detallados
- [👤 GUIA_DE_USUARIO.md](GUIA_DE_USUARIO.md) - Manual de usuario
- [⚡ REFERENCIA_RAPIDA.md](REFERENCIA_RAPIDA.md) - Quick start para desarrolladores

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

Desarrollado con ❤️ para la educación moderna.

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa la [documentación](DOCKER_GUIA.md)
2. Mira los [logs de Docker](DOCKER_GUIA.md#ver-logs)
3. Verifica las credenciales de BD
4. Reinicia los servicios: `docker-compose restart`

---

## 🎯 Roadmap (Próximas Características)

- [ ] Dark mode
- [ ] Sistema de mensajería en tiempo real
- [ ] Videoconferencias integradas
- [ ] Gamificación (puntos, badges)
- [ ] Mobile app (React Native)
- [ ] Sistema de evaluaciones online
- [ ] Análisis de desempeño con IA
- [ ] Exportación de calificaciones a PDF

---

<p align="center">
  ⭐ Si te gusta este proyecto, dale una estrella en GitHub
</p>
