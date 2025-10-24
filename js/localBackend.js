// localBackend.js
// Pequeño "backend" en el navegador que guarda datos en localStorage
// Esto permite que el proyecto funcione sin ejecutar el servidor Python.

const LocalBackend = (function(){
  const USERS_KEY = 'we_users';
  const COURSES_KEY = 'we_courses';
  const TASKS_KEY = 'we_tasks';
  const UPLOADS_KEY = 'we_uploads';

  async function init(){
    // Cargar datos iniciales desde los JSON si no existen en localStorage
    if(!localStorage.getItem(USERS_KEY)){
      try{
        const res = await fetch('usuarios.json');
        if(res.ok){
          const users = await res.json();
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
        } else {
          localStorage.setItem(USERS_KEY, JSON.stringify([]));
        }
      }catch(e){
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
      }
    }
    if(!localStorage.getItem(COURSES_KEY)){
      try{
        const res = await fetch('cursos.json');
        if(res.ok){
          const data = await res.json();
          localStorage.setItem(COURSES_KEY, JSON.stringify(data));
        } else {
          localStorage.setItem(COURSES_KEY, JSON.stringify([]));
        }
      }catch(e){
        localStorage.setItem(COURSES_KEY, JSON.stringify([]));
      }
    }
    if(!localStorage.getItem(TASKS_KEY)){
      try{
        const res = await fetch('tareas.json');
        if(res.ok){
          const data = await res.json();
          // Asegurar arreglo; si viene con estructura distinta, iniciar vacío
          const safe = Array.isArray(data) ? data : [];
          localStorage.setItem(TASKS_KEY, JSON.stringify(safe));
        } else {
          localStorage.setItem(TASKS_KEY, JSON.stringify([]));
        }
      }catch(e){
        localStorage.setItem(TASKS_KEY, JSON.stringify([]));
      }
    }
    if(!localStorage.getItem(UPLOADS_KEY)){
      localStorage.setItem(UPLOADS_KEY, JSON.stringify([]));
    }
  }

  function _read(key){
    try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ return []; }
  }
  function _write(key, data){ localStorage.setItem(key, JSON.stringify(data)); }

  function _nextId(list){
    return list.reduce((m,i)=> Math.max(m, (i.id||i.id===0?i.id:0)), 0) + 1;
  }

  async function login(email, password){
    const users = _read(USERS_KEY);
    const user = users.find(u => (u.email||'').toLowerCase() === (email||'').toLowerCase());
    if(!user) return { success:false, message: 'Usuario no encontrado' };
    // En este modo client-side los passwords pueden estar en texto plano o cifrados (scrypt) en usuarios.json
    // Si está cifrado (prefijo scrypt:), aceptamos una clave de demo '123456' para desarrollo local.
    const isHashed = typeof user.password === 'string' && user.password.startsWith('scrypt:');
    if((!isHashed && user.password === password) || (isHashed && password === '123456')){
      return { success:true, id: user.id, rol: (user.rol||'').toLowerCase(), username: user.username, email: user.email };
    }
    return { success:false, message: 'Credenciales incorrectas' };
  }

  async function register({username, email, password, rol}){
    const users = _read(USERS_KEY);
    if(users.some(u => (u.email||'').toLowerCase() === (email||'').toLowerCase())) return { success:false, message:'Email ya registrado' };
    if(users.some(u => (u.username||'').toLowerCase() === (username||'').toLowerCase())) return { success:false, message:'Usuario ya existe' };
    const id = _nextId(users);
    const nu = { id, username, email, password, rol };
    users.push(nu);
    _write(USERS_KEY, users);
    return { success:true, id, username, email };
  }

  async function getCoursesForUser(user){
    const cursos = _read(COURSES_KEY);
    if(!user) return { success:true, courses: cursos };
    if((user.rol||'').toLowerCase() === 'profesor'){
      const my = cursos.filter(c => c.profesor_id === user.id);
      return { success:true, courses: my };
    }
    return { success:true, courses: cursos };
  }

  async function createCourse({ nombre, profesor_id, user }){
    const cursos = _read(COURSES_KEY);
    let pid = profesor_id;
    if(user && (user.rol||'').toLowerCase() === 'profesor') pid = user.id;
    if(!nombre || pid === undefined) return { success:false, message:'nombre y profesor_id requeridos' };
    const id = _nextId(cursos);
    const nuevo = { id, nombre, profesor_id: pid };
    cursos.push(nuevo);
    _write(COURSES_KEY, cursos);
    return { success:true, course: nuevo };
  }

  async function getTasks(course_id){
    const raw = _read(TASKS_KEY);
    const list = Array.isArray(raw) ? raw : [];
    const tasks = list.filter(t => t.course_id === course_id);
    return { success:true, tasks };
  }

  async function createTask({ course_id, title, description, due, assigned_by, fileUrl, user }){
    // If user is profesor, ensure they own the course
    const cursos = _read(COURSES_KEY);
    const curso = cursos.find(c => c.id === course_id);
    if(!curso) return { success:false, message:'Curso no encontrado' };
    if(user && (user.rol||'').toLowerCase() === 'profesor' && curso.profesor_id !== user.id) return { success:false, message:'No autorizado' };
    const tareas = _read(TASKS_KEY);
    const id = _nextId(tareas);
    const nuevo = { id, course_id, title, description, due, assigned_by: assigned_by || (user?user.id:null), file: fileUrl };
    tareas.push(nuevo);
    _write(TASKS_KEY, tareas);
    return { success:true, task: nuevo };
  }

  async function uploadFileClient(file){
    // Crear URL temporal (no persistente) y guardar referencia en localStorage
    const uploads = _read(UPLOADS_KEY);
    const id = _nextId(uploads);
    const url = URL.createObjectURL(file);
    const item = { id, name: file.name, url };
    uploads.push(item);
    _write(UPLOADS_KEY, uploads);
    return { success:true, url };
  }

  return {
    init,
    login,
    register,
    getCoursesForUser,
    createCourse,
    getTasks,
    createTask,
    uploadFileClient
  };
})();

// Inicializar automáticamente
document.addEventListener('DOMContentLoaded', () => {
  LocalBackend.init();
});
