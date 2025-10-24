document.addEventListener('DOMContentLoaded', () => {
  // Guard de sesión: solo profesores con sesión
  const rol = localStorage.getItem('rol');
  const uid = localStorage.getItem('user_id');
  if (!uid || rol !== 'profesor') {
    // Redirige a login si no hay sesión válida
    const target = location.pathname.includes('/profesor/') ? '../Login.html' : 'Login.html';
    window.location.href = target;
    return;
  }

  const loadBtn = document.getElementById('loadBtn');
  const coursesDiv = document.getElementById('courses');
  const createForm = document.getElementById('createCourseForm');

  function renderCourses(courses, uid){
    if (!coursesDiv) return;
    coursesDiv.innerHTML = '';
    const list = (Array.isArray(courses) ? courses : []).filter(c => typeof c.profesor_id === 'number' ? c.profesor_id === uid : true);
    if (!list.length) {
      coursesDiv.innerHTML = '<p>No se encontraron cursos para este profesor.</p>';
      return;
    }
    list.forEach(c => {
      const el = document.createElement('div');
      el.className = 'course';
      const name = c.nombre || c.name || `Curso #${c.id}`;
      el.innerHTML = `<strong>${name}</strong><div class="actions"><a href="course-profesor.html?course_id=${c.id}">Administrar</a></div>`;
      coursesDiv.appendChild(el);
    });
  }

  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      const uid = parseInt(localStorage.getItem('user_id') || '0', 10);
      const token = localStorage.getItem('token');
      // Intentar servidor
      fetch(`/courses`, { headers: token ? { 'Authorization': 'Bearer ' + token } : {} })
        .then(r => {
          if (!r.ok) throw new Error('server');
          return r.json();
        })
        .then(data => renderCourses(data.courses || [], uid))
        .catch(async () => {
          // Fallback local
          const user = { id: uid, rol: localStorage.getItem('rol') };
          const data = await LocalBackend.getCoursesForUser(user);
          renderCourses(data.courses || [], uid);
        });
    });
    // Carga inicial automática
    setTimeout(() => loadBtn.click(), 0);
  }

  if (createForm) {
    createForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('courseName').value.trim();
      const uid = parseInt(localStorage.getItem('user_id') || '0', 10);
      if (!nombre || !uid) return alert('Debes iniciar sesión como profesor');
      const token = localStorage.getItem('token');
      fetch('/courses', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'Authorization': 'Bearer ' + token } : {}),
        body: JSON.stringify({ nombre, profesor_id: uid })
      }).then(r => {
        if (!r.ok) throw new Error('server');
        return r.json();
      }).then(resp => {
        if (resp.success) {
          alert('Curso creado');
          document.getElementById('courseName').value = '';
          loadBtn.click();
        } else {
          alert('Error: ' + (resp.message || ''));
        }
      }).catch(async () => {
        // Fallback local
        const user = { id: uid, rol: localStorage.getItem('rol') };
        const resp = await LocalBackend.createCourse({ nombre, profesor_id: uid, user });
        if (resp.success) {
          alert('Curso creado');
          document.getElementById('courseName').value = '';
          loadBtn.click();
        } else {
          alert('Error: ' + (resp.message || ''));
        }
      });
    });
  }

  // Course page logic (course-profesor.html)
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('course_id');
  if (courseId && window.location.pathname.endsWith('course-profesor.html')) {
    const tasksDiv = document.getElementById('tasks');
    const courseTitle = document.getElementById('courseTitle');
  const token = localStorage.getItem('token');
  fetch('/courses', { headers: token ? { 'Authorization': 'Bearer ' + token } : {} })
    .then(r=> { if(!r.ok) throw new Error('server'); return r.json(); })
    .then(data => {
      const c = (data.courses || []).find(x => x.id === parseInt(courseId,10));
      if (c) courseTitle.textContent = c.nombre;
    })
    .catch(async () => {
      const uid = parseInt(localStorage.getItem('user_id') || '0', 10);
      const user = { id: uid, rol: localStorage.getItem('rol') };
      const data = await LocalBackend.getCoursesForUser(user);
      const c = (data.courses || []).find(x => x.id === parseInt(courseId,10));
      if (c) courseTitle.textContent = c.nombre;
    });

    function loadTasks() {
  fetch(`/courses/${courseId}/tasks`, { headers: token ? { 'Authorization': 'Bearer ' + token } : {} })
    .then(r=> { if(!r.ok) throw new Error('server'); return r.json(); })
    .then(data => {
        tasksDiv.innerHTML = '';
        (data.tasks || []).forEach(t => {
          const el = document.createElement('div');
          el.className = 'task';
          el.innerHTML = `<strong>${t.title}</strong><div>${t.description || ''}</div><div>Entrega: ${t.due || '—'}</div>`;
          tasksDiv.appendChild(el);
        });
      })
    .catch(async () => {
      const data = await LocalBackend.getTasks(parseInt(courseId,10));
      tasksDiv.innerHTML = '';
      (data.tasks || []).forEach(t => {
        const el = document.createElement('div');
        el.className = 'task';
        el.innerHTML = `<strong>${t.title}</strong><div>${t.description || ''}</div><div>Entrega: ${t.due || '—'}</div>`;
        tasksDiv.appendChild(el);
      });
    });
    }

    loadTasks();

    const createTaskForm = document.getElementById('createTaskForm');
    if (createTaskForm) {
      createTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const due = document.getElementById('due').value;
        const fileInput = document.getElementById('file');

        // Si hay archivo, subirlo primero
        if (fileInput && fileInput.files && fileInput.files.length) {
          const fd = new FormData();
          fd.append('file', fileInput.files[0]);
          fetch('/upload', { method: 'POST', body: fd, headers: token ? { 'Authorization': 'Bearer ' + token } : {} })
            .then(r => r.json())
            .then(uploadResp => {
              if (uploadResp.success) {
                const fileUrl = uploadResp.url;
                submitTask(title, description, due, fileUrl);
              } else {
                // Fallback local (crear URL temporal)
                LocalBackend.uploadFileClient(fileInput.files[0]).then(u => submitTask(title, description, due, u.url));
              }
            });
        } else {
          submitTask(title, description, due, null);
        }
      });
    }

    function submitTask(title, description, due, fileUrl) {
      fetch(`/courses/${courseId}/tasks`, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'Authorization': 'Bearer ' + token } : {}),
        body: JSON.stringify({ title, description, due, assigned_by: 'profesor' , file: fileUrl })
      }).then(r=>{
        if(!r.ok) throw new Error('server');
        return r.json();
      }).then(resp=>{
        if (resp.success) {
          alert('Tarea creada');
          document.getElementById('title').value = '';
          document.getElementById('description').value = '';
          loadTasks();
        } else {
          alert('Error: ' + (resp.message||''));
        }
      }).catch(async () => {
        const uid = parseInt(localStorage.getItem('user_id') || '0', 10);
        const user = { id: uid, rol: localStorage.getItem('rol') };
        const resp = await LocalBackend.createTask({ course_id: parseInt(courseId,10), title, description, due, assigned_by: 'profesor', fileUrl, user });
        if (resp.success) {
          alert('Tarea creada');
          document.getElementById('title').value = '';
          document.getElementById('description').value = '';
          loadTasks();
        } else {
          alert('Error: ' + (resp.message||''));
        }
      });
    }
  }
});
