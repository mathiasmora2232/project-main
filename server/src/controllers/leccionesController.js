const { query } = require('../models/db');

// Obtener lecciones de una materia
exports.getLeccionesPorMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;

    const lecciones = await query(
      `SELECT l.*, 
              m.nombre as materia_nombre,
              COUNT(DISTINCT r.id) as total_recursos
       FROM lecciones l
       LEFT JOIN materias m ON l.materia_id = m.id
       LEFT JOIN recursos r ON l.id = r.leccion_id
       WHERE l.materia_id = ? AND l.activa = 1
       GROUP BY l.id
       ORDER BY l.numero_leccion ASC`,
      [materiaId]
    );

    res.json(lecciones);
  } catch (error) {
    console.error('Error al obtener lecciones:', error);
    res.status(500).json({ error: 'Error al obtener lecciones' });
  }
};

// Obtener una lección específica
exports.getLeccionById = async (req, res) => {
  try {
    const { id } = req.params;

    const lecciones = await query(
      `SELECT l.*, m.nombre as materia_nombre
       FROM lecciones l
       LEFT JOIN materias m ON l.materia_id = m.id
       WHERE l.id = ? AND l.activa = 1`,
      [id]
    );

    if (lecciones.length === 0) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    const leccion = lecciones[0];

    // Obtener recursos de la lección
    const recursos = await query(
      'SELECT * FROM recursos WHERE leccion_id = ? AND activo = 1 ORDER BY tipo',
      [id]
    );

    leccion.recursos = recursos;

    res.json(leccion);
  } catch (error) {
    console.error('Error al obtener lección:', error);
    res.status(500).json({ error: 'Error al obtener lección' });
  }
};

// Crear lección (solo profesores)
exports.crearLeccion = async (req, res) => {
  try {
    if (req.user?.rol !== 'profesor' && req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para crear lecciones' });
    }

    const { materia_id, titulo, contenido, numero_leccion, duracion_estimada } = req.body;

    await query(
      `INSERT INTO lecciones (materia_id, titulo, contenido, numero_leccion, duracion_estimada, activa, creada_en)
       VALUES (?, ?, ?, ?, ?, 1, NOW())`,
      [materia_id, titulo, contenido, numero_leccion, duracion_estimada || 30]
    );

    res.status(201).json({ mensaje: 'Lección creada exitosamente' });
  } catch (error) {
    console.error('Error al crear lección:', error);
    res.status(500).json({ error: 'Error al crear lección' });
  }
};

// Marcar lección como completada
exports.completarLeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user?.id;

    await query(
      `INSERT INTO progreso_lecciones (usuario_id, leccion_id, completada, completada_en)
       VALUES (?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE completada = 1, completada_en = NOW()`,
      [usuarioId, id]
    );

    res.json({ mensaje: 'Lección marcada como completada' });
  } catch (error) {
    console.error('Error al completar lección:', error);
    res.status(500).json({ error: 'Error al completar lección' });
  }
};

// Actualizar lección
exports.actualizarLeccion = async (req, res) => {
  try {
    if (req.user?.rol !== 'profesor' && req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para actualizar lecciones' });
    }

    const { id } = req.params;
    const { titulo, contenido, numero_leccion, duracion_estimada } = req.body;

    await query(
      `UPDATE lecciones 
       SET titulo = ?, contenido = ?, numero_leccion = ?, duracion_estimada = ?
       WHERE id = ?`,
      [titulo, contenido, numero_leccion, duracion_estimada || 30, id]
    );

    res.json({ mensaje: 'Lección actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar lección:', error);
    res.status(500).json({ error: 'Error al actualizar lección' });
  }
};

// Eliminar lección (soft delete)
exports.eliminarLeccion = async (req, res) => {
  try {
    if (req.user?.rol !== 'profesor' && req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar lecciones' });
    }

    const { id } = req.params;

    await query(
      `UPDATE lecciones SET activa = 0 WHERE id = ?`,
      [id]
    );

    res.json({ mensaje: 'Lección eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar lección:', error);
    res.status(500).json({ error: 'Error al eliminar lección' });
  }
};
