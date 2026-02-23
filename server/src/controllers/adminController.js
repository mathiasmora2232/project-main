const { query } = require('../models/db');
const bcrypt = require('bcryptjs');

// Dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [usuarios] = await query('SELECT COUNT(*) as total FROM usuarios WHERE activo = 1');
    const [estudiantes] = await query("SELECT COUNT(*) as total FROM usuarios WHERE rol = 'estudiante' AND activo = 1");
    const [profesores] = await query("SELECT COUNT(*) as total FROM usuarios WHERE rol = 'profesor' AND activo = 1");
    const [materias] = await query('SELECT COUNT(*) as total FROM materias WHERE activa = 1');
    const [tareas] = await query('SELECT COUNT(*) as total FROM tareas WHERE activa = 1');
    const [lecciones] = await query('SELECT COUNT(*) as total FROM lecciones WHERE activa = 1');
    const [inscripciones] = await query("SELECT COUNT(*) as total FROM inscripciones WHERE estado = 'activa'");

    res.json({
      total_usuarios: usuarios.total,
      total_estudiantes: estudiantes.total,
      total_profesores: profesores.total,
      total_materias: materias.total,
      total_tareas: tareas.total,
      total_lecciones: lecciones.total,
      total_inscripciones: inscripciones.total
    });
  } catch (error) {
    console.error('Error al obtener stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// ==================== USUARIOS ====================

exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await query(
      'SELECT id, nombre_completo, email, rol, activo, created_at FROM usuarios ORDER BY id'
    );
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.createUsuario = async (req, res) => {
  try {
    const { nombre_completo, email, password, rol } = req.body;
    const existing = await query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
      'INSERT INTO usuarios (nombre_completo, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre_completo, email, hashedPassword, rol || 'estudiante']
    );
    res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_completo, email, rol, activo } = req.body;
    await query(
      'UPDATE usuarios SET nombre_completo = ?, email = ?, rol = ?, activo = ? WHERE id = ?',
      [nombre_completo, email, rol, activo !== undefined ? activo : 1, id]
    );
    res.json({ mensaje: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE usuarios SET activo = 0 WHERE id = ?', [id]);
    res.json({ mensaje: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// ==================== MATERIAS ====================

exports.getMaterias = async (req, res) => {
  try {
    const materias = await query(
      `SELECT m.*, u.nombre_completo as profesor_nombre,
              COUNT(DISTINCT i.id) as total_inscritos
       FROM materias m
       LEFT JOIN usuarios u ON m.profesor_id = u.id
       LEFT JOIN inscripciones i ON m.id = i.materia_id AND i.estado = 'activa'
       GROUP BY m.id
       ORDER BY m.id`
    );
    res.json(materias);
  } catch (error) {
    console.error('Error al obtener materias:', error);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
};

exports.createMateria = async (req, res) => {
  try {
    const { nombre, codigo, descripcion, creditos, semestre, profesor_id } = req.body;
    await query(
      'INSERT INTO materias (nombre, codigo, descripcion, creditos, semestre, profesor_id, activa) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [nombre, codigo, descripcion, creditos || 3, semestre || 1, profesor_id]
    );
    res.status(201).json({ mensaje: 'Materia creada exitosamente' });
  } catch (error) {
    console.error('Error al crear materia:', error);
    res.status(500).json({ error: 'Error al crear materia' });
  }
};

exports.updateMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, codigo, descripcion, creditos, semestre, profesor_id, activa } = req.body;
    await query(
      'UPDATE materias SET nombre = ?, codigo = ?, descripcion = ?, creditos = ?, semestre = ?, profesor_id = ?, activa = ? WHERE id = ?',
      [nombre, codigo, descripcion, creditos, semestre, profesor_id, activa !== undefined ? activa : 1, id]
    );
    res.json({ mensaje: 'Materia actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar materia:', error);
    res.status(500).json({ error: 'Error al actualizar materia' });
  }
};

exports.deleteMateria = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE materias SET activa = 0 WHERE id = ?', [id]);
    res.json({ mensaje: 'Materia desactivada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar materia:', error);
    res.status(500).json({ error: 'Error al eliminar materia' });
  }
};

// ==================== INSCRIPCIONES ====================

exports.getInscripciones = async (req, res) => {
  try {
    const inscripciones = await query(
      `SELECT i.*, u.nombre_completo as estudiante_nombre, u.email as estudiante_email,
              m.nombre as materia_nombre, m.codigo as materia_codigo
       FROM inscripciones i
       JOIN usuarios u ON i.usuario_id = u.id
       JOIN materias m ON i.materia_id = m.id
       ORDER BY i.fecha_inscripcion DESC`
    );
    res.json(inscripciones);
  } catch (error) {
    console.error('Error al obtener inscripciones:', error);
    res.status(500).json({ error: 'Error al obtener inscripciones' });
  }
};

exports.createInscripcion = async (req, res) => {
  try {
    const { usuario_id, materia_id } = req.body;
    const existing = await query(
      'SELECT id FROM inscripciones WHERE usuario_id = ? AND materia_id = ?',
      [usuario_id, materia_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El estudiante ya está inscrito en esta materia' });
    }
    await query(
      'INSERT INTO inscripciones (usuario_id, materia_id, estado) VALUES (?, ?, ?)',
      [usuario_id, materia_id, 'activa']
    );
    res.status(201).json({ mensaje: 'Inscripción creada exitosamente' });
  } catch (error) {
    console.error('Error al crear inscripción:', error);
    res.status(500).json({ error: 'Error al crear inscripción' });
  }
};

exports.deleteInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM inscripciones WHERE id = ?', [id]);
    res.json({ mensaje: 'Inscripción eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar inscripción:', error);
    res.status(500).json({ error: 'Error al eliminar inscripción' });
  }
};
