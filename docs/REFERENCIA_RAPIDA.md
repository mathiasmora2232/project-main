# 🚀 Referencia Rápida - EduConnect v2.0

## Estructura de Colores CSS

### Variables Disponibles

```css
/* COLORES PRIMARIOS */
--primary: #6366f1;          /* Índigo - Principal */
--primary-dark: #4f46e5;     /* Índigo oscuro - Hover */
--primary-light: #818cf8;    /* Índigo claro - Texto */
--secondary: #ec4899;        /* Rosado - Acentos */

/* COLORES DE ESTADO */
--success: #10b981;          /* Verde - Éxito */
--warning: #f59e0b;          /* Naranja - Advertencia */
--danger: #ef4444;           /* Rojo - Error */
--info: #0ea5e9;             /* Cyan - Información */

/* COLORES NEUTRALES (9 niveles) */
--neutral-50: #fafafa;       /* Blanco casi puro */
--neutral-100: #f3f4f6;      /* Muy claro */
--neutral-200: #e5e7eb;      /* Claro */
--neutral-300: #d1d5db;      /* Gris claro */
--neutral-400: #9ca3af;      /* Gris medio */
--neutral-500: #6b7280;      /* Gris */
--neutral-600: #4b5563;      /* Gris oscuro */
--neutral-700: #374151;      /* Muy oscuro */
--neutral-800: #1f2937;      /* Casi negro */
--neutral-900: #111827;      /* Negro casi puro */
```

## Sombras CSS

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.1);
--shadow-2xl: 0 25px 50px rgba(0,0,0,0.25);
```

## Espaciado y Bordes

```css
--radius-sm: 6px;           /* Pequeño */
--radius-md: 12px;          /* Mediano */
--radius-lg: 16px;          /* Grande */
--transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
```

---

## 🎯 Clases CSS Principales

### Botones

```html
<!-- Botón primario -->
<button class="btn btn-primary">Aceptar</button>

<!-- Botón secundario -->
<button class="btn btn-secondary">Cancelar</button>

<!-- Botón peligro -->
<button class="btn btn-danger">Eliminar</button>
```

### Tarjetas

```html
<div class="card">
  <div class="card-header">
    <h2>Título</h2>
    <span class="trend-indicator">+5%</span>
  </div>
  <div class="card-content">
    <!-- Contenido -->
  </div>
  <div class="card-footer">
    <a href="#" class="card-link">Ver más</a>
  </div>
</div>
```

### Badges

```html
<span class="badge badge-success">Aprobado</span>
<span class="badge badge-warning">Pendiente</span>
<span class="badge badge-danger">Rechazado</span>
<span class="badge badge-info">Información</span>
```

### Formularios

```html
<form class="form">
  <div class="form-group">
    <label for="email">Email</label>
    <input 
      class="input-email" 
      id="email" 
      type="email"
    >
  </div>
  <button type="submit" class="btn btn-primary">
    Enviar
  </button>
</form>
```

### Notificaciones

```html
<!-- Éxito -->
<div class="success-message">
  <span>✓</span>
  <span>Operación exitosa</span>
</div>

<!-- Error -->
<div class="error-message">
  <span>⚠️</span>
  <span>Error al procesar</span>
</div>
```

---

## 📊 Responsive Breakpoints

```css
/* Desktop (Default) */
/* 1200px+ */

/* Tablet */
@media (max-width: 768px) { }

/* Móvil grande */
@media (max-width: 640px) { }

/* Móvil pequeño */
@media (max-width: 480px) { }
```

---

## 🎨 Ejemplos de Uso

### Cambiar Color Primario

En `css/Global.css`:
```css
:root {
  --primary: #7c3aed;  /* Nuevo color púrpura */
}
```
Esto actualiza TODO el sitio automáticamente.

### Crear Componente Personalizado

```css
.mi-componente {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 20px;
  transition: var(--transition);
}

.mi-componente:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
```

### Animación Personalizada

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animado {
  animation: fadeIn 0.6s ease forwards;
}
```

---

## 📱 Componentes Responsivos

### Grid Automático

```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
  <div class="card">...</div>
  <div class="card">...</div>
  <div class="card">...</div>
</div>
```

### Flex Responsive

```html
<div style="display: flex; flex-wrap: wrap; gap: 20px;">
  <div style="flex: 1; min-width: 250px;">...</div>
  <div style="flex: 1; min-width: 250px;">...</div>
</div>
```

---

## 🔤 Tipografía

### Escala de Fuentes

```css
/* Títulos */
h1 { font-size: clamp(2rem, 5vw, 4rem); }   /* Responsivo */
h2 { font-size: 2rem; font-weight: 700; }
h3 { font-size: 1.5rem; font-weight: 700; }
h4 { font-size: 1.25rem; font-weight: 600; }
h5 { font-size: 1.1rem; font-weight: 600; }
h6 { font-size: 1rem; font-weight: 600; }

/* Párrafos */
p { font-size: 1rem; line-height: 1.6; }
small { font-size: 0.875rem; }
.text-sm { font-size: 0.85rem; }
.text-xs { font-size: 0.75rem; }
```

### Pesos de Fuente

```css
font-weight: 300;  /* Light */
font-weight: 400;  /* Regular */
font-weight: 500;  /* Medium */
font-weight: 600;  /* Semibold */
font-weight: 700;  /* Bold */
font-weight: 800;  /* Extra Bold */
```

---

## 🎬 Transiciones Comunes

```css
/* Transición rápida */
transition: background 0.2s ease;

/* Transición estándar */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Transición lenta */
transition: transform 0.6s ease;
```

---

## 🎯 Patrones Comunes

### Efecto Hover Elevación

```css
.elemento {
  transition: all 0.3s ease;
}

.elemento:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

### Efecto Gradiente

```css
background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
```

### Efecto Focus Accesible

```css
input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

### Skeleton Loading

```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 🔌 Integración JavaScript

### Obtener variable CSS

```javascript
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary').trim();
```

### Cambiar variable CSS dinámicamente

```javascript
document.documentElement.style.setProperty('--primary', '#7c3aed');
```

### Detectar tema preferido

```javascript
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  // Modo oscuro preferido
}
```

---

## 📋 Checklist para Mantener Diseño

- ✅ Usar variables CSS en lugar de valores hardcodeados
- ✅ Mantener consistencia de espaciado (gap, margin, padding)
- ✅ Usar la escala de sombras estandarizada
- ✅ Aplicar transiciones suaves a interacciones
- ✅ Mantener WCAG AA de accesibilidad
- ✅ Probar en múltiples dispositivos
- ✅ Usar clases CSS reutilizables
- ✅ Documentar cambios importantes

---

## 🆘 Troubleshooting Común

### Estilos no se aplican

```css
/* Asegúrate de especificidad correcta */
.selector {
  property: value !important;  /* Último recurso */
}
```

### Elemento se ve distinto en móvil

```css
/* Verifica media queries */
@media (max-width: 768px) {
  .elemento {
    /* Estilos mobile */
  }
}
```

### Animación no funciona

```css
/* Asegúrate que transform sea 3D */
.elemento {
  will-change: transform;
  transform: translateZ(0);
}
```

---

## 📚 Recursos

- **Google Fonts**: https://fonts.google.com
- **CSS Variables**: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- **Flexbox**: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- **Grid**: https://css-tricks.com/snippets/css/complete-guide-grid/
- **Accesibilidad**: https://www.w3.org/WAI/WCAG21/quickref/

---

**¡Última actualización: 10 de Febrero de 2026**
