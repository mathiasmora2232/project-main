const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'educonnect_db'
    });

    console.log('🌱 Insertando datos iniciales...');

    // Usuarios por defecto (admin primero, luego profesores, luego estudiantes)
    const usuarios = [
      { nombre: 'Administrador', email: 'admin@educonnect.com', rol: 'admin' },
      { nombre: 'Juan Pérez', email: 'juan@ejemplo.com', rol: 'profesor' },
      { nombre: 'María García', email: 'maria@ejemplo.com', rol: 'profesor' },
      { nombre: 'Carlos López', email: 'carlos@ejemplo.com', rol: 'estudiante' },
      { nombre: 'Ana Martínez', email: 'ana@ejemplo.com', rol: 'estudiante' }
    ];

    // Check if data already exists
    const [existingUsers] = await conn.execute('SELECT COUNT(*) as count FROM usuarios');
    if (existingUsers[0].count > 0) {
      console.log('✅ Datos ya existen, omitiendo seed');
      await conn.end();
      return;
    }

    for (const user of usuarios) {
      const password = user.rol === 'admin' ? 'admin123' : 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      await conn.execute(
        'INSERT INTO usuarios (nombre_completo, email, password, rol) VALUES (?, ?, ?, ?)',
        [user.nombre, user.email, hashedPassword, user.rol]
      );
    }

    // Materias (profesor IDs are now 2 and 3 since admin is ID 1)
    const materias = [
      { nombre: 'Matemáticas Discretas', codigo: 'MAT-201', creditos: 4, semestre: 2, prof_idx: 0 },
      { nombre: 'Física I', codigo: 'FIS-101', creditos: 4, semestre: 1, prof_idx: 1 },
      { nombre: 'Programación', codigo: 'PRO-101', creditos: 4, semestre: 1, prof_idx: 0 },
      { nombre: 'Contabilidad General', codigo: 'CON-101', creditos: 3, semestre: 1, prof_idx: 1 },
      { nombre: 'Literatura Hispanoamericana', codigo: 'LIT-201', creditos: 3, semestre: 2, prof_idx: 0 }
    ];

    const profesorIds = [2, 3]; // IDs de profesores (admin es 1)
    for (const materia of materias) {
      await conn.execute(
        'INSERT INTO materias (nombre, codigo, descripcion, creditos, semestre, profesor_id, activa) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [
          materia.nombre,
          materia.codigo,
          `Curso completo de ${materia.nombre}`,
          materia.creditos,
          materia.semestre,
          profesorIds[materia.prof_idx]
        ]
      );
    }

    // Lecciones
    const materiaIds = [1, 2, 3, 4, 5];
    const leccionesTitulos = [
      'Introducción al tema',
      'Conceptos fundamentales',
      'Aplicaciones prácticas',
      'Casos de estudio',
      'Conclusiones y referencias'
    ];

    for (const materiaId of materiaIds) {
      for (let i = 0; i < 5; i++) {
        await conn.execute(
          'INSERT INTO lecciones (materia_id, titulo, contenido, numero_leccion, duracion_estimada, activa) VALUES (?, ?, ?, ?, 30, 1)',
          [
            materiaId,
            leccionesTitulos[i],
            `Contenido completo de la lección ${i + 1}. Este es el material educativo para esta lección.`,
            i + 1
          ]
        );
      }
    }

    // Tareas
    const tareasTitulos = [
      'Primera tarea práctica',
      'Investigación teórica',
      'Análisis de casos',
      'Proyecto final'
    ];

    for (const materiaId of materiaIds) {
      for (let i = 0; i < 4; i++) {
        const fechaEntrega = new Date();
        fechaEntrega.setDate(fechaEntrega.getDate() + (3 + i * 7));

        await conn.execute(
          'INSERT INTO tareas (materia_id, titulo, descripcion, fecha_entrega, puntos_totales, activa) VALUES (?, ?, ?, ?, 100, 1)',
          [
            materiaId,
            tareasTitulos[i],
            `Descripción detallada de la tarea ${i + 1}. Instrucciones y requisitos completos.`,
            fechaEntrega
          ]
        );
      }
    }

    // Recursos
    const recursos = [
      { titulo: 'Video explicativo', tipo: 'video', url: 'https://example.com/video.mp4' },
      { titulo: 'Apunte en PDF', tipo: 'documento', url: 'https://example.com/apunte.pdf' },
      { titulo: 'Enlace de referencia', tipo: 'enlace', url: 'https://example.com/referencia' }
    ];

    const leccionIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (const leccionId of leccionIds) {
      for (const recurso of recursos) {
        await conn.execute(
          'INSERT INTO recursos (leccion_id, titulo, tipo, url, activo) VALUES (?, ?, ?, ?, 1)',
          [leccionId, recurso.titulo, recurso.tipo, recurso.url]
        );
      }
    }

    // Inscripciones - inscribir ambos estudiantes en las 5 materias
    const estudianteIds = [4, 5]; // Carlos y Ana
    for (const estudianteId of estudianteIds) {
      for (const materiaId of materiaIds) {
        await conn.execute(
          'INSERT INTO inscripciones (usuario_id, materia_id, estado) VALUES (?, ?, ?)',
          [estudianteId, materiaId, 'activa']
        );
      }
    }

    console.log('✅ Datos iniciales insertados exitosamente');
    await conn.end();
  } catch (error) {
    console.error('❌ Error al insertar datos:', error);
    process.exit(1);
  }
}

seedDatabase();
