# 🐳 Guía de Instalación y Ejecución con Docker

## 📋 Requisitos Previos

- **Docker** (v20+) - [Descargar](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (v2+) - Incluido en Docker Desktop
- **Git** (opcional)
- **Editor de código** (VS Code, Sublime, etc.)

---

## 🚀 Inicio Rápido (5 minutos)

### 1️⃣ Clonar/Descargar el Proyecto

```bash
# Si tienes git
git clone <tu-repo>
cd project-main

# O simplemente navega a la carpeta del proyecto
```

### 2️⃣ Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp server/.env.example server/.env

# Editar si necesario (la mayoría de valores por defecto están bien)
```

### 3️⃣ Iniciar los Contenedores

```bash
# Desde la raíz del proyecto
docker-compose up -d

# La primera vez descargará imágenes y creará contenedores (~2-3 minutos)
```

### 4️⃣ Esperar a que se Inicialice

```bash
# Ver logs
docker-compose logs -f backend

# Esperar a ver: "✅ Servidor EduConnect ejecutándose en puerto 3000"
```

### 5️⃣ Acceder a la Aplicación

```
🌐 Frontend:  http://localhost:5000
🔌 API:       http://localhost:3000/api
💾 Base de datos: localhost:3306
```

---

## 📊 Estructura de la Aplicación

```
proyecto/
├── server/                    # Backend Node.js
│   ├── src/
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── routes/           # Rutas API
│   │   ├── models/           # Conexión BD
│   │   ├── middleware/       # Autenticación
│   │   └── server.js         # Archivo principal
│   ├── database/
│   │   ├── init.js           # Crear tablas
│   │   └── seed.js           # Datos iniciales
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml        # Orquestación de contenedores
├── nginx.conf                # Configuración de servidor web
├── css/                       # Estilos
├── js/                        # JavaScript (incluye api.js)
├── Login.html                # Página de login
├── Register.html             # Página de registro
├── Homepage.html             # Dashboard principal
├── Homepage-dinamico.html    # Dashboard con datos reales
├── Materias.html             # Listado de cursos
└── ...
```

---

## 🔧 Comandos Docker Útiles

### Ver Estado de los Contenedores

```bash
docker-compose ps

# Salida esperada:
# NAME              STATUS
# educonnect-db     Up (healthy)
# educonnect-server Up
# educonnect-frontend Up
```

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo base de datos
docker-compose logs -f mariadb

# Último 50 líneas
docker-compose logs --tail 50
```

### Ejecutar Comandos en el Contenedor

```bash
# Inicializar BD nuevamente (si es necesario)
docker-compose exec backend npm run db:init

# Insertar datos iniciales
docker-compose exec backend npm run db:seed

# Terminal interactiva
docker-compose exec backend sh
```

### Detener/Reiniciar

```bash
# Detener (sin eliminar)
docker-compose stop

# Iniciar
docker-compose start

# Reiniciar
docker-compose restart

# Eliminar contenedores (borrar datos)
docker-compose down

# Eliminar TODO incluyendo volúmenes (⚠️ Cuidado!)
docker-compose down -v
```

---

## 📱 Credenciales de Prueba

Después de ejecutar `docker-compose up`, automáticamente se crean estos usuarios:

### Estudiantes
| Email | Contraseña | Rol |
|-------|-----------|-----|
| carlos@ejemplo.com | password123 | Estudiante |
| ana@ejemplo.com | password123 | Estudiante |

### Profesores
| Email | Contraseña | Rol |
|-------|-----------|-----|
| juan@ejemplo.com | password123 | Profesor |
| maria@ejemplo.com | password123 | Profesor |

---

## 🌐 API Endpoints

### Autenticación

```bash
# Registro
POST /api/auth/register
Content-Type: application/json
{
  "nombre_completo": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "password123",
  "rol": "estudiante"
}

# Login
POST /api/auth/login
{
  "email": "juan@ejemplo.com",
  "password": "password123"
}
# Respuesta:
{
  "token": "eyJhbGc...",
  "usuario": { ... }
}

# Verificar Token
GET /api/auth/verify
Authorization: Bearer <token>
```

### Materias

```bash
# Obtener todas las materias
GET /api/materias

# Obtener materia específica
GET /api/materias/:id

# Crear materia (requiere autenticación)
POST /api/materias
Authorization: Bearer <token>
{
  "nombre": "Programación Web",
  "codigo": "PRO-301",
  "descripcion": "...",
  "creditos": 4,
  "semestre": 3,
  "profesor_id": 1
}
```

### Tareas

```bash
# Obtener tareas pendientes
GET /api/tareas/pendientes/lista

# Obtener tareas de una materia
GET /api/tareas/materia/:materiaId

# Entregar tarea
POST /api/tareas/:tareaId/entregar
Authorization: Bearer <token>
{
  "archivo_url": "https://dropbox.com/...",
  "comentarios": "Aquí está mi tarea"
}
```

### Lecciones

```bash
# Obtener lecciones de una materia
GET /api/lecciones/materia/:materiaId

# Obtener lección específica
GET /api/lecciones/:id

# Marcar como completada
POST /api/lecciones/:id/completar
Authorization: Bearer <token>
```

### Usuarios

```bash
# Obtener perfil
GET /api/usuarios/perfil
Authorization: Bearer <token>

# Obtener estadísticas
GET /api/usuarios/estadisticas
Authorization: Bearer <token>
```

---

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)**. 

### Cómo Funciona

1. Usuario inicia sesión con email/contraseña
2. Servidor verifica credenciales y genera un JWT
3. Cliente guarda el token en `localStorage`
4. En cada request, se envía: `Authorization: Bearer <token>`
5. Servidor verifica el token antes de procesar la solicitud

### Archivo de Configuración API

El archivo `js/api.js` contiene todas las funciones para comunicarse con el backend:

```javascript
// Ejemplo de uso en cualquier HTML
<script src="js/api.js"></script>

// Login
await login('email@ejemplo.com', 'password');

// Obtener materias
const materias = await getMaterias();

// Obtener tareas pendientes
const tareas = await getTareasPendientes();

// Crear notificación
showNotification('¡Éxito!', 'success');
```

---

## 🗄️ Base de Datos

### Estructura de Tablas

#### usuarios
```sql
- id (INT, PK)
- nombre_completo (VARCHAR 255)
- email (VARCHAR 255, UNIQUE)
- password (VARCHAR 255, hashed)
- rol (ENUM: 'estudiante', 'profesor', 'admin')
- activo (BOOLEAN)
- created_at (TIMESTAMP)
```

#### materias
```sql
- id (INT, PK)
- nombre (VARCHAR 255)
- codigo (VARCHAR 50, UNIQUE)
- descripcion (TEXT)
- creditos (INT)
- semestre (INT)
- profesor_id (FK -> usuarios.id)
- activa (BOOLEAN)
```

#### tareas
```sql
- id (INT, PK)
- materia_id (FK)
- titulo (VARCHAR 255)
- descripcion (TEXT)
- fecha_entrega (DATETIME)
- puntos_totales (INT)
- activa (BOOLEAN)
```

#### lecciones
```sql
- id (INT, PK)
- materia_id (FK)
- titulo (VARCHAR 255)
- contenido (LONGTEXT)
- numero_leccion (INT)
- duracion_estimada (INT, minutos)
- activa (BOOLEAN)
```

#### entregas
```sql
- id (INT, PK)
- tarea_id (FK)
- usuario_id (FK)
- archivo_url (VARCHAR 500)
- comentarios (TEXT)
- estado (ENUM: 'entregada', 'evaluada', 'tardía')
- calificacion (INT)
- entregada_en (TIMESTAMP)
```

#### progreso_lecciones
```sql
- id (INT, PK)
- usuario_id (FK)
- leccion_id (FK)
- completada (BOOLEAN)
- completada_en (TIMESTAMP)
```

---

## 🔗 Conectar a Base de Datos Externamente

Si quieres acceder a la base de datos desde tu máquina local (DBeaver, MySQL Workbench):

```
Host: localhost
Puerto: 3306
Usuario: educonnect
Contraseña: educonnect123
Base de datos: educonnect_db
```

---

## 🚀 Deploy a Producción

### Preparación

1. **Cambiar contraseñas por defecto**
   ```bash
   # Editar server/.env
   DB_PASSWORD=tu_contraseña_segura
   JWT_SECRET=tu_clave_muy_segura
   ```

2. **Cambiar modo de producción**
   ```bash
   NODE_ENV=production
   ```

3. **Configurar dominio**
   ```bash
   FRONTEND_URL=https://tudominio.com
   ```

### Opciones de Hosting

#### ✅ Recomendado para Principiantes
- **Vercel** - Frontend (gratis)
- **Render.com** - Backend con BD (plan gratuito disponible)
- **Railway** - Todo junto (muy fácil)

#### ✅ Recomendado para Producción
- **AWS** - EC2 + RDS
- **DigitalOcean** - VPS $5/mes
- **Heroku** - PaaS sencillo (ahora de pago)
- **Linode** - VPS sencillo

### Pasos de Deploy (Ejemplo en Railway)

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Crear proyecto
railway init

# 4. Conectar servicio
railway add

# 5. Deploy
railway up
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to Docker daemon"
```bash
# Asegúrate de que Docker está ejecutándose
docker ps

# En Windows, inicia Docker Desktop
```

### Error: "Port 3306 already in use"
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "3307:3306"  # Cambiar de 3306 a 3307
```

### Error: "Database connection refused"
```bash
# Esperar a que MariaDB esté listo
docker-compose logs mariadb

# Reintentar conexión
docker-compose restart backend
```

### API devuelve "Token inválido"
```bash
# Cerrar sesión y volver a login
localStorage.clear()
window.location.href = '/Login.html'
```

### Las materias no aparecen
```bash
# Reinicializar datos
docker-compose exec backend npm run db:seed

# Ver logs
docker-compose logs backend
```

---

## 📝 Personalización

### Cambiar Puerto de Frontend
```yaml
# docker-compose.yml
frontend:
  ports:
    - "8080:80"  # Cambiar de 5000 a 8080
```

### Cambiar Contraseña de Base de Datos
```yaml
# docker-compose.yml
environment:
  MYSQL_PASSWORD: tu_nueva_contraseña
```

### Agregar Más Materias
```bash
# Editar server/database/seed.js
# Modificar array de materias

# Reinicializar
docker-compose exec backend npm run db:seed
```

---

## 📞 Soporte

Si tienes problemas:

1. **Revisar logs**: `docker-compose logs -f`
2. **Reiniciar**: `docker-compose restart`
3. **Reconstruir**: `docker-compose up --build`
4. **Limpiar todo**: `docker-compose down -v && docker-compose up -d`

---

**¡Tu aplicación está lista para desarrollo y producción!** 🎉
