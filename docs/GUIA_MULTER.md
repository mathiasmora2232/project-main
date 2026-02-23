# 🚀 Guía de Implementación - Carga de Archivos con Multer

## Resumen

Esta guía te ayudará a implementar la funcionalidad de carga de archivos para tareas, lecciones y recursos en EduConnect v2.0.

---

## 1. Instalación de Dependencias

```bash
cd server
npm install multer sharp
npm install --save-dev @types/multer
```

**¿Por qué estas dependencias?**
- `multer`: Middleware para manejar cargas de archivos
- `sharp`: Procesamiento de imágenes (redimensionamiento, optimización)

---

## 2. Configurar Multer en el Servidor

### 2.1 Crear archivo de configuración

**`server/src/config/multer.js`**

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorios si no existen
const uploadDirs = [
    'uploads/tareas',
    'uploads/recursos',
    'uploads/lecciones',
    'uploads/temp'
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determinar destino según el tipo de archivo
        let uploadPath = 'uploads/temp';
        
        if (req.body.tipo === 'tarea') {
            uploadPath = 'uploads/tareas';
        } else if (req.body.tipo === 'leccion') {
            uploadPath = 'uploads/lecciones';
        } else if (req.body.tipo === 'recurso') {
            uploadPath = 'uploads/recursos';
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, extension);
        cb(null, `${nameWithoutExt}-${uniqueSuffix}${extension}`);
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Tipos MIME permitidos
    const allowedMimes = {
        'application/pdf': ['pdf'],
        'application/msword': ['doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
        'application/vnd.ms-excel': ['xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
        'application/vnd.ms-powerpoint': ['ppt'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/gif': ['gif'],
        'image/webp': ['webp'],
        'video/mp4': ['mp4'],
        'video/mpeg': ['mpeg'],
        'audio/mpeg': ['mp3'],
        'application/zip': ['zip'],
        'application/x-rar-compressed': ['rar']
    };

    const extension = path.extname(file.originalname).toLowerCase().slice(1);
    const mimeType = file.mimetype;

    if (allowedMimes[mimeType] && allowedMimes[mimeType].includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${extension}`), false);
    }
};

// Crear instancia de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB máximo
        files: 10 // Máximo 10 archivos por request
    }
});

module.exports = upload;
```

---

## 3. Crear Rutas para Carga de Archivos

### 3.1 Actualizar `server/src/routes/tareas.js`

```javascript
const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth');
const upload = require('../config/multer');
const tareasController = require('../controllers/tareasController');

// Ruta para crear tarea con archivo
router.post(
    '/',
    verificarToken,
    verificarRol(['profesor', 'admin']),
    upload.single('archivo'),
    tareasController.crearTarea
);

// Ruta para subir archivo a una tarea
router.post(
    '/:id/archivos',
    verificarToken,
    verificarRol(['profesor', 'admin']),
    upload.single('archivo'),
    tareasController.agregarArchivoTarea
);

// Ruta para descargar archivo
router.get(
    '/descargar/:archivoId',
    verificarToken,
    tareasController.descargarArchivo
);

// Ruta para eliminar archivo
router.delete(
    '/archivos/:archivoId',
    verificarToken,
    verificarRol(['profesor', 'admin']),
    tareasController.eliminarArchivo
);

module.exports = router;
```

### 3.2 Actualizar `server/src/routes/lecciones.js`

```javascript
const upload = require('../config/multer');

// Agregar archivos a lección
router.post(
    '/:id/recursos',
    verificarToken,
    verificarRol(['profesor', 'admin']),
    upload.single('archivo'),
    leccionesController.agregarRecurso
);

// Descargar recurso
router.get(
    '/recurso/descargar/:recursoId',
    verificarToken,
    leccionesController.descargarRecurso
);
```

---

## 4. Actualizar Controllers

### 4.1 Extender `tareasController.js`

```javascript
exports.crearTarea = async (req, res) => {
    try {
        if (req.user?.rol !== 'profesor' && req.user?.rol !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso' });
        }

        const { titulo, descripcion, fecha_entrega, puntos_totales, materia_id } = req.body;
        const archivo = req.file;

        // Validar datos
        if (!titulo || !fecha_entrega || !puntos_totales) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        // Insertar tarea
        const result = await query(
            `INSERT INTO tareas (materia_id, titulo, descripcion, fecha_entrega, puntos_totales, profesor_id, activa)
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [materia_id, titulo, descripcion, fecha_entrega, puntos_totales, req.user.id]
        );

        const tareaId = result.insertId;

        // Si hay archivo, guardarlo
        if (archivo) {
            await query(
                `INSERT INTO archivos_tarea (tarea_id, nombre_original, ruta_archivo, tipo_mime, tamaño, profesor_id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [tareaId, archivo.originalname, archivo.path, archivo.mimetype, archivo.size, req.user.id]
            );
        }

        res.status(201).json({
            mensaje: 'Tarea creada exitosamente',
            tarea_id: tareaId,
            archivo: archivo ? {
                id: result.insertId,
                nombre: archivo.originalname,
                tamaño: archivo.size
            } : null
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al crear la tarea' });
    }
};

exports.agregarArchivoTarea = async (req, res) => {
    try {
        const { id } = req.params;
        const archivo = req.file;

        if (!archivo) {
            return res.status(400).json({ error: 'No se proporcionó archivo' });
        }

        // Verificar que la tarea existe y pertenece al profesor
        const [tarea] = await query(
            'SELECT * FROM tareas WHERE id = ? AND profesor_id = ?',
            [id, req.user.id]
        );

        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        // Guardar archivo
        const result = await query(
            `INSERT INTO archivos_tarea (tarea_id, nombre_original, ruta_archivo, tipo_mime, tamaño, profesor_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, archivo.originalname, archivo.path, archivo.mimetype, archivo.size, req.user.id]
        );

        res.json({
            mensaje: 'Archivo agregado exitosamente',
            archivo_id: result.insertId,
            nombre: archivo.originalname,
            tamaño: archivo.size
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al agregar archivo' });
    }
};

exports.descargarArchivo = async (req, res) => {
    try {
        const { archivoId } = req.params;

        const [archivo] = await query(
            'SELECT * FROM archivos_tarea WHERE id = ?',
            [archivoId]
        );

        if (!archivo) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        res.download(archivo.ruta_archivo, archivo.nombre_original);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al descargar archivo' });
    }
};

exports.eliminarArchivo = async (req, res) => {
    try {
        const { archivoId } = req.params;
        const fs = require('fs').promises;

        const [archivo] = await query(
            'SELECT * FROM archivos_tarea WHERE id = ? AND profesor_id = ?',
            [archivoId, req.user.id]
        );

        if (!archivo) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // Eliminar del sistema de archivos
        try {
            await fs.unlink(archivo.ruta_archivo);
        } catch (err) {
            console.warn('No se pudo eliminar archivo físico:', err);
        }

        // Eliminar del BD
        await query('DELETE FROM archivos_tarea WHERE id = ?', [archivoId]);

        res.json({ mensaje: 'Archivo eliminado' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al eliminar archivo' });
    }
};
```

---

## 5. Crear Tabla de Archivos en BD

```sql
-- Tabla para archivos de tareas
CREATE TABLE archivos_tarea (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tarea_id INT NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100),
    tamaño BIGINT,
    profesor_id INT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activa BOOLEAN DEFAULT 1,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_id) REFERENCES usuarios(id),
    INDEX (tarea_id),
    INDEX (profesor_id)
);

-- Tabla para archivos de lecciones
CREATE TABLE archivos_leccion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    leccion_id INT NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100),
    tamaño BIGINT,
    profesor_id INT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activa BOOLEAN DEFAULT 1,
    FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_id) REFERENCES usuarios(id),
    INDEX (leccion_id),
    INDEX (profesor_id)
);

-- Tabla para entregas de estudiantes
CREATE TABLE archivos_entrega (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entrega_id INT NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100),
    tamaño BIGINT,
    estudiante_id INT NOT NULL,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activa BOOLEAN DEFAULT 1,
    FOREIGN KEY (entrega_id) REFERENCES entregas(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_id) REFERENCES usuarios(id),
    INDEX (entrega_id),
    INDEX (estudiante_id)
);
```

---

## 6. Actualizar Frontend

### 6.1 Ejemplo en `manage-materia-v2.html`

```html
<!-- En el formulario de crear tarea -->
<form id="createTareaForm">
    <!-- ... otros campos ... -->
    
    <div class="form-group">
        <label class="form-label">Archivo de Referencia (Opcional)</label>
        <input type="file" class="form-input" id="tareaArchivo" accept=".pdf,.doc,.docx,.ppt,.pptx">
        <small class="form-helper">Máximo 50MB. Tipos: PDF, Word, PowerPoint</small>
    </div>
</form>

<!-- En el script -->
<script>
document.getElementById('createTareaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('titulo', document.getElementById('tareaTitulo').value);
    formData.append('descripcion', document.getElementById('tareaDescripcion').value);
    formData.append('fecha_entrega', document.getElementById('tareaFecha').value);
    formData.append('puntos_totales', document.getElementById('tareaPuntos').value);
    formData.append('materia_id', courseId);
    formData.append('tipo', 'tarea');
    
    // Agregar archivo si existe
    const archivoInput = document.getElementById('tareaArchivo');
    if (archivoInput.files.length > 0) {
        formData.append('archivo', archivoInput.files[0]);
    }

    try {
        const response = await fetch('/api/tareas', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            alert('Tarea creada exitosamente');
            closeCreateTareaModal();
            loadTareas();
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});
</script>
```

---

## 7. Consideraciones de Seguridad

### 7.1 Validación en Backend
- ✅ Validar tipos MIME
- ✅ Validar extensiones de archivo
- ✅ Limitar tamaño máximo
- ✅ Verificar permisos del usuario
- ✅ Sanitizar nombres de archivo

### 7.2 Almacenamiento
- ✅ Guardar archivos fuera de web root
- ✅ Usar rutas generadas, no nombres originales
- ✅ Verificar espacio en disco
- ✅ Implementar limpeza de archivos temporales

### 7.3 Descarga
- ✅ Verificar permisos antes de descargar
- ✅ Usar streaming para archivos grandes
- ✅ Registrar descargas en logs

---

## 8. Testing

### 8.1 Prueba con cURL

```bash
# Subir archivo a tarea
curl -X POST http://localhost:3000/api/tareas \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "titulo=Mi Tarea" \
  -F "descripcion=Descripción" \
  -F "fecha_entrega=2026-02-20" \
  -F "puntos_totales=100" \
  -F "materia_id=1" \
  -F "tipo=tarea" \
  -F "archivo=@/path/to/file.pdf"
```

### 8.2 Prueba en Navegador

1. Ir a `manage-materia-v2.html`
2. Hacer clic en "Nueva Tarea"
3. Seleccionar un archivo
4. Enviar formulario
5. Verificar que el archivo se subió

---

## 9. Optimización de Imágenes

### 9.1 Procesar imágenes automáticamente

```javascript
const sharp = require('sharp');

exports.agregarArchivoTarea = async (req, res) => {
    try {
        let file = req.file;
        
        // Si es imagen, redimensionar
        if (file.mimetype.startsWith('image/')) {
            const optimizedPath = file.path.replace(/\.[^.]+$/, '-optimized.webp');
            
            await sharp(file.path)
                .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(optimizedPath);
            
            file.path = optimizedPath;
            file.optimized = true;
        }
        
        // ... resto del código ...
    } catch (error) {
        console.error('Error:', error);
    }
};
```

---

## 10. Próximos Pasos

- [ ] Implementar cuota de almacenamiento por usuario
- [ ] Agregar vista previa de archivos
- [ ] Implementar versionado de archivos
- [ ] Agregar escaneo de virus (ClamAV)
- [ ] Implementar sincronización con cloud (AWS S3, etc.)
- [ ] Agregar compresión automática de archivos
- [ ] Crear sistema de backups de archivos

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose logs backend`
2. Verifica permisos de carpeta: `chmod 755 uploads/`
3. Revisa la configuración de Multer
4. Comprueba límites de tamaño en nginx.conf

