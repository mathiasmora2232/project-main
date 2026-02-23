const { query } = require('../models/db');

// Obtener tareas de una materia
exports.getTareasPorMateria = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const usuarioId = req.user?.id;

    const tareas = await query(
      `SELECT t.*,
              m.nombre as materia_nombre,
              e.id as entrega_id,
              e.estado as entrega_estado,
              e.calificacion as entrega_calificacion,
              e.entregada_en
       FROM tareas t
       LEFT JOIN materias m ON t.materia_id = m.id
       LEFT JOIN entregas e ON t.id = e.tarea_id AND e.usuario_id = ?
       WHERE t.materia_id = ? AND t.activa = 1
       ORDER BY t.fecha_entrega ASC`,
      [usuarioId, materiaId]
    );

    res.json(tareas);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

// Obtener tareas pendientes (filtradas por materias inscritas del usuario)
exports.getTareasPendientes = async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    const userRol = req.user?.rol;

    let tareas;
    if (userRol === 'estudiante') {
      tareas = await query(
        `SELECT t.*, m.nombre as materia_nombre
         FROM tareas t
         JOIN materias m ON t.materia_id = m.id
         JOIN inscripciones i ON m.id = i.materia_id AND i.usuario_id = ? AND i.estado = 'activa'
         LEFT JOIN entregas e ON t.id = e.tarea_id AND e.usuario_id = ?
         WHERE t.fecha_entrega > NOW() AND t.activa = 1 AND e.id IS NULL
         ORDER BY t.fecha_entrega ASC
         LIMIT 10`,
        [usuarioId, usuarioId]
      );
    } else if (userRol === 'profesor') {
      tareas = await query(
        `SELECT t.*, m.nombre as materia_nombre
         FROM tareas t
         JOIN materias m ON t.materia_id = m.id
         WHERE m.profesor_id = ? AND t.fecha_entrega > NOW() AND t.activa = 1
         ORDER BY t.fecha_entrega ASC
         LIMIT 10`,
        [usuarioId]
      );
    } else {
      tareas = await query(
        `SELECT t.*, m.nombre as materia_nombre
         FROM tareas t
         JOIN materias m ON t.materia_id = m.id
         WHERE t.fecha_entrega > NOW() AND t.activa = 1
         ORDER BY t.fecha_entrega ASC
         LIMIT 10`
      );
    }

    res.json(tareas);
  } catch (error) {
    console.error('Error al obtener tareas pendientes:', error);
    res.status(500).json({ error: 'Error al obtener tareas pendientes' });
  }
};

// Crear tarea (solo profesores)
exports.crearTarea = async (req, res) => {
  try {
    if (req.user?.rol !== 'profesor' && req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para crear tareas' });
    }

    const { materia_id, titulo, descripcion, fecha_entrega, puntos_totales } = req.body;

    await query(
      `INSERT INTO tareas (materia_id, titulo, descripcion, fecha_entrega, puntos_totales, activa, creada_en)
       VALUES (?, ?, ?, ?, ?, 1, NOW())`,
      [materia_id, titulo, descripcion, fecha_entrega, puntos_totales || 100]
    );

    res.status(201).json({ mensaje: 'Tarea creada exitosamente' });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
};

// Entregar tarea
exports.entregarTarea = async (req, res) => {
  try {
    const { tareaId } = req.params;
    const { archivo_url, comentarios } = req.body;
    const usuarioId = req.user?.id;

    const entregaExistente = await query(
      'SELECT * FROM entregas WHERE tarea_id = ? AND usuario_id = ?',
      [tareaId, usuarioId]
    );

    if (entregaExistente.length > 0) {
      await query(
        'UPDATE entregas SET archivo_url = ?, comentarios = ?, actualizada_en = NOW() WHERE id = ?',
        [archivo_url, comentarios, entregaExistente[0].id]
      );
    } else {
      await query(
        `INSERT INTO entregas (tarea_id, usuario_id, archivo_url, comentarios, estado, entregada_en)
         VALUES (?, ?, ?, ?, 'entregada', NOW())`,
        [tareaId, usuarioId, archivo_url, comentarios]
      );
    }

    res.json({ mensaje: 'Tarea entregada exitosamente' });
  } catch (error) {
    console.error('Error al entregar tarea:', error);
    res.status(500).json({ error: 'Error al entregar tarea' });
  }
};

// Obtener todas las tareas (filtrado por rol)
exports.getTareas = async (req, res) => {
  try {
    const usuario = req.user;
    let tareas;

    if (usuario.rol === 'estudiante') {
      tareas = await query(
        `SELECT t.*, m.nombre as materia_nombre, m.profesor_id,
                e.id as entrega_id, e.estado as entrega_estado
         FROM tareas t
         JOIN materias m ON t.materia_id = m.id
         JOIN inscripciones i ON m.id = i.materia_id AND i.usuario_id = ? AND i.estado = 'activa'
         LEFT JOIN entregas e ON t.id = e.tarea_id AND e.usuario_id = ?
         WHERE t.activa = 1
         ORDER BY t.fecha_entrega ASC`,
        [usuario.id, usuario.id]
      );
    } else if (usuario.rol === 'profesor') {
      tareas = await query(
        `SELECT t.*, m.nombre as materia_nombre, m.profesor_id
         FROM tareas t
         JOIN materias m ON t.materia_id = m.id
         WHERE m.profesor_id = ? AND t.activa = 1
         ORDER BY t.fecha_entrega ASC`,
        [usuario.id]
      );
    } else {
      tareas = await query(
        'SELECT * FROM tareas WHERE activa = 1 ORDER BY fecha_entrega ASC'
      );
    }

    res.json(tareas);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

// Obtener tarea por ID
exports.getTareaById = async (req, res) => {
  try {
    const { id } = req.params;

    const tareas = await query(
      `SELECT t.*, m.nombre as materia_nombre, m.profesor_id
       FROM tareas t
       LEFT JOIN materias m ON t.materia_id = m.id
       WHERE t.id = ? AND t.activa = 1`,
      [id]
    );

    if (tareas.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json(tareas[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener tarea' });
  }
};

// Actualizar tarea
exports.actualizarTarea = async (req, res) => {
  try {
    if (req.user?.rol !== 'profesor' && req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    const { id } = req.params;
    const { titulo, descripcion, fecha_entrega, puntos_totales } = req.body;

    await query(
      `UPDATE tareas SET titulo = ?, descripcion = ?, fecha_entrega = ?, puntos_totales = ?
       WHERE id = ?`,
      [titulo, descripcion, fecha_entrega, puntos_totales, id]
    );

    res.json({ mensaje: 'Tarea actualizada' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
};

// Eliminar tarea (soft delete)
exports.eliminarTarea = async (req, res) => {
  try {
    if (req.user?.rol !== 'profesor' && req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    const { id } = req.params;

    await query(
      'UPDATE tareas SET activa = 0 WHERE id = ?',
      [id]
    );

    res.json({ mensaje: 'Tarea eliminada' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
};

// Calificar entrega
exports.calificarEntrega = async (req, res) => {
  try {
    if (req.user?.rol !== 'profesor' && req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    const { tareaId, entregaId } = req.params;
    const { calificacion, comentarios } = req.body;

    await query(
      `UPDATE entregas SET calificacion = ?, comentarios_profesor = ?, estado = 'calificada'
       WHERE id = ? AND tarea_id = ?`,
      [calificacion, comentarios, entregaId, tareaId]
    );

    res.json({ mensaje: 'Entrega calificada' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al calificar' });
  }
};
