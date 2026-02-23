const { query } = require('../models/db');

// Obtener perfil del usuario
exports.getPerfil = async (req, res) => {
  try {
    const usuarioId = req.user?.id;

    const usuarios = await query(
      'SELECT id, nombre_completo, email, rol, created_at FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// Actualizar perfil
exports.actualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    const { nombre_completo } = req.body;

    await query(
      'UPDATE usuarios SET nombre_completo = ? WHERE id = ?',
      [nombre_completo, usuarioId]
    );

    res.json({ mensaje: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

// Obtener estadísticas del usuario (filtrado por inscripciones)
exports.getEstadisticas = async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    const userRol = req.user?.rol;

    let materiasCount, tareasCount;

    if (userRol === 'estudiante') {
      // Solo materias inscritas
      const materias = await query(
        "SELECT COUNT(*) as total FROM inscripciones WHERE usuario_id = ? AND estado = 'activa'",
        [usuarioId]
      );
      materiasCount = materias[0]?.total || 0;

      // Tareas pendientes solo de materias inscritas
      const tareasPendientes = await query(
        `SELECT COUNT(*) as total FROM tareas t
         JOIN inscripciones i ON t.materia_id = i.materia_id AND i.usuario_id = ? AND i.estado = 'activa'
         LEFT JOIN entregas e ON t.id = e.tarea_id AND e.usuario_id = ?
         WHERE t.fecha_entrega > NOW() AND t.activa = 1 AND e.id IS NULL`,
        [usuarioId, usuarioId]
      );
      tareasCount = tareasPendientes[0]?.total || 0;
    } else {
      const materias = await query('SELECT COUNT(*) as total FROM materias WHERE activa = 1');
      materiasCount = materias[0]?.total || 0;

      const tareasPendientes = await query(
        'SELECT COUNT(*) as total FROM tareas WHERE fecha_entrega > NOW() AND activa = 1'
      );
      tareasCount = tareasPendientes[0]?.total || 0;
    }

    // Lecciones completadas
    const leccionesCompletadas = await query(
      'SELECT COUNT(*) as total FROM progreso_lecciones WHERE usuario_id = ? AND completada = 1',
      [usuarioId]
    );

    // Promedio general
    const promedio = await query(
      'SELECT AVG(calificacion) as promedio FROM calificaciones WHERE usuario_id = ? AND calificacion IS NOT NULL',
      [usuarioId]
    );

    res.json({
      materias_inscritas: materiasCount,
      tareas_pendientes: tareasCount,
      lecciones_completadas: leccionesCompletadas[0]?.total || 0,
      promedio_general: promedio[0]?.promedio || 0
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// Obtener progreso de todas las materias
exports.getProgresoMaterias = async (req, res) => {
  try {
    const usuarioId = req.user?.id;

    const progreso = await query(
      `SELECT m.id, m.nombre, m.codigo,
              COUNT(DISTINCT l.id) as total_lecciones,
              COUNT(DISTINCT CASE WHEN pl.completada = 1 THEN pl.id END) as lecciones_completadas,
              COUNT(DISTINCT t.id) as total_tareas,
              COUNT(DISTINCT e.id) as tareas_entregadas
       FROM materias m
       JOIN inscripciones i ON m.id = i.materia_id AND i.usuario_id = ? AND i.estado = 'activa'
       LEFT JOIN lecciones l ON m.id = l.materia_id AND l.activa = 1
       LEFT JOIN progreso_lecciones pl ON l.id = pl.leccion_id AND pl.usuario_id = ?
       LEFT JOIN tareas t ON m.id = t.materia_id AND t.activa = 1
       LEFT JOIN entregas e ON t.id = e.tarea_id AND e.usuario_id = ?
       WHERE m.activa = 1
       GROUP BY m.id`,
      [usuarioId, usuarioId, usuarioId]
    );

    res.json(progreso);
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({ error: 'Error al obtener progreso' });
  }
};

// Obtener progreso de una materia específica
exports.getProgresoMateria = async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    const { materiaId } = req.params;

    const [materia] = await query(
      `SELECT m.id, m.nombre, m.codigo,
              COUNT(DISTINCT l.id) as total_lecciones,
              COUNT(DISTINCT CASE WHEN pl.completada = 1 THEN pl.id END) as lecciones_completadas,
              COUNT(DISTINCT t.id) as total_tareas,
              COUNT(DISTINCT e.id) as tareas_entregadas
       FROM materias m
       LEFT JOIN lecciones l ON m.id = l.materia_id AND l.activa = 1
       LEFT JOIN progreso_lecciones pl ON l.id = pl.leccion_id AND pl.usuario_id = ?
       LEFT JOIN tareas t ON m.id = t.materia_id AND t.activa = 1
       LEFT JOIN entregas e ON t.id = e.tarea_id AND e.usuario_id = ?
       WHERE m.id = ? AND m.activa = 1
       GROUP BY m.id`,
      [usuarioId, usuarioId, materiaId]
    );

    if (!materia) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    // Calificaciones de la materia
    const calificaciones = await query(
      `SELECT c.*, t.titulo as tarea_titulo
       FROM calificaciones c
       LEFT JOIN tareas t ON c.tarea_id = t.id
       WHERE c.usuario_id = ? AND c.materia_id = ?`,
      [usuarioId, materiaId]
    );

    res.json({ ...materia, calificaciones });
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({ error: 'Error al obtener progreso de materia' });
  }
};
