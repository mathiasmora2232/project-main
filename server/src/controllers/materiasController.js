const { query } = require('../models/db');

// Obtener materias impartidas por el profesor
exports.getMisMateria = async (req, res) => {
  try {
    const usuario = req.user;

    if (usuario.rol !== 'profesor' && usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    let materias;

    if (usuario.rol === 'profesor') {
      materias = await query(
        `SELECT m.*,
                u.nombre_completo as nombre_profesor,
                COUNT(DISTINCT l.id) as total_lecciones,
                COUNT(DISTINCT t.id) as total_tareas,
                (SELECT COUNT(*) FROM inscripciones 
                 WHERE materia_id = m.id AND estado = 'activa') as total_inscritos,
                (SELECT AVG(calificacion) FROM calificaciones 
                 WHERE materia_id = m.id) as promedio_calificaciones
         FROM materias m
         LEFT JOIN usuarios u ON m.profesor_id = u.id
         LEFT JOIN lecciones l ON m.id = l.materia_id
         LEFT JOIN tareas t ON m.id = t.materia_id
         WHERE m.profesor_id = ? AND m.activa = 1
         GROUP BY m.id
         ORDER BY m.nombre ASC`,
        [usuario.id]
      );
    } else {
      // Admin ve todas
      materias = await query(
        `SELECT m.*,
                u.nombre_completo as nombre_profesor,
                COUNT(DISTINCT l.id) as total_lecciones,
                COUNT(DISTINCT t.id) as total_tareas,
                (SELECT COUNT(*) FROM inscripciones 
                 WHERE materia_id = m.id AND estado = 'activa') as total_inscritos,
                (SELECT AVG(calificacion) FROM calificaciones 
                 WHERE materia_id = m.id) as promedio_calificaciones
         FROM materias m
         LEFT JOIN usuarios u ON m.profesor_id = u.id
         LEFT JOIN lecciones l ON m.id = l.materia_id
         LEFT JOIN tareas t ON m.id = t.materia_id
         WHERE m.activa = 1
         GROUP BY m.id
         ORDER BY m.nombre ASC`
      );
    }

    res.json(materias);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
};

// Obtener materias del usuario (filtrado por rol)
exports.getMaterias = async (req, res) => {
  try {
    const usuario = req.user;
    let materias;

    if (usuario.rol === 'estudiante') {
      // Solo materias inscritas
      materias = await query(
        `SELECT m.*,
                u.nombre_completo as profesor_nombre,
                COUNT(DISTINCT l.id) as total_lecciones,
                COUNT(DISTINCT t.id) as total_tareas,
                (SELECT COUNT(*) FROM progreso_lecciones pl
                 JOIN lecciones le ON pl.leccion_id = le.id
                 WHERE le.materia_id = m.id AND pl.usuario_id = ? AND pl.completada = 1) as lecciones_completadas
         FROM materias m
         JOIN inscripciones i ON m.id = i.materia_id AND i.usuario_id = ? AND i.estado = 'activa'
         LEFT JOIN usuarios u ON m.profesor_id = u.id
         LEFT JOIN lecciones l ON m.id = l.materia_id AND l.activa = 1
         LEFT JOIN tareas t ON m.id = t.materia_id AND t.activa = 1
         WHERE m.activa = 1
         GROUP BY m.id
         ORDER BY m.nombre`,
        [usuario.id, usuario.id]
      );
    } else if (usuario.rol === 'profesor') {
      // Materias donde es profesor
      materias = await query(
        `SELECT m.*,
                u.nombre_completo as profesor_nombre,
                COUNT(DISTINCT l.id) as total_lecciones,
                COUNT(DISTINCT t.id) as total_tareas,
                COUNT(DISTINCT i.id) as total_inscritos
         FROM materias m
         LEFT JOIN usuarios u ON m.profesor_id = u.id
         LEFT JOIN lecciones l ON m.id = l.materia_id AND l.activa = 1
         LEFT JOIN tareas t ON m.id = t.materia_id AND t.activa = 1
         LEFT JOIN inscripciones i ON m.id = i.materia_id AND i.estado = 'activa'
         WHERE m.activa = 1 AND m.profesor_id = ?
         GROUP BY m.id
         ORDER BY m.nombre`,
        [usuario.id]
      );
    } else {
      // Admin: todas
      materias = await query(
        `SELECT m.*,
                u.nombre_completo as profesor_nombre,
                COUNT(DISTINCT l.id) as total_lecciones,
                COUNT(DISTINCT t.id) as total_tareas,
                COUNT(DISTINCT i.id) as total_inscritos
         FROM materias m
         LEFT JOIN usuarios u ON m.profesor_id = u.id
         LEFT JOIN lecciones l ON m.id = l.materia_id AND l.activa = 1
         LEFT JOIN tareas t ON m.id = t.materia_id AND t.activa = 1
         LEFT JOIN inscripciones i ON m.id = i.materia_id AND i.estado = 'activa'
         WHERE m.activa = 1
         GROUP BY m.id
         ORDER BY m.nombre`
      );
    }

    res.json(materias);
  } catch (error) {
    console.error('Error al obtener materias:', error);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
};

// Obtener TODAS las materias (público, para Malla)
exports.getTodasMaterias = async (req, res) => {
  try {
    const materias = await query(
      `SELECT m.*, u.nombre_completo as profesor_nombre
       FROM materias m
       LEFT JOIN usuarios u ON m.profesor_id = u.id
       WHERE m.activa = 1
       ORDER BY m.semestre, m.nombre`
    );
    res.json(materias);
  } catch (error) {
    console.error('Error al obtener todas las materias:', error);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
};

// Obtener una materia específica
exports.getMateriaById = async (req, res) => {
  try {
    const { id } = req.params;

    const materias = await query(
      `SELECT m.*,
              COUNT(DISTINCT l.id) as total_lecciones,
              COUNT(DISTINCT t.id) as total_tareas,
              u.nombre_completo as profesor_nombre
       FROM materias m
       LEFT JOIN lecciones l ON m.id = l.materia_id AND l.activa = 1
       LEFT JOIN tareas t ON m.id = t.materia_id AND t.activa = 1
       LEFT JOIN usuarios u ON m.profesor_id = u.id
       WHERE m.id = ? AND m.activa = 1
       GROUP BY m.id`,
      [id]
    );

    if (materias.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    res.json(materias[0]);
  } catch (error) {
    console.error('Error al obtener materia:', error);
    res.status(500).json({ error: 'Error al obtener materia' });
  }
};

// Crear materia (solo profesores/admin)
exports.crearMateria = async (req, res) => {
  try {
    if (req.user?.rol !== 'profesor' && req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para crear materias' });
    }

    const { nombre, codigo, descripcion, creditos, semestre, profesor_id } = req.body;

    await query(
      `INSERT INTO materias (nombre, codigo, descripcion, creditos, semestre, profesor_id, activa)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nombre, codigo, descripcion, creditos, semestre, profesor_id || req.user.id]
    );

    res.status(201).json({ mensaje: 'Materia creada exitosamente' });
  } catch (error) {
    console.error('Error al crear materia:', error);
    res.status(500).json({ error: 'Error al crear materia' });
  }
};

// Inscribir estudiante en materia
exports.inscribirEstudiante = async (req, res) => {
  try {
    const { materia_id } = req.body;
    const usuario_id = req.user.id;

    const existing = await query(
      'SELECT id FROM inscripciones WHERE usuario_id = ? AND materia_id = ?',
      [usuario_id, materia_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya estás inscrito en esta materia' });
    }

    await query(
      'INSERT INTO inscripciones (usuario_id, materia_id, estado) VALUES (?, ?, ?)',
      [usuario_id, materia_id, 'activa']
    );
    res.status(201).json({ mensaje: 'Inscripción exitosa' });
  } catch (error) {
    console.error('Error al inscribir:', error);
    res.status(500).json({ error: 'Error al inscribirse' });
  }
};

// Desinscribir estudiante
exports.desinscribirEstudiante = async (req, res) => {
  try {
    const { materia_id } = req.params;
    const usuario_id = req.user.id;

    await query(
      'DELETE FROM inscripciones WHERE usuario_id = ? AND materia_id = ?',
      [usuario_id, materia_id]
    );
    res.json({ mensaje: 'Desinscripción exitosa' });
  } catch (error) {
    console.error('Error al desinscribir:', error);
    res.status(500).json({ error: 'Error al desinscribirse' });
  }
};

// Materias disponibles (no inscritas)
exports.getMateriasDisponibles = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const materias = await query(
      `SELECT m.*, u.nombre_completo as profesor_nombre
       FROM materias m
       LEFT JOIN usuarios u ON m.profesor_id = u.id
       WHERE m.activa = 1 AND m.id NOT IN (
         SELECT materia_id FROM inscripciones WHERE usuario_id = ? AND estado = 'activa'
       )
       ORDER BY m.semestre, m.nombre`,
      [usuario_id]
    );
    res.json(materias);
  } catch (error) {
    console.error('Error al obtener materias disponibles:', error);
    res.status(500).json({ error: 'Error al obtener materias disponibles' });
  }
};
