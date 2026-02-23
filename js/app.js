/**
 * EduConnect - Main Application JavaScript
 * Handles navigation, notifications, and core UI interactions
 */
document.addEventListener('DOMContentLoaded', function() {
	'use strict';

	// ==================== NAVIGATION ====================
	function initNavigation() {
		const burger = document.getElementById('burgerMenu');
		const navLinks = document.querySelector('.nav-links');

		if (burger && navLinks) {
			burger.addEventListener('click', (e) => {
				e.stopPropagation();
				navLinks.classList.toggle('active');
			});
		}

		if (navLinks) {
			navLinks.querySelectorAll('a').forEach(link => {
				link.addEventListener('click', () => {
					navLinks.classList.remove('active');
				});
			});
		}

		document.addEventListener('click', (e) => {
			if (navLinks && burger && !navLinks.contains(e.target) && !burger.contains(e.target)) {
				navLinks.classList.remove('active');
			}
		});

		// User dropdown
		const userBtn = document.getElementById('userMenuBtn');
		const userDropdown = document.getElementById('userDropdown');
		if (userBtn && userDropdown) {
			userBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				userDropdown.classList.toggle('show');
			});
			document.addEventListener('click', (e) => {
				if (!userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
					userDropdown.classList.remove('show');
				}
			});
		}

		// Logout buttons
		document.querySelectorAll('[data-action="logout"]').forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				if (typeof logout === 'function') logout();
			});
		});

		// Set user name in nav
		if (typeof getUser === 'function') {
			const user = getUser();
			const nameEl = document.getElementById('userName');
			if (nameEl && user) {
				nameEl.textContent = user.nombre_completo || user.email;
			}
		}
	}

	// ==================== NOTIFICATIONS ====================
	function initNotifications() {
		const notificationsBtn = document.getElementById('notificationsBtn');
		const notificationsPanel = document.getElementById('notificationsPanel');
		const closeNotifications = document.getElementById('closeNotifications');

		if (!notificationsBtn || !notificationsPanel) return;

		notificationsBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			notificationsPanel.classList.toggle('show');
		});

		if (closeNotifications) {
			closeNotifications.addEventListener('click', () => {
				notificationsPanel.classList.remove('show');
			});
		}

		document.addEventListener('click', (e) => {
			if (!notificationsPanel.contains(e.target) && !notificationsBtn.contains(e.target)) {
				notificationsPanel.classList.remove('show');
			}
		});
	}

	// ==================== ANIMATIONS ====================
	function initAnimations() {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.style.opacity = '1';
					entry.target.style.transform = 'translateY(0)';
				}
			});
		}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

		document.querySelectorAll('.card, .materia-card, .course-card, .stat-card-item, .curso-card').forEach(el => {
			el.style.opacity = '0';
			el.style.transform = 'translateY(20px)';
			el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
			observer.observe(el);
		});
	}

	// ==================== INITIALIZATION ====================
	initNavigation();
	initNotifications();
	initAnimations();
});
