const express = require('express');
const router = express.Router();
const leccionesController = require('../controllers/leccionesController');
const authMiddleware = require('../middleware/auth');

// Obtener lecciones de una materia
router.get('/materia/:materiaId', leccionesController.getLeccionesPorMateria);

// Obtener lección por ID
router.get('/:id', leccionesController.getLeccionById);

// Crear lección (requiere autenticación)
router.post('/', authMiddleware, leccionesController.crearLeccion);

// Actualizar lección
router.put('/:id', authMiddleware, leccionesController.actualizarLeccion);

// Eliminar lección
router.delete('/:id', authMiddleware, leccionesController.eliminarLeccion);

// Marcar como completada
router.post('/:id/completar', authMiddleware, leccionesController.completarLeccion);

module.exports = router;
