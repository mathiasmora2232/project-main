const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
});

async function initDatabase() {
  let conn;
  try {
    conn = await connection;

    console.log('📊 Creando base de datos...');
    await conn.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'educonnect_db'}`);

    await conn.execute(`USE ${process.env.DB_NAME || 'educonnect_db'}`);

    // Tabla de usuarios
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('estudiante', 'profesor', 'admin') DEFAULT 'estudiante',
        activo BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Tabla de materias
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS materias (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(255) NOT NULL,
        codigo VARCHAR(50) UNIQUE,
        descripcion TEXT,
        creditos INT DEFAULT 3,
        semestre INT,
        profesor_id INT,
        activa BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profesor_id) REFERENCES usuarios(id)
      )
    `);

    // Tabla de lecciones
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS lecciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        materia_id INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        contenido LONGTEXT,
        numero_leccion INT,
        duracion_estimada INT DEFAULT 30,
        activa BOOLEAN DEFAULT 1,
        creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (materia_id) REFERENCES materias(id)
      )
    `);

    // Tabla de recursos
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS recursos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        leccion_id INT NOT NULL,
        titulo VARCHAR(255),
        tipo ENUM('video', 'documento', 'enlace', 'imagen') DEFAULT 'documento',
        url VARCHAR(500),
        activo BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (leccion_id) REFERENCES lecciones(id)
      )
    `);

    // Tabla de tareas
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS tareas (
        id INT PRIMARY KEY AUTO_INCREMENT,
        materia_id INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        fecha_entrega DATETIME,
        puntos_totales INT DEFAULT 100,
        activa BOOLEAN DEFAULT 1,
        creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (materia_id) REFERENCES materias(id)
      )
    `);

    // Tabla de entregas
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS entregas (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tarea_id INT NOT NULL,
        usuario_id INT NOT NULL,
        archivo_url VARCHAR(500),
        comentarios TEXT,
        estado ENUM('entregada', 'evaluada', 'tardía') DEFAULT 'entregada',
        calificacion INT,
        comentario_profesor TEXT,
        entregada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tarea_id) REFERENCES tareas(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        UNIQUE KEY unique_entrega (tarea_id, usuario_id)
      )
    `);

    // Tabla de progreso de lecciones
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS progreso_lecciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        leccion_id INT NOT NULL,
        completada BOOLEAN DEFAULT 0,
        completada_en TIMESTAMP,
        visto_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (leccion_id) REFERENCES lecciones(id),
        UNIQUE KEY unique_progreso (usuario_id, leccion_id)
      )
    `);

    // Tabla de calificaciones
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS calificaciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        materia_id INT,
        tarea_id INT,
        calificacion DECIMAL(5, 2),
        comentario TEXT,
        creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (materia_id) REFERENCES materias(id),
        FOREIGN KEY (tarea_id) REFERENCES tareas(id)
      )
    `);

    // Tabla de inscripciones
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS inscripciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        materia_id INT NOT NULL,
        estado ENUM('activa', 'completada', 'retirada') DEFAULT 'activa',
        fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (materia_id) REFERENCES materias(id),
        UNIQUE KEY unique_inscripcion (usuario_id, materia_id)
      )
    `);

    console.log('✅ Base de datos creada exitosamente');
    await conn.end();
  } catch (error) {
    console.error('❌ Error al crear base de datos:', error);
    process.exit(1);
  }
}

initDatabase();
