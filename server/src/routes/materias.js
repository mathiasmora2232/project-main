const express = require('express');
const router = express.Router();
const materiasController = require('../controllers/materiasController');
const authMiddleware = require('../middleware/auth');

// Obtener TODAS las materias (público, para Malla)
router.get('/todas', materiasController.getTodasMaterias);

// Obtener materias del usuario (filtrado por rol)
router.get('/', authMiddleware, materiasController.getMaterias);

// Obtener materias impartidas por el profesor
router.get('/mismateria', authMiddleware, materiasController.getMisMateria);

// Materias disponibles para inscripción
router.get('/disponibles', authMiddleware, materiasController.getMateriasDisponibles);

// Obtener materia por ID
router.get('/:id', authMiddleware, materiasController.getMateriaById);

// Crear materia (requiere autenticación)
router.post('/', authMiddleware, materiasController.crearMateria);

// Inscribirse en materia
router.post('/inscribir', authMiddleware, materiasController.inscribirEstudiante);

// Desinscribirse de materia
router.delete('/desinscribir/:materia_id', authMiddleware, materiasController.desinscribirEstudiante);

module.exports = router;
