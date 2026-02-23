// calendario.js - Monthly calendar using API
(function(){
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

  async function loadEvents(){
    try {
      if (typeof getTareasPendientes === 'function') {
        const tareas = await getTareasPendientes();
        return tareas.map(t => ({
          id: t.id,
          title: t.titulo || t.title || 'Tarea',
          date: t.fecha_entrega || t.due || null,
          materia: t.materia_nombre || ''
        })).filter(x => x.date);
      }
      return [];
    } catch(e) {
      console.warn('No se pudieron cargar eventos', e);
      return [];
    }
  }

  function clearGrid(){ gridEl.innerHTML = ''; }

  function renderWeekdays(){
    const days = ['Lun','Mar','Mie','Jue','Vie','Sab','Dom'];
    days.forEach(d => {
      const el = document.createElement('div');
      el.className = 'calendar-weekday';
      el.textContent = d;
      gridEl.appendChild(el);
    });
  }

  function sameDate(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

  async function render(){
    const events = await loadEvents();
    clearGrid();
    renderWeekdays();

    const first = startOfMonth(current);
    const last = endOfMonth(current);
    const start = addDays(first, -((first.getDay()+6)%7));
    const end = addDays(last, (7 - ((last.getDay()+6)%7) -1));

    titleEl.textContent = formatMonthYear(current);

    let d = new Date(start);
    while (d <= end){
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      const dateEl = document.createElement('div');
      dateEl.className = 'date';
      dateEl.textContent = d.getDate();
      cell.appendChild(dateEl);

      if (d.getMonth() !== current.getMonth()) cell.classList.add('outside');
      if (sameDate(d, new Date())) cell.classList.add('today');

      const dayStr = d.toISOString().slice(0,10);
      const dayEvents = events.filter(e => {
        try {
          const evDate = new Date(e.date).toISOString().slice(0,10);
          return evDate === dayStr;
        } catch { return false; }
      });

      dayEvents.slice(0,3).forEach(ev => {
        const evEl = document.createElement('div');
        evEl.className = 'event';
        evEl.textContent = ev.title;
        cell.appendChild(evEl);
      });

      if(dayEvents.length > 3){
        const more = document.createElement('div');
        more.className = 'event';
        more.textContent = `+${dayEvents.length-3} mas`;
        more.style.opacity = '0.7';
        cell.appendChild(more);
      }

      gridEl.appendChild(cell);
      d = addDays(d,1);
    }

    // Event list for the month
    eventList.innerHTML = '<h3>Eventos del mes</h3>';
    const monthEvents = events.filter(e => {
      try {
        const evDate = new Date(e.date);
        return evDate.getMonth() === current.getMonth() && evDate.getFullYear() === current.getFullYear();
      } catch { return false; }
    }).sort((a,b) => new Date(a.date) - new Date(b.date));

    if(!monthEvents.length) {
      eventList.innerHTML += '<p class="empty-state">No hay eventos este mes.</p>';
    }
    monthEvents.forEach(ev => {
      const days = Math.ceil((new Date(ev.date) - new Date()) / (1000*60*60*24));
      const urgency = days < 3 ? 'urgency-danger' : days < 7 ? 'urgency-warning' : 'urgency-success';
      const it = document.createElement('div');
      it.className = `event-item ${urgency}`;
      it.innerHTML = `<strong>${ev.title}</strong><span class="event-meta">${ev.materia} - ${new Date(ev.date).toLocaleDateString('es-ES')}</span>`;
      eventList.appendChild(it);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { current = new Date(current.getFullYear(), current.getMonth()-1, 1); render(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { current = new Date(current.getFullYear(), current.getMonth()+1, 1); render(); });
  if (todayBtn) todayBtn.addEventListener('click', () => { current = new Date(); render(); });

  document.addEventListener('DOMContentLoaded', () => { render(); });
})();
