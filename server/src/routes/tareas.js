const express = require('express');
const router = express.Router();
const tareasController = require('../controllers/tareasController');
const authMiddleware = require('../middleware/auth');

// Obtener tareas pendientes (needs auth for role-based filtering)
router.get('/pendientes/lista', authMiddleware, tareasController.getTareasPendientes);

// Obtener tareas de una materia (needs auth for entrega status)
router.get('/materia/:materiaId', authMiddleware, tareasController.getTareasPorMateria);

// Obtener tarea por ID
router.get('/:id', authMiddleware, tareasController.getTareaById);

// Obtener todas las tareas (filtrado por rol)
router.get('/', authMiddleware, tareasController.getTareas);

// Crear tarea (requiere autenticación)
router.post('/', authMiddleware, tareasController.crearTarea);

// Actualizar tarea
router.put('/:id', authMiddleware, tareasController.actualizarTarea);

// Eliminar tarea
router.delete('/:id', authMiddleware, tareasController.eliminarTarea);

// Entregar tarea
router.post('/:tareaId/entregar', authMiddleware, tareasController.entregarTarea);

// Calificar entrega
router.put('/:tareaId/calificar/:entregaId', authMiddleware, tareasController.calificarEntrega);

module.exports = router;
