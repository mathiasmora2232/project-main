# 🎯 INICIO RÁPIDO - Tu Aplicación en 5 Minutos

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     TU COMPUTADORA                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │         DOCKER DESKTOP (Contenedor)               │   │
│  ├────────────────────────────────────────────────────┤   │
│  │                                                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │   │
│  │  │  NGINX   │  │  NODE.JS │  │   MARIADB    │    │   │
│  │  │:5000     │  │ :3000    │  │  :3306       │    │   │
│  │  │Frontend  │  │  API     │  │  Database    │    │   │
│  │  └──────────┘  └──────────┘  └──────────────┘    │   │
│  │       ↑              ↓              ↓             │   │
│  │    Sirve         Procesa         Almacena        │   │
│  │   HTML/CSS/JS   Solicitudes     Datos           │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                         ↑                                 │
│                    Tu navegador                          │
│              http://localhost:5000                       │
│                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ 5 PASOS PARA EMPEZAR

### 1️⃣ INSTALAR DOCKER
```
🌐 https://www.docker.com/products/docker-desktop
   - Descarga e instala
   - Reinicia tu computadora
   - Abre Docker Desktop
```

### 2️⃣ ABRIR TERMINAL EN LA CARPETA DEL PROYECTO
```
C:\Users\USER\Desktop\programs\project-main
```

### 3️⃣ EJECUTAR UNO DE ESTOS COMANDOS

**Para Windows (en PowerShell):**
```powershell
.\start.bat
```

**Para Mac/Linux:**
```bash
./start.sh
```

**O manualmente:**
```bash
docker-compose up -d
```

### 4️⃣ ESPERAR A QUE CARGUE (2-3 MINUTOS)
```
Ver en terminal:
✅ educonnect-db   | ... (healthy)
✅ educonnect-server | ... puerto 3000
✅ educonnect-frontend | ... puerto 5000
```

### 5️⃣ ABRIR EN EL NAVEGADOR
```
🌐 http://localhost:5000
```

---

## 🔐 LOGIN (Usar CUALQUIERA de estos)

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Estudiante | `carlos@ejemplo.com` | `password123` |
| Estudiante | `ana@ejemplo.com` | `password123` |
| Profesor | `juan@ejemplo.com` | `password123` |
| Profesor | `maria@ejemplo.com` | `password123` |

---

## 🎯 QUÉ VERÁS

### Después del Login:

```
┌────────────────────────────────────────┐
│        📚 EduConnect - Dashboard        │
├────────────────────────────────────────┤
│  ¡Hola, Carlos!                        │
│                                        │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ 📈 Progreso  │  │ 📝 Tareas    │   │
│  │ 8.7/10       │  │ 6 pendientes │   │
│  │ ↗ +5%        │  │ 3 urgentes   │   │
│  └──────────────┘  └──────────────┘   │
│                                        │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ 🕐 Horario   │  │ 📚 Materias  │   │
│  │ 3 clases hoy │  │ 5 cursos     │   │
│  │              │  │ 25 lecciones │   │
│  └──────────────┘  └──────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

### Materias Disponibles:
1. ✓ Matemáticas Discretas
2. ✓ Física I
3. ✓ Programación
4. ✓ Contabilidad General
5. ✓ Literatura Hispanoamericana

Cada materia tiene:
- 5 lecciones
- 4 tareas
- 3 recursos (video, PDF, enlace)

---

## 📱 FUNCIONALIDADES

### Dashboard
- [x] Ver progreso académico
- [x] Ver tareas pendientes
- [x] Ver próximas clases
- [x] Ver materias activas

### Materias
- [x] Listar todas las materias
- [x] Ver detalles de cada materia
- [x] Ver lecciones
- [x] Enviar tareas

### Perfil
- [x] Ver información personal
- [x] Ver calificaciones
- [x] Ver progreso
- [x] Actualizar datos

### Administración (si eres profesor)
- [x] Crear materias
- [x] Crear lecciones
- [x] Asignar tareas
- [x] Calificar entregas

---

## 🔗 URLS IMPORTANTES

| Recurso | URL |
|---------|-----|
| **Frontend** | http://localhost:5000 |
| **API** | http://localhost:3000/api |
| **BD** | localhost:3306 |
| **Usuario BD** | `educonnect` |
| **Contraseña BD** | `educonnect123` |

---

## 📚 API ENDPOINTS (Para developers)

### Obtener Materias
```bash
curl http://localhost:3000/api/materias
```

### Obtener Tareas Pendientes
```bash
curl http://localhost:3000/api/tareas/pendientes/lista
```

### Obtener Lecciones
```bash
curl http://localhost:3000/api/lecciones/materia/1
```

### Login (necesario para usar otros endpoints)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"carlos@ejemplo.com",
    "password":"password123"
  }'
```

---

## 🛑 COMANDOS ÚTILES

### Ver estado de servicios
```bash
docker-compose ps
```

### Ver logs del servidor
```bash
docker-compose logs -f backend
```

### Detener todo
```bash
docker-compose stop
```

### Reiniciar todo
```bash
docker-compose restart
```

### Eliminar todo y empezar de nuevo
```bash
docker-compose down -v
docker-compose up -d
```

---

## ❌ SOLUCIONAR PROBLEMAS

### "Puerto 5000 ya está en uso"
```bash
# Cambiar puerto en docker-compose.yml
# Cambiar "5000:80" a "8080:80"
# Luego acceder a http://localhost:8080
```

### "No puedo conectar a la base de datos"
```bash
# Espera a que MariaDB esté listo
docker-compose logs mariadb
# Espera a ver: "ready for connections"
```

### "Las materias no aparecen"
```bash
# Reinicializar datos
docker-compose exec backend npm run db:seed

# Refrescar navegador
```

### "Error: Cannot connect to Docker daemon"
```bash
# Asegúrate de que Docker Desktop está abierto
# En Windows: Abre Docker Desktop desde Inicio
```

---

## 📞 ¿NECESITAS AYUDA?

Lee estos archivos (en orden):

1. **[DOCKER_GUIA.md](DOCKER_GUIA.md)** - Guía completa de Docker (400+ líneas)
2. **[README_NUEVO.md](README_NUEVO.md)** - Documentación técnica
3. **[GUIA_DE_USUARIO.md](GUIA_DE_USUARIO.md)** - Manual de usuario
4. **[TRANSFORMACION_COMPLETA.md](TRANSFORMACION_COMPLETA.md)** - Qué se implementó

---

## 🚀 SIGUIENTE PASO

Una vez que esté corriendo:

1. **Explora el Dashboard** - Ve todas las materias cargadas
2. **Entra a una Materia** - Ve lecciones y tareas reales
3. **Intenta Entregar una Tarea** - Prueba la funcionalidad
4. **Cambia a Profesor** - Crea nuevas materias/tareas
5. **Mira la BD** - Conecta con cliente MySQL (DBeaver, Workbench)

---

## ✅ CHECKLIST FINAL

- [ ] Docker Desktop instalado y abierto
- [ ] Terminal abierta en la carpeta del proyecto
- [ ] Ejecuté `docker-compose up -d` sin errores
- [ ] Accedí a http://localhost:5000
- [ ] Me logié con credenciales de prueba
- [ ] Vi el Dashboard con datos reales
- [ ] Vi las materias cargadas
- [ ] Revisé una lección
- [ ] Intenté entregar una tarea

**Si todo está marcado = ✅ ¡LISTO PARA USAR!**

---

## 🎓 ARQUITECTURA TÉCNICA

```
CLIENTE (Navegador)
    ↓ HTTP/HTTPS
NGINX (Puerto 5000)
    ├─ Sirve HTML, CSS, JS
    └─ Redirige /api a Backend
    ↓
NODE.JS (Puerto 3000)
    ├─ Procesa solicitudes
    ├─ Valida JWT
    └─ Ejecuta lógica de negocio
    ↓
MARIADB (Puerto 3306)
    └─ Almacena datos persistentes
```

---

## 📊 DATOS PRECARGADOS

- **4 Usuarios**: 2 profesores + 2 estudiantes
- **5 Materias**: Completas con información real
- **25 Lecciones**: 5 por materia
- **20 Tareas**: 4 por materia
- **15 Recursos**: Videos, PDFs, enlaces

---

## 🎯 ESTADO: LISTO PARA PRODUCCIÓN

```
✅ Backend:        Funcional
✅ Base de datos:  Funcional
✅ Frontend:       Funcional
✅ Docker:         Funcional
✅ Documentación:  Completa
✅ Datos de prueba: Listos
✅ Autenticación:  Funcional
✅ API:            Funcional

STATUS: 🟢 VERDE - LISTO PARA USAR
```

---

**Última actualización**: 10 de febrero de 2026  
**Versión**: 1.0.0 - PRODUCTION READY  
**Creador**: Sistema de Automatización EduConnect  

---

**¡Que disfrutes tu plataforma educativa moderna!** 🎉
