const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Middleware: verificar que sea admin
function adminOnly(req, res, next) {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
  }
  next();
}

// Todas las rutas requieren auth + admin
router.use(authMiddleware, adminOnly);

// Stats
router.get('/stats', adminController.getStats);

// Usuarios CRUD
router.get('/usuarios', adminController.getUsuarios);
router.post('/usuarios', adminController.createUsuario);
router.put('/usuarios/:id', adminController.updateUsuario);
router.delete('/usuarios/:id', adminController.deleteUsuario);

// Materias CRUD
router.get('/materias', adminController.getMaterias);
router.post('/materias', adminController.createMateria);
router.put('/materias/:id', adminController.updateMateria);
router.delete('/materias/:id', adminController.deleteMateria);

// Inscripciones
router.get('/inscripciones', adminController.getInscripciones);
router.post('/inscripciones', adminController.createInscripcion);
router.delete('/inscripciones/:id', adminController.deleteInscripcion);

module.exports = router;
