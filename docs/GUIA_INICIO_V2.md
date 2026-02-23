# 🚀 GUÍA DE INICIO - EduConnect v2.0 Profesional

**Última actualización:** 11 de Febrero de 2026  
**Versión:** 2.0 Profesional Enterprise

---

## 📋 Tabla de Contenidos

1. [Requisitos](#requisitos)
2. [Inicio Rápido](#inicio-rápido)
3. [Nuevas Características](#nuevas-características)
4. [Rutas Disponibles](#rutas-disponibles)
5. [Probar Funcionalidades](#probar-funcionalidades)
6. [Solución de Problemas](#solución-de-problemas)

---

## ✅ Requisitos

- Docker & Docker Compose
- Git
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Terminal/Powershell

---

## 🚀 Inicio Rápido

### 1. Clonar/Preparar Proyecto

```bash
cd c:\Users\USER\Desktop\programs\project-main
```

### 2. Iniciar Docker

```bash
# Detener contenedores previos (si existen)
docker-compose down

# Iniciar nuevos contenedores
docker-compose up -d

# Esperar 30 segundos
sleep 30

# Verificar estado
docker-compose ps
```

**Esperado:**
```
NAME      STATUS
nginx     Up
backend   Up
mariadb   Up
```

### 3. Ejecutar Script de Seeding (Datos de Prueba)

```bash
# Entrar a MySQL
docker-compose exec mariadb mysql -u root -proot123 educonnect

# Pegar contenido de: py/seeding-complete.sql

# O ejecutar directamente:
docker-compose exec mariadb mysql -u root -proot123 educonnect < py/seeding-complete.sql
```

### 4. Acceder a la Aplicación

**URL Principal:**
```
http://localhost:5000
```

**Credenciales de Prueba:**
- **Profesor:**
  - Email: `carlos@ejemplo.com`
  - Contraseña: `password123`
  
- **Estudiante:**
  - Email: `estudiante@ejemplo.com`
  - Contraseña: `password123`
  
- **Admin:**
  - Email: `admin@ejemplo.com`
  - Contraseña: `password123`

---

## ✨ Nuevas Características

### 🎨 1. Sistema Visual Profesional

**Archivo:** `css/sistema-visual.css`

**Incluye:**
- Paleta de colores profesional (20+ colores)
- Componentes CSS reutilizables (botones, formas, tarjetas)
- Animaciones suaves
- Diseño responsive
- Soporte para tema oscuro

**Uso:**
```html
<link rel="stylesheet" href="css/sistema-visual.css">

<!-- Usar componentes -->
<button class="btn btn-primary">
    <i class="fas fa-check"></i>
    Guardar
</button>
```

---

### 📊 2. Panel del Profesor v2.0

**URL:** `http://localhost:5000/profesor/dashboard-profesor-v2.html`

**Características:**
- ✅ 4 Tarjetas de Estadísticas (Cursos, Estudiantes, Tareas, Promedio)
- ✅ Grid de Cursos con información completa
- ✅ Crear nuevo curso desde modal
- ✅ Navegar a editar o gestionar curso
- ✅ Interfaz profesional con iconos Font Awesome

**Elementos Destacados:**
```html
<!-- Estadísticas en tiempo real -->
<div class="stat-card">
    <div class="stat-content">
        <h3>Cursos Activos</h3>
        <div class="stat-value" id="stat-cursos">3</div>
    </div>
    <div class="stat-icon">
        <i class="fas fa-book-open"></i>
    </div>
</div>

<!-- Grid de cursos -->
<div class="materias-grid" id="materiasContainer">
    <!-- Llenado dinámicamente -->
</div>
```

**Para Probar:**
1. Login como carlos@ejemplo.com
2. Ir a `profesor/dashboard-profesor-v2.html`
3. Ver 3 cursos precargados
4. Haz clic en "Editar" o "Gestionar"
5. Intenta crear nuevo curso

---

### 🎯 3. Gestión de Materia v2.0

**URL:** `http://localhost:5000/profesor/manage-materia-v2.html?id=1`

**5 Tabs Funcionales:**

#### Tab 1: Lecciones 📖
- Lista de lecciones del curso
- Botones: Editar, Eliminar
- Crear nueva lección
- Cada lección muestra: Número, Título, Preview

#### Tab 2: Tareas 📝
- Lista de tareas
- Estado: Activa o Vencida (colores diferentes)
- Crear nueva tarea
- Editar, Eliminar tareas

#### Tab 3: Estudiantes 👥
- Tabla de estudiantes inscritos
- Información: Nombre, Email, Fecha Inscripción, Promedio

#### Tab 4: Entregas 📦
- Entregas de estudiantes
- Estado de calificación
- Acciones para calificar

#### Tab 5: Recursos 📁 **[NUEVO]**
- **Drag & Drop de archivos**
- Soporta: PDF, Word, PowerPoint, Videos, Imágenes
- Máximo 50MB por archivo
- Visualización de archivos subidos con tamaño

**Código del Upload:**
```html
<div class="upload-area" id="uploadArea">
    <div class="upload-icon">
        <i class="fas fa-cloud-upload-alt"></i>
    </div>
    <p><strong>Arrastra archivos aquí</strong> o haz clic</p>
</div>

<div class="file-list" id="fileList">
    <!-- Muestra archivos subidos -->
</div>
```

**Para Probar:**
1. Ir a `manage-materia-v2.html?id=1`
2. Cambiar entre tabs
3. Crear lección: Haz clic "+ Nueva Lección"
4. Crear tarea: Click en tab Tareas, "+ Nueva Tarea"
5. Ver estudiantes: Tab Estudiantes (3 inscritos)
6. Probar upload: Arrastrar archivo al área o click

---

### 📅 4. Calendario v2.0

**URL:** `http://localhost:5000/Calendario-v2.html`

**Características Principales:**

#### Vista Calendario:
- Mes/año navegable (Anterior/Siguiente)
- Semana estándar (Lun-Dom)
- Días de otros meses atenuados
- Día actual destacado en azul
- Indicadores de eventos (puntitos de color)

#### Vista Lista:
- Toggle: "Mes" / "Lista"
- Todos los eventos en orden cronológico
- Cards profesionales con detalles

#### Sidebar:
- Próximos eventos (5 más cercanos)
- Leyenda de tipos de eventos
- Colores: Rojo=Tarea, Ámbar=Examen, Verde=Lección, Azul=Reunión

**Eventos Incluidos:**
- 9 tareas de cursos
- Fechas automáticas desde BD
- Mostrador automático del estado (Activa/Vencida)

**Para Probar:**
1. Ir a `Calendario-v2.html`
2. Ver calendario del mes actual
3. Eventos cargados desde la BD
4. Haz clic en "Lista" para cambiar vista
5. Navega a mes anterior/siguiente
6. Observa puntitos en días con eventos

---

### 🎨 5. Integración de Font Awesome

**CDN:** `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`

**Iconos Usados:**
```
📊 Estadísticas: <i class="fas fa-chart-line"></i>
📖 Lecciones: <i class="fas fa-book-open"></i>
📝 Tareas: <i class="fas fa-tasks"></i>
👥 Estudiantes: <i class="fas fa-users"></i>
📁 Recursos: <i class="fas fa-folder-open"></i>
📅 Calendario: <i class="fas fa-calendar-alt"></i>
⬆️ Upload: <i class="fas fa-cloud-upload-alt"></i>
✅ Checkmark: <i class="fas fa-check"></i>
❌ Close: <i class="fas fa-times"></i>
Y 40+ más...
```

**Ventajas:**
- No pixelado (vector)
- Escalable (cualquier tamaño)
- Colores dinámicos
- Profesional

---

## 🗺️ Rutas Disponibles

### URLs de Aplicación

```
http://localhost:5000/              - Homepage
http://localhost:5000/Login.html    - Login
http://localhost:5000/Cuenta.html   - Perfil Usuario
http://localhost:5000/Calendario-v2.html - Calendario

PROFESOR:
http://localhost:5000/profesor/dashboard-profesor-v2.html
http://localhost:5000/profesor/manage-materia-v2.html?id=1
http://localhost:5000/profesor/manage-materia-v2.html?id=2
http://localhost:5000/profesor/manage-materia-v2.html?id=3
```

### URLs de API

```
GET    /api/materias                    - Listar materias
GET    /api/materias/mismateria         - Mis materias (profesor)
POST   /api/materias                    - Crear materia
GET    /api/lecciones?materiaId=1       - Lecciones de materia
POST   /api/lecciones                   - Crear lección
PUT    /api/lecciones/:id               - Actualizar lección
DELETE /api/lecciones/:id               - Eliminar lección

GET    /api/tareas                      - Listar tareas
GET    /api/tareas/:id                  - Obtener tarea
POST   /api/tareas                      - Crear tarea
PUT    /api/tareas/:id                  - Actualizar tarea
DELETE /api/tareas/:id                  - Eliminar tarea
PUT    /api/tareas/:id/calificar/:entregaId - Calificar entrega
```

---

## 🧪 Probar Funcionalidades

### Prueba 1: Login y Acceso

```
1. Ir a http://localhost:5000/Login.html
2. Ingresar: carlos@ejemplo.com / password123
3. Debería redirigir a Homepage.html
4. Verificar que aparece "carlos" en navbar
```

### Prueba 2: Panel del Profesor

```
1. Login como carlos@ejemplo.com
2. Ir a http://localhost:5000/profesor/dashboard-profesor-v2.html
3. Deberías ver:
   - 4 Cards de estadísticas
   - 3 Cursos en grid
   - Cada curso muestra: Lecciones, Tareas, Estudiantes, Promedio
4. Haz clic en "Editar" → debería ir a editar-materia.html
5. Haz clic en "Gestionar" → debería ir a manage-materia-v2.html
6. Haz clic en "+ Crear Nuevo Curso" → modal abre
7. Llena formulario y haz clic "Guardar"
8. Espera a que aparezca el nuevo curso
```

### Prueba 3: Gestión de Materia

```
1. Desde dashboard, haz clic "Gestionar" en una materia
2. Deberías ver 5 tabs: Lecciones, Tareas, Estudiantes, Entregas, Recursos
3. Tab Lecciones:
   - Haz clic "+ Nueva Lección"
   - Modal abre
   - Llena: Título, Contenido, Orden
   - Haz clic "Guardar"
   - Lección aparece en tabla
4. Tab Tareas:
   - Haz clic "+ Nueva Tarea"
   - Llena campos
   - Haz clic "Guardar"
   - Tarea aparece con estado
5. Tab Estudiantes:
   - Debería ver 3 estudiantes de prueba
   - Tabla con datos
6. Tab Recursos:
   - Arrastra un archivo (PDF, Word, imagen)
   - O haz clic y selecciona archivo
   - Debería mostrar archivo en lista
```

### Prueba 4: Calendario

```
1. Ir a http://localhost:5000/Calendario-v2.html
2. Debería verse calendario del mes actual
3. Verificar que hay puntitos en días con tareas
4. Haz clic en "Lista" para cambiar vista
5. Debería ver todas las tareas listadas
6. Haz clic en "Mes" para volver a calendario
7. Navega con < y > para cambiar mes
```

### Prueba 5: Datos de Prueba

```bash
# Verificar que los datos existen
docker-compose exec mariadb mysql -u root -proot123 -e "
USE educonnect;
SELECT COUNT(*) as total_lecciones FROM lecciones WHERE activa = 1;
SELECT COUNT(*) as total_tareas FROM tareas WHERE activa = 1;
SELECT COUNT(*) as total_recursos FROM recursos WHERE activa = 1;
"
```

**Esperado:**
- 11 lecciones
- 9 tareas
- 10 recursos

---

## 🔍 Solución de Problemas

### Problema 1: No puedo acceder a localhost:5000

**Solución:**
```bash
# Verificar que Docker está corriendo
docker-compose ps

# Si no está corriendo:
docker-compose up -d

# Ver logs:
docker-compose logs nginx
```

### Problema 2: Página en blanco en dashboard

**Solución:**
```bash
# Verificar que la API funciona
curl http://localhost:3000/api/materias

# Ver logs del backend
docker-compose logs backend

# Limpiar caché del navegador
Ctrl+Shift+Del → Seleccionar todo → Limpiar
```

### Problema 3: No aparecen los datos de prueba

**Solución:**
```bash
# Ejecutar script de seeding manualmente
docker-compose exec mariadb mysql -u root -proot123 educonnect < py/seeding-complete.sql

# Verificar que se ejecutó
docker-compose logs mariadb
```

### Problema 4: Errores de CORS

**Solución:**
```bash
# Reiniciar backend
docker-compose restart backend

# Ver configuración en server/src/app.js
# Debería tener:
# app.use(cors({ origin: '*' }));
```

### Problema 5: Iconos no aparecen

**Solución:**
```html
<!-- Verificar que está en HEAD: -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- O descargar e incluir localmente -->
```

---

## 📊 Archivos Clave

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `css/sistema-visual.css` | Sistema de diseño base | ✅ Nuevo |
| `profesor/dashboard-profesor-v2.html` | Panel del profesor mejorado | ✅ Nuevo |
| `profesor/manage-materia-v2.html` | Gestión completa de materia | ✅ Nuevo |
| `Calendario-v2.html` | Calendario profesional | ✅ Nuevo |
| `py/seeding-complete.sql` | Datos de prueba | ✅ Nuevo |
| `GUIA_MULTER.md` | Sistema de carga de archivos | ✅ Documentado |
| `TRANSFORMACION_V2.md` | Resumen de cambios | ✅ Documentado |

---

## 🎓 Próximos Pasos (Opcional)

### 1. Implementar Multer (2-3 horas)
- Seguir `GUIA_MULTER.md`
- Instalar dependencias
- Implementar upload endpoints
- Testar con archivos reales

### 2. Mejorar Admin Pages (4-5 horas)
- Rediseñar con nuevo sistema visual
- Agregar estadísticas
- Dashboard admin profesional

### 3. Testing (2-3 horas)
- Pruebas de cross-browser
- Performance testing
- Pruebas de carga

### 4. Deploy (1-2 horas)
- Configurar SSL
- Setup de dominio
- Deploy a servidor

---

## 📞 Soporte

**En caso de problemas:**

1. Revisar logs: `docker-compose logs`
2. Consultar documentación en archivo correspondiente
3. Verificar navegador (abrir DevTools con F12)
4. Limpiar caché y cookies

---

## ✅ Checklist de Verificación

- [ ] Docker está corriendo
- [ ] Puedo acceder a http://localhost:5000
- [ ] Puedo hacer login
- [ ] Dashboard del profesor muestra 3 cursos
- [ ] Puedo crear nuevo curso
- [ ] Puedo crear lección
- [ ] Puedo crear tarea
- [ ] Calendario muestra eventos
- [ ] Puedo cambiar entre vistas (Mes/Lista)
- [ ] Iconos Font Awesome aparecen correctamente
- [ ] Colores son consistentes
- [ ] Responsive en móvil (F12 → Device Toggle)

---

**¡Tu aplicación está lista para usar!**

Versión: 2.0 Profesional Enterprise  
Fecha: 11 de Febrero de 2026

