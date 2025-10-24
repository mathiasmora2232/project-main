# EduConnect (project-main)

Pequeñas mejoras aplicadas para hacer el proyecto más accesible y robusto.

Qué cambié:
- `Homepage.html`: meta description, optimización de carga de fuentes, mejor accesibilidad (nav aria, burger -> button), corrección de enlace a `Cuenta.html`, eliminación de script inline y uso de `defer`.
- `js/app.js`: ahora inicializa al `DOMContentLoaded` y contiene la lógica de animaciones y manejo de notificaciones; incluye comprobaciones defensivas y maneja `aria-expanded` del botón burger.
- `js/adminlink.js`: menos logs de depuración y manejo más robusto si no existe el enlace admin.
- Añadí `Calendario.html` como página placeholder para el enlace del menú.
- Añadí este `README.md` con instrucciones rápidas.

Cómo probar localmente (solo front-end):
1. Abrir `Homepage.html` directamente en el navegador (Windows): doble clic en el archivo o arrastrar al navegador.

Si quieres usar el servidor Python (hay un `py/app.py` con utilidades):
1. Instala dependencias mínimas si usas Flask: `pip install flask flask-cors rich`
2. Ejecuta `py\\app.py` con Python 3 (desde `py` carpeta):

   - En PowerShell, desde la carpeta del proyecto:

```powershell
cd c:\Users\USER\Desktop\programs\webeduca\project-main\py
python app.py
```

(Nota: `app.py` tiene utilidades CLI y algunas rutas; revisa el archivo para ver endpoints disponibles.)

Endpoints útiles añadidos:
- `POST /login` -> JSON { email, password } devuelve { success, rol, username, email }
- `POST /register` -> JSON { username, email, password, rol } crea usuario (contraseña se almacena hasheada)

Nota sobre migración: las contraseñas existentes en `usuarios.json` en texto plano serán migradas al primer inicio de sesión exitoso (se reemplaza por un hash seguro). Esto permite mejorar seguridad sin forzar cambios masivos.

Siguientes pasos recomendados (priorizados):
1. Añadir validación de enlaces y un script que detecte links rotos.
2. Extraer CSS repetido a `css/` y eliminar estilos inline.
3. Añadir una página real para `Cuenta.html` si aún no está completa.
4. Implementar autenticación segura en `py/app.py` (no almacenar contraseñas en texto plano).

Si quieres, aplico las siguientes mejoras ahora:
- Corregir enlaces rotos en todas las páginas y añadir un pequeño script que valide rutas.
- Agregar un pequeño script de "build" que combine/minifique CSS y JS (sin cambiar librerías externas).
- Añadir buenos atributos `alt` a imágenes y mejorar la estructura ARIA.

Dime qué prefieres que haga ahora y lo implemento.
