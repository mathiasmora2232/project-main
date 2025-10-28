// calendario.js - calendario mensual simple y ligero
(function(){
  // Utilidades de fecha
  function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
  function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }
  function addDays(d,n){ const r=new Date(d); r.setDate(r.getDate()+n); return r; }

  const titleEl = document.getElementById('calendarTitle');
  const gridEl = document.getElementById('calendarGrid');
  const eventList = document.getElementById('eventList');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const todayBtn = document.getElementById('todayBtn');

  let current = new Date();

  function formatMonthYear(d){ return d.toLocaleString('es-ES',{month:'long', year:'numeric'}); }
  function formatDayShort(d){ return d.toLocaleString('es-ES',{weekday:'short'}).slice(0,2).toUpperCase(); }

  // Cargar eventos desde LocalBackend si existe, sino intentar tareas.json
  async function loadEvents(){
    try{
      if (typeof LocalBackend !== 'undefined'){
        // Obtener todas las tareas locales
        // LocalBackend almacena tareas asociadas a course_id
        const cursos = JSON.parse(localStorage.getItem('we_courses')||'[]');
        const tareas = JSON.parse(localStorage.getItem('we_tasks')||'[]');
        // mapear tareas con fecha (campo due o fecha_limite)
        return tareas.map(t=>({
          id:t.id||t.id_tarea||Math.random(),
          title:t.title||t.titulo||t.name||'Tarea',
          date: t.due || t.fecha_limite || null,
          course_id: t.course_id || t.course || null
        })).filter(x=>x.date);
      } else {
        const res = await fetch('tareas.json');
        if (!res.ok) return [];
        const json = await res.json();
        // tareas.json en este repo usa secciones por materia; intentar normalizar
        const list = [];
        if (Array.isArray(json)){
          // ya es lista
          json.forEach(t=> { if(t.fecha_limite || t.due) list.push({ id:t.id||Math.random(), title:t.titulo||t.title||'Tarea', date:t.fecha_limite||t.due }) });
        } else if (typeof json === 'object'){
          Object.values(json).forEach(arr=>{
            if(Array.isArray(arr)) arr.forEach(t=> { if(t.fecha_limite) list.push({ id:t.id_tarea||Math.random(), title:t.titulo||t.title||'Tarea', date:t.fecha_limite }) })
          })
        }
        return list;
      }
    }catch(e){ console.warn('No se pudieron cargar eventos', e); return []; }
  }

  function clearGrid(){ gridEl.innerHTML = ''; }

  function renderWeekdays(){ const days = ['Lun','Mar','Mie','Jue','Vie','Sab','Dom']; days.forEach(d=>{ const el=document.createElement('div'); el.className='calendar-weekday'; el.textContent=d; gridEl.appendChild(el); }); }

  function sameDate(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

  async function render(){
    const events = await loadEvents();
    clearGrid();
    renderWeekdays();

    const first = startOfMonth(current);
    const last = endOfMonth(current);
    // encontrar primer lunes anterior o igual al primer dia
    const start = addDays(first, -((first.getDay()+6)%7));
    const end = addDays(last, (7 - ((last.getDay()+6)%7) -1));

    titleEl.textContent = formatMonthYear(current);

    let d = new Date(start);
    while (d <= end){
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      const dateEl = document.createElement('div'); dateEl.className='date'; dateEl.textContent = d.getDate(); cell.appendChild(dateEl);

      // marcar fuera de mes
      if (d.getMonth() !== current.getMonth()) cell.classList.add('outside');
      // marcar hoy
      if (sameDate(d, new Date())) cell.classList.add('today');

      // eventos del día
      const dayStr = d.toISOString().slice(0,10);
      const dayEvents = events.filter(e=>{
        try{
          return e.date && e.date.slice(0,10) === dayStr;
        }catch(err){ return false; }
      });
      dayEvents.slice(0,3).forEach(ev=>{
        const evEl = document.createElement('div'); evEl.className='event'; evEl.textContent = ev.title; cell.appendChild(evEl);
      });

      // si hay más eventos, indicador
      if(dayEvents.length>3){ const more = document.createElement('div'); more.className='event'; more.textContent = `+${dayEvents.length-3} más`; more.style.opacity='0.7'; cell.appendChild(more); }

      gridEl.appendChild(cell);
      d = addDays(d,1);
    }

    // lista detallada
    eventList.innerHTML = '<h3>Eventos del mes</h3>';
    const monthStr = current.toISOString().slice(0,7);
    const monthEvents = events.filter(e=> e.date && e.date.indexOf(monthStr)===0 ).sort((a,b)=> new Date(a.date)-new Date(b.date));
    if(!monthEvents.length) eventList.innerHTML += '<p>No hay eventos este mes.</p>';
    monthEvents.forEach(ev=>{
      const it = document.createElement('div'); it.className='card'; it.style.marginBottom='8px';
      it.innerHTML = `<strong>${ev.title}</strong> — <small>${new Date(ev.date).toLocaleDateString()}</small>`;
      eventList.appendChild(it);
    });
  }

  // controles
  prevBtn.addEventListener('click', ()=>{ current = new Date(current.getFullYear(), current.getMonth()-1, 1); render(); });
  nextBtn.addEventListener('click', ()=>{ current = new Date(current.getFullYear(), current.getMonth()+1, 1); render(); });
  todayBtn.addEventListener('click', ()=>{ current = new Date(); render(); });

  // inicializar
  document.addEventListener('DOMContentLoaded', ()=>{ render(); });

})();
