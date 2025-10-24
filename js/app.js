// Inicialización segura cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  function navSlide() {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    if (!burger || !nav) return;

    burger.addEventListener('click', () => {
      // Toggle Nav
      nav.classList.toggle('nav-active');

      // Animate Links
      navLinks.forEach((link, index) => {
        if (link.style.animation) {
          link.style.animation = '';
        } else {
          link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.5}s`;
        }
      });

      // Burger Animation and accessibility
      burger.classList.toggle('toggle');
      const expanded = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', (!expanded).toString());
    });
  }

  navSlide();

  // Notificaciones panel
  const notificationsBtn = document.getElementById('notificationsBtn');
  const notificationsPanel = document.getElementById('notificationsPanel');
  const closeNotifications = document.getElementById('closeNotifications');
  const tabUnread = document.getElementById('tabUnread');
  const tabAll = document.getElementById('tabAll');
  const unreadList = document.getElementById('unreadList');
  const allList = document.getElementById('allList');

  if (notificationsBtn && notificationsPanel) {
    notificationsBtn.addEventListener('click', () => {
      const isVisible = getComputedStyle(notificationsPanel).display === 'flex';
      notificationsPanel.style.display = isVisible ? 'none' : 'flex';
    });
  }

  if (closeNotifications && notificationsPanel) {
    closeNotifications.addEventListener('click', () => {
      notificationsPanel.style.display = 'none';
    });
  }

  if (tabUnread && tabAll && unreadList && allList) {
    tabUnread.addEventListener('click', () => {
      tabUnread.classList.add('active');
      tabAll.classList.remove('active');
      unreadList.style.display = '';
      allList.style.display = 'none';
    });

    tabAll.addEventListener('click', () => {
      tabAll.classList.add('active');
      tabUnread.classList.remove('active');
      allList.style.display = '';
      unreadList.style.display = 'none';
    });
  }

  // Animación del progreso (mover desde inline HTML)
  const progressBars = document.querySelectorAll('.progress-bar-fill.animated');
  progressBars.forEach(bar => {
    const width = bar.getAttribute('data-width') || '0';
    setTimeout(() => {
      bar.style.width = width + '%';
    }, 500);
  });

  // Marcar mensajes como leídos y actualizar contador
  const messageItems = document.querySelectorAll('.message-item');
  messageItems.forEach(item => {
    item.addEventListener('click', function() {
      this.classList.remove('unread');
      const status = this.querySelector('.message-status');
      if (status) {
        status.classList.remove('unread');
        status.classList.add('read');
      }

      // Actualizar contador de notificaciones
      const notificationDot = document.querySelector('.notification-dot');
      if (notificationDot && notificationDot.textContent) {
        const currentCount = parseInt(notificationDot.textContent) || 0;
        if (currentCount > 0) {
          const next = currentCount - 1;
          notificationDot.textContent = next;
          if (next === 0) {
            notificationDot.style.display = 'none';
          }
        }
      }
    });
  });

});