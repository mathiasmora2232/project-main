const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const authMiddleware = require('../middleware/auth');

// Obtener perfil (requiere autenticación)
router.get('/perfil', authMiddleware, usuariosController.getPerfil);

// Actualizar perfil
router.put('/perfil', authMiddleware, usuariosController.actualizarPerfil);

// Obtener estadísticas
router.get('/estadisticas', authMiddleware, usuariosController.getEstadisticas);

// Obtener progreso de todas las materias
router.get('/progreso', authMiddleware, usuariosController.getProgresoMaterias);

// Obtener progreso de una materia específica
router.get('/progreso/:materiaId', authMiddleware, usuariosController.getProgresoMateria);

module.exports = router;
