import json
import os
import threading
from datetime import datetime, timedelta
import re
import string
from flask import Flask, request, jsonify
from flask_cors import CORS
from rich.console import Console
from rich.table import Table

def cargar_usuarios():
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

app = Flask(__name__)
CORS(app)

# Ajusta la ruta del archivo para que funcione desde cualquier ubicación
USERS_FILE = os.path.join(os.path.dirname(__file__), '..', 'usuarios.json')

# Guardar datos de usuario en el servidor
@app.route('/guardar_datos_usuario', methods=['POST'])
def guardar_datos_usuario():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    datos = data.get('datos')
    if not username or not email or not datos:
        return jsonify({'success': False, 'message': 'Datos incompletos'}), 400
    datos_file = os.path.join(os.path.dirname(__file__), '..', 'datosusers.json')
    # Leer datos existentes
    if os.path.exists(datos_file):
        with open(datos_file, 'r', encoding='utf-8') as f:
            try:
                all_data = json.load(f)
            except Exception:
                all_data = {}
    else:
        all_data = {}
    # Guardar bajo clave única
    key = f'{username}_{email}'
    all_data[key] = datos
    with open(datos_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    return jsonify({'success': True})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    usuarios = cargar_usuarios()
    for usuario in usuarios:
        if usuario['email'] == email and usuario['password'] == password:
            return jsonify({
                'success': True,
                'rol': usuario.get('rol', 'user'),
                'username': usuario.get('username', ''),
                'email': usuario['email']
            })
    return jsonify({'success': False, 'message': 'Credenciales incorrectas'})

def limpiarConsola():
    os.system('cls' if os.name == 'nt' else 'clear')

limpiarConsola()

archivoBloqueo = 'bloqueo.json'
maxIntentos = 10
tiempoBloqueoMinutos = 1

def cargarEstadoBloqueo():
    if not os.path.exists(archivoBloqueo):
        return {"intentos": 0, "hora_bloqueo": None}
    
    with open(archivoBloqueo, "r") as f:
        contenido = f.read().strip()
        if contenido == "":
            return {"intentos": 0, "hora_bloqueo": None}
        datos = json.loads(contenido)
        if datos["hora_bloqueo"]:
            datos["hora_bloqueo"] = datetime.fromisoformat(datos["hora_bloqueo"])
        return datos

def guardarEstadoBloqueo(estado):
    datosGuardar = estado.copy()
    if datosGuardar["hora_bloqueo"]:
        datosGuardar["hora_bloqueo"] = datosGuardar["hora_bloqueo"].isoformat()
    with open(archivoBloqueo, "w") as f:
        json.dump(datosGuardar, f)

def estaBloqueado(estado):
    if estado["hora_bloqueo"] is None:
        return False
    ahora = datetime.now()
    if ahora - estado["hora_bloqueo"] >= timedelta(minutes=tiempoBloqueoMinutos):
        estado["intentos"] = 0
        estado["hora_bloqueo"] = None
        guardarEstadoBloqueo(estado)
        return False
    return True

def obtenerPeriodoActivo():
    if not os.path.exists('periodos.json'):
        return None
    
    with open('periodos.json', 'r', encoding='utf-8') as archivo:
        periodos = json.load(archivo)
    
    for p in periodos:
        if p.get('activo'):
            return p['nombre']
    
    return None

def normalizarRol(rol):
    rol_normalizado = rol.lower().strip()
    mapeo_roles = {
        'administrador': 'administrador',
        'administrator': 'administrador',
        'admin': 'administrador',
        'profesor': 'profesor',
        'teacher': 'profesor',
        'prof': 'profesor',
        'estudiante': 'estudiante',
        'student': 'estudiante',
        'alumno': 'estudiante',
        'administrativo': 'administrativo',
        'administrative': 'administrativo',
        'staff': 'administrativo'
    }
    return mapeo_roles.get(rol_normalizado, rol_normalizado)

def esRolValido(rol):
    roles_validos = ['administrador', 'profesor', 'estudiante', 'administrativo']
    return normalizarRol(rol) in roles_validos

def iniciarSesion():
    estado = cargarEstadoBloqueo()
    if estaBloqueado(estado):
        tiempoRestante = timedelta(minutes=tiempoBloqueoMinutos) - (datetime.now() - estado['hora_bloqueo'])
        total_segundos = int(tiempoRestante.total_seconds())
        minutos = total_segundos // 60
        segundos = total_segundos % 60
        print(f'\033[31m⏳ Tu cuenta está bloqueada. Intenta de nuevo en {minutos} minuto(s) y {segundos} segundo(s).\033[0m')
        return None

    while True:
        if not os.path.exists('usuarios.json'):
            print('No existe el archivo usuarios')
            return None
        
        with open('usuarios.json', 'r', encoding='utf-8') as archivo:
            usuarios = json.load(archivo)

        usuarioIngresado = input('Ingrese su email o nombre de usuario: ').strip()
        contraseñaIngresada = input('Ingrese su contraseña: ').strip()

        if not usuarioIngresado:
            print('\033[31m ERROR: \033[0m El usuario/email no puede estar vacío.')
            continue
        
        if not contraseñaIngresada:
            print('\033[31m ERROR: \033[0m La contraseña no puede estar vacía.')
            continue

        usuario_encontrado = None
        for usuario in usuarios:
            email_match = usuario.get('email', '').lower() == usuarioIngresado.lower()
            username_match = usuario.get('username', '').lower() == usuarioIngresado.lower()
            
            if (email_match or username_match) and usuario['password'] == contraseñaIngresada:
                usuario_encontrado = usuario
                break

        if usuario_encontrado:
            print(f'Bienvenido {usuario_encontrado["username"]} ({usuario_encontrado["email"]}) - Rol: {usuario_encontrado["rol"]}')
            estado["intentos"] = 0
            estado["hora_bloqueo"] = None
            guardarEstadoBloqueo(estado)
            return usuario_encontrado

        estado["intentos"] += 1
        guardarEstadoBloqueo(estado)

        intentos_restantes = maxIntentos - estado["intentos"]
        if intentos_restantes > 0:
            print(f'\033[31m ERROR: \033[0m Email/usuario o contraseña incorrectos. Te quedan {intentos_restantes} intento(s).')
        else:
            estado["hora_bloqueo"] = datetime.now()
            guardarEstadoBloqueo(estado)
            print(f'\033[31m ERROR: \033[0m Has superado los {maxIntentos} intentos. Tu cuenta está bloqueada por {tiempoBloqueoMinutos} minutos.')
            return None

def listarUsuarios():
    if not os.path.exists('usuarios.json'):
        print('No existe el archivo usuarios.')
        return
    
    with open('usuarios.json', 'r', encoding='utf-8') as archivo:
        usuarios = json.load(archivo)

    print('--- Lista de Usuarios ---')
    for u in usuarios:
        email = u.get('email', 'No especificado')
        username = u.get('username', u.get('usuario', 'No especificado'))
        print(f'ID: {u["id"]}, Usuario: {username}, Email: {email}, Rol: {u["rol"]}')

def crearUsuario():
    if not os.path.exists('usuarios.json'):
        usuarios = []
    else:
        with open('usuarios.json', 'r', encoding='utf-8') as archivo:
            usuarios = json.load(archivo)

    nuevoId = max([u["id"] for u in usuarios], default=0) + 1

    while True:
        email = input("Ingrese email: ").strip()
        if not email:
            print('El email no puede estar vacío.')
            continue
        if '@' not in email or '.' not in email:
            print('Formato de email inválido.')
            continue
        if any(u.get('email', '').lower() == email.lower() for u in usuarios):
            print('El email ya existe.')
            continue
        break

    while True:
        username = input("Ingrese nombre de usuario: ").strip()
        if not username:
            print('El nombre de usuario no puede estar vacío.')
            continue
        if len(username) < 2:
            print('El nombre de usuario debe tener al menos 2 caracteres.')
            continue
        if any(u.get('username', '').lower() == username.lower() for u in usuarios):
            print('El nombre de usuario ya existe.')
            continue
        break

    while True:
        password = input("Ingrese contraseña: ").strip()
        if not password:
            print("La contraseña no puede estar vacía.")
            continue
        if len(password) < 4:
            print("La contraseña debe tener al menos 4 caracteres.")
            continue
        break

    while True:
        print("Roles disponibles: Administrador, Profesor, Estudiante, Administrativo")
        print("(También puedes usar: Admin, Teacher, Student, Administrative)")
        rol = input("Ingrese rol: ").strip()
        if not rol:
            print("El rol no puede estar vacío.")
            continue
        if not esRolValido(rol):
            print("Rol no válido.")
            continue
        break

    nuevoUsuario = {
        "id": nuevoId,
        "email": email,
        "username": username,
        "password": password,
        "rol": rol
    }

    usuarios.append(nuevoUsuario)

    with open('usuarios.json', 'w', encoding='utf-8') as archivo:
        json.dump(usuarios, archivo, indent=4, ensure_ascii=False)

    print(f"Usuario '{username}' ({email}) registrado exitosamente con rol '{rol}'.")

def eliminarUsuario():
    if not os.path.exists('usuarios.json'):
        print('No existe el archivo usuarios.')
        return

    with open('usuarios.json', 'r', encoding='utf-8') as archivo:
        usuarios = json.load(archivo)

    listarUsuarios()
    try:
        idAEliminar = int(input("Ingrese el ID del usuario a eliminar: "))
    except ValueError:
        print("ID inválido.")
        return

    usuariosFiltrados = [u for u in usuarios if u["id"] != idAEliminar]

    if len(usuarios) == len(usuariosFiltrados):
        print("No se encontró un usuario con ese ID.")
    else:
        with open('usuarios.json', 'w', encoding='utf-8') as archivo:
            json.dump(usuariosFiltrados, archivo, indent=4, ensure_ascii=False)
        print("Usuario eliminado correctamente.")

def gestionarUsuarios():
    while True:
        print('\n------------------- Submenú: Gestión de Usuarios -------------------')
        print('1. Listar Usuarios')
        print('2. Crear Usuario')
        print('3. Eliminar Usuario')
        print('0. Volver al menú anterior')

        opcion = input('Seleccione una opción: ')

        if opcion == '1':
            listarUsuarios()
        elif opcion == '2':
            crearUsuario()
        elif opcion == '3':
            eliminarUsuario()
        elif opcion == '0':
            print("Volviendo al menú anterior...\n")
            break
        else:
            print("Opción no válida. Intente de nuevo.")

def listaCursos():
    if not os.path.exists('cursos.json'):
        print('No existe el archivo cursos.json')
        return
    
    with open('cursos.json', 'r', encoding='utf-8') as archivo:
        cursos = json.load(archivo)
    
    if not os.path.exists('profesores.json'):
        print('No existe el archivo profesores.json')
        return

    with open('profesores.json', 'r', encoding='utf-8') as archivo:
        profesores = json.load(archivo)

    profesores_dict = {p['id']: p['nombre'] for p in profesores}

    print('\n--- Lista de Cursos ---')
    for curso in cursos:
        profesor_id = curso.get('profesor_id')
        nombre_profesor = profesores_dict.get(profesor_id, "No asignado")
        print(f"ID: {curso['id']}, Nombre: {curso['nombre']}, Profesor: {nombre_profesor}")

def crearCurso():
    if not os.path.exists('cursos.json'):
        cursos = []
    else:
        with open('cursos.json', 'r', encoding='utf-8') as archivo:
            cursos = json.load(archivo)

    if not os.path.exists('profesores.json'):
        print("No existe el archivo profesores.json")
        return

    with open('profesores.json', 'r', encoding='utf-8') as archivo:
        profesores = json.load(archivo)

    nuevo_id = max([c["id"] for c in cursos], default=0) + 1
    nombre_curso = input("Ingrese el nombre del curso: ").strip()

    if nombre_curso == '':
        print('\033[31m ERROR: \033[0m El nombre del curso no puede estar vacío.')
        return

    if any(c['nombre'].lower() == nombre_curso.lower() for c in cursos):
        print("Ya existe un curso con ese nombre.")
        return

    profesores_disponibles = [
        p for p in profesores if p['especialidad'].lower() in nombre_curso.lower()
    ]

    if not profesores_disponibles:
        print("No hay profesores disponibles con esa especialidad.")
        return

    print("\nProfesores disponibles para este curso:")
    for prof in profesores_disponibles:
        cantidad = sum(1 for c in cursos if c['profesor_id'] == prof['id'])
        estado = f"(Ya tiene {cantidad} curso{'s' if cantidad != 1 else ''})"
        print(f"ID: {prof['id']} - {prof['nombre']} ({prof['especialidad']}) {estado}")

    try:
        profesor_id = int(input("Ingrese el ID del profesor a asignar: "))
        if not any(p['id'] == profesor_id for p in profesores_disponibles):
            print("El ID ingresado no corresponde a un profesor disponible.")
            return
    except ValueError:
        print("ID inválido.")
        return

    cantidad_actual = sum(1 for c in cursos if c['profesor_id'] == profesor_id)
    if cantidad_actual >= 2:
        print(f'\033[31m ERROR: \033[0m El profesor ya tiene asignados 2 cursos.')
        return

    nuevoCurso = {
        "id": nuevo_id,
        "nombre": nombre_curso,
        "profesor_id": profesor_id
    }

    with open('cursos.json', 'w', encoding='utf-8') as archivo:
        cursos.append(nuevoCurso)
        json.dump(cursos, archivo, indent=4, ensure_ascii=False)

    print("Curso creado correctamente.")

def eliminarCurso():
    if not os.path.exists('cursos.json'):
        print("No existe el archivo cursos.json")
        return

    with open('cursos.json', 'r', encoding='utf-8') as archivo:
        cursos = json.load(archivo)

    listaCursos()
    try:
        id_eliminar = int(input("Ingrese el ID del curso a eliminar: "))
    except ValueError:
        print("ID inválido.")
        return

    cursos_filtrados = [c for c in cursos if c["id"] != id_eliminar]

    if len(cursos_filtrados) == len(cursos):
        print("No se encontró un curso con ese ID.")
    else:
        with open('cursos.json', 'w', encoding='utf-8') as archivo:
            json.dump(cursos_filtrados, archivo, indent=4, ensure_ascii=False)
        print("Curso eliminado correctamente.")

def verCursosPorProfesor():
    if not os.path.exists('profesores.json') or not os.path.exists('cursos.json'):
        print("No existen los archivos necesarios.")
        return

    with open('profesores.json', 'r', encoding='utf-8') as archivo:
        profesores = json.load(archivo)

    print("\n--- Profesores Registrados ---")
    for p in profesores:
        print(f"ID: {p['id']}, Nombre: {p['nombre']}")

    try:
        id_prof = int(input("Ingrese el ID del profesor que desea consultar: "))
    except ValueError:
        print("ID inválido.")
        return

    profesor = next((p for p in profesores if p['id'] == id_prof), None)
    if not profesor:
        print("Profesor no encontrado.")
        return

    with open('cursos.json', 'r', encoding='utf-8') as archivo:
        cursos = json.load(archivo)

    cursos_profesor = [c for c in cursos if c['profesor_id'] == id_prof]

    print(f"\nCursos asignados al profesor {profesor['nombre']}:")
    if cursos_profesor:
        for c in cursos_profesor:
            print(f"- ID: {c['id']} | Nombre: {c['nombre']}")
    else:
        print("Este profesor no tiene cursos asignados.")

def gestionarCursos():
    while True:
        print("\n------------------- Submenú: Gestión de Cursos -------------------")
        print("1. Listar Cursos")
        print("2. Crear Curso")
        print("3. Eliminar Curso")
        print('4. Ver cursos por profesor')
        print("0. Volver al menú anterior")

        opcion = input('Seleccione una opción: ')

        if opcion == '1':
            listaCursos()
        elif opcion == '2':
            crearCurso()
        elif opcion == '3':
            eliminarCurso()
        elif opcion == '4':
            verCursosPorProfesor()
        elif opcion == '0':
            print("Volviendo al menú anterior...\n")
            break
        else:
            print("Opción inválida.")

def listarPeriodos():
    if not os.path.exists('periodos.json'):
        print('No existe el archivo periodos.json')
        return
    
    with open('periodos.json', 'r', encoding='utf-8') as archivo:
        periodos = json.load(archivo)

    if not periodos:
        print('No hay períodos registrados')
        return
    
    print('\n------------------- Lista de Períodos Académicos -------------------')
    for p in periodos:
        estado = 'Activo' if p.get('activo') else 'Inactivo'
        print(f'ID: {p["id"]}, Nombre: {p["nombre"]} ({estado})')

def crearPeriodo():
    if not os.path.exists('periodos.json'):
        periodos = []
    else:
        with open('periodos.json', 'r', encoding='utf-8') as archivo:
            periodos = json.load(archivo)

    nombre = input('Ingrese el nombre del nuevo período académico (ej: 2025-I): ').strip()

    if not re.match(r'^\d{4}-(I{1,2})$', nombre):
        print('\033[31m ERROR: \033[0m Formato inválido. Use el formato correcto, como 2025-I o 2025-II.')
        return

    if any(p['nombre'] == nombre for p in periodos):
        print('\033[31m ERROR: \033[0m Ya existe un período con ese nombre.')
        return

    nuevoID = max([p['id'] for p in periodos], default=0) + 1
    nuevoPeriodo = {
        'id': nuevoID,
        'nombre': nombre,
        'activo': False
    }

    periodos.append(nuevoPeriodo)

    with open('periodos.json', 'w', encoding='utf-8') as archivo:
        json.dump(periodos, archivo, indent=4, ensure_ascii=False)

    print(f'Período {nombre} creado correctamente.')

def eliminarPeriodo():
    if not os.path.exists('periodos.json'):
        print("No existe el archivo periodos.json")
        return

    with open('periodos.json', 'r', encoding='utf-8') as archivo:
        periodos = json.load(archivo)

    listarPeriodos()
    try:
        idEliminar = int(input("Ingrese el ID del período a eliminar: "))
    except ValueError:
        print("ID inválido.")
        return

    filtrados = [p for p in periodos if p['id'] != idEliminar]

    if len(filtrados) == len(periodos):
        print("No se encontró un período con ese ID.")
    else:
        with open('periodos.json', 'w', encoding='utf-8') as archivo:
            json.dump(filtrados, archivo, indent=4, ensure_ascii=False)
        print("Período eliminado.")

def establecerPeriodoActivo():
    if not os.path.exists('periodos.json'):
        print('No existe el archivo periodos.json')
        return
    
    with open('periodos.json', 'r', encoding='utf-8') as archivo:
        periodos = json.load(archivo)

    listarPeriodos()
    try:
        idActivar = int(input('Ingrese el ID del período que desea establecer como activo: '))
    except ValueError:
        print('\033[31m ERROR: \033[0m ID inválido.')
        return
    
    actualizado = False
    for p in periodos:
        if p['id'] == idActivar:
            p['activo'] = True
            actualizado = True
        else:
            p['activo'] = False

    if actualizado:
        with open('periodos.json', 'w', encoding='utf-8') as archivo:
            json.dump(periodos, archivo, indent=4, ensure_ascii=False)
        print('Período activado correctamente.')
    else:
        print('\033[31m ERROR: \033[0m No se encontró un período con ese ID.')

def confPeriodosAc():
    while True:
        print("\n------------------- Configurar Períodos Académicos -------------------")
        print('1. Listar períodos')
        print('2. Crear períodos')
        print('3. Eliminar períodos')
        print('4. Establecer período activo')
        print('0. Volver al menú anterior')

        opcion = input('Seleccione una opción: ')

        if opcion == '1':
            listarPeriodos()
        elif opcion == '2':
            crearPeriodo()
        elif opcion == '3':
            eliminarPeriodo()
        elif opcion == '4':
            establecerPeriodoActivo()
        elif opcion == '0':
            print('Volviendo al menú anterior...\n')
            break
        else:
            print('Opción inválida')

def menuAdministrador():
    while True:
        periodoActivo = obtenerPeriodoActivo()
        print('------------------- Menú Administrador -------------------')
        print(f'📆 Período activo: {periodoActivo if periodoActivo else "Ninguno"}')
        print('1. Gestionar Usuarios')
        print('2. Gestionar Cursos')
        print('3. Configurar períodos Académicos')
        print('4. Cerrar sesión')
        print('0. Salir del sistema')

        opcion = input('Seleccione una opción: ')

        if opcion == '1':
            gestionarUsuarios()
        elif opcion == '2':
            gestionarCursos()
        elif opcion == '3':
            confPeriodosAc()
        elif opcion == '4':
            confirmar = input('¿Deseas cerrar sesión? (s/n): ').lower()
            if confirmar == 's':
                print('Sesión cerrada. Regresando al login...')
                return False
            else: 
                print('Regresando al menú principal.')
        elif opcion == '0':
            confirmar = input('¿Seguro que deseas salir del sistema completamente? (s/n): ').lower()
            if confirmar == 's':
                print('Saliendo del sistema...')
                return True
            else:
                print("Regresando al menú principal.")
        else:
            print('Opción no válida. Intenta nuevamente.')

def verCalificacionesEstudiante():
    """Ver las calificaciones del estudiantEe actual"""
    if not os.path.exists('calificaciones.json'):
        print('\033[33m⚠️ No existe el archivo de calificaciones.\033[0m')
        print('📝 Creando estructura básica...')
        calificaciones_ejemplo = [
            {
                "id": 1,
                "estudiante_id": 1,
                "curso": "Matemáticas",
                "calificaciones": [
                    {"tipo": "Parcial 1", "nota": 8.5, "fecha": "2025-03-15"},
                    {"tipo": "Taller 1", "nota": 9.0, "fecha": "2025-03-20"},
                    {"tipo": "Parcial 2", "nota": 7.8, "fecha": "2025-04-10"}
                ],
                "promedio": 8.43
            },
            {
                "id": 2,
                "estudiante_id": 1,
                "curso": "Física",
                "calificaciones": [
                    {"tipo": "Laboratorio 1", "nota": 9.2, "fecha": "2025-03-18"},
                    {"tipo": "Quiz 1", "nota": 8.0, "fecha": "2025-03-25"},
                    {"tipo": "Parcial 1", "nota": 8.8, "fecha": "2025-04-05"}
                ],
                "promedio": 8.67
            }
        ]
        with open('calificaciones.json', 'w', encoding='utf-8') as archivo:
            json.dump(calificaciones_ejemplo, archivo, indent=4, ensure_ascii=False)
        print('✅ Archivo de calificaciones creado con datos de ejemplo.')
    
    with open('calificaciones.json', 'r', encoding='utf-8') as archivo:
        calificaciones = json.load(archivo)
    
    # En un sistema real, aquí obtendrás el ID del estudiante logueado
    estudiante_id = 1
    
    calificaciones_estudiante = [c for c in calificaciones if c['estudiante_id'] == estudiante_id]
    
    if not calificaciones_estudiante:
        print('\033[33m📋 No tienes calificaciones registradas aún.\033[0m')
        return
    
    print('\n================= 📊 MIS CALIFICACIONES =================')
    
    total_promedio = 0
    total_cursos = len(calificaciones_estudiante)
    
    for calificacion in calificaciones_estudiante:
        curso = calificacion['curso']
        promedio = calificacion['promedio']
        total_promedio += promedio
        
        print(f'\n📚 {curso.upper()}')
        print('-' * 50)
        print(f'📈 Promedio del curso: {promedio:.2f}')
        print('\n🔸 Detalles de calificaciones:')
        
        for nota in calificacion['calificaciones']:
            fecha = nota['fecha']
            tipo = nota['tipo']
            valor = nota['nota']
            
            # Color según la nota
            if valor >= 9.0:
                color = '\033[32m'  # Verde
                emoji = '🟢'
            elif valor >= 7.0:
                color = '\033[33m'  # Amarillo
                emoji = '🟡'
            else:
                color = '\033[31m'  # Rojo
                emoji = '🔴'
            
            print(f'   {emoji} {tipo}: {color}{valor:.1f}\033[0m ({fecha})')
    
    promedio_general = total_promedio / total_cursos
    print('\n' + '='*60)
    print(f'🎯 PROMEDIO GENERAL: {promedio_general:.2f}')
    
    if promedio_general >= 9.0:
        print('🏆 ¡EXCELENTE RENDIMIENTO!')
    elif promedio_general >= 7.0:
        print('👍 Buen rendimiento, sigue así!')
    else:
        print('📈 Puedes mejorar, ¡no te rindas!')
    
    print('='*60)

def verHorarioEstudiante():
    """Ver el horario académico del estudiante"""
    if not os.path.exists('horarios.json'):
        print('\033[33m⚠️ No existe el archivo de horarios.\033[0m')
        print('📝 Creando horario de ejemplo...')
        horario_ejemplo = [
            {
                "estudiante_id": 1,
                "horario": {
                    "Lunes": [
                        {"hora": "08:00-10:00", "materia": "Matemáticas", "profesor": "Dr. García", "aula": "A-101"},
                        {"hora": "10:15-12:15", "materia": "Física", "profesor": "Dra. López", "aula": "B-205"}
                    ],
                    "Martes": [
                        {"hora": "08:00-10:00", "materia": "Química", "profesor": "Dr. Martínez", "aula": "C-301"},
                        {"hora": "14:00-16:00", "materia": "Historia", "profesor": "Prof. Rodríguez", "aula": "A-205"}
                    ],
                    "Miércoles": [
                        {"hora": "08:00-10:00", "materia": "Matemáticas", "profesor": "Dr. García", "aula": "A-101"},
                        {"hora": "10:15-12:15", "materia": "Inglés", "profesor": "Miss Johnson", "aula": "B-102"}
                    ],
                    "Jueves": [
                        {"hora": "08:00-10:00", "materia": "Física", "profesor": "Dra. López", "aula": "B-205"},
                        {"hora": "14:00-16:00", "materia": "Educación Física", "profesor": "Prof. Morales", "aula": "Gimnasio"}
                    ],
                    "Viernes": [
                        {"hora": "08:00-10:00", "materia": "Química", "profesor": "Dr. Martínez", "aula": "C-301"},
                        {"hora": "10:15-12:15", "materia": "Arte", "profesor": "Prof. Silva", "aula": "A-305"}
                    ]
                }
            }
        ]
        with open('horarios.json', 'w', encoding='utf-8') as archivo:
            json.dump(horario_ejemplo, archivo, indent=4, ensure_ascii=False)
        print('✅ Horario de ejemplo creado.')
    
    with open('horarios.json', 'r', encoding='utf-8') as archivo:
        horarios = json.load(archivo)
    
    estudiante_id = 1
    horario_estudiante = next((h for h in horarios if h['estudiante_id'] == estudiante_id), None)
    
    if not horario_estudiante:
        print('\033[33m📅 No tienes un horario asignado aún.\033[0m')
        return
    
    print('\n================= 📅 MI HORARIO ACADÉMICO =================')
    
    dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    
    for dia in dias:
        print(f'\n📆 {dia.upper()}')
        print('-' * 55)
        
        if dia in horario_estudiante['horario']:
            clases = horario_estudiante['horario'][dia]
            
            if clases:
                for clase in clases:
                    hora = clase['hora']
                    materia = clase['materia']
                    profesor = clase['profesor']
                    aula = clase['aula']
                    
                    print(f'🕐 {hora}')
                    print(f'   📚 {materia}')
                    print(f'   👨‍🏫 {profesor}')
                    print(f'   🏫 {aula}')
                    print()
            else:
                print('   ✨ ¡Día libre!')
        else:
            print('   ✨ ¡Día libre!')
    
    print('='*60)

def gestionarCursosProfesor():
    """Gestión de cursos del profesor"""
    if not os.path.exists('cursos.json'):
        print('\033[33m⚠️ No existe el archivo de cursos.\033[0m')
        return
    
    with open('cursos.json', 'r', encoding='utf-8') as archivo:
        cursos = json.load(archivo)
    
    profesor_id = 1  # En sistema real sería dinámico
    cursos_profesor = [c for c in cursos if c.get('profesor_id') == profesor_id]
    
    if not cursos_profesor:
        print('\033[33m📚 No tienes cursos asignados aún.\033[0m')
        return
    
    print('\n================= 📚 MIS CURSOS =================')
    for i, curso in enumerate(cursos_profesor, 1):
        print(f'{i}. {curso["nombre"]} (ID: {curso["id"]})')
    
    print('\n📊 Estadísticas generales:')
    print(f'   📚 Total de cursos: {len(cursos_profesor)}')
    print(f'   👥 Estudiantes promedio por curso: 25')
    print(f'   📈 Promedio general: 8.2')
    print('='*50)

def configurarPeriodosProfesor():
    """Ver información de períodos para profesor"""
    print('\n📅 INFORMACIÓN DE PERÍODOS ACADÉMICOS')
    print('='*50)
    
    periodo_activo = obtenerPeriodoActivo()
    
    if periodo_activo:
        print(f'📆 Período actual activo: {periodo_activo}')
        print('✅ El período está configurado correctamente.')
    else:
        print('⚠️ No hay un período académico activo.')
        print('📞 Contacta al administrador para activar un período.')
    
    print('\n📊 ESTADÍSTICAS DEL PERÍODO:')
    print('   📚 Cursos activos: 12')
    print('   👥 Estudiantes inscritos: 350')
    print('   👨‍🏫 Profesores activos: 15')
    print('   📅 Días transcurridos: 45')
    print('   📅 Días restantes: 120')

# ============ FUNCIONES AVANZADAS PARA PROFESORES ============

# --- Nombres de archivos JSON ---
ARCHIVO_ESTUDIANTES = 'estudiantes.json'
ARCHIVO_TAREAS = 'tareas.json'

def cargar_datos_json(nombre_archivo):
    """Carga datos desde un archivo JSON. Retorna un diccionario vacío si el archivo no existe."""
    if not os.path.exists(nombre_archivo) or os.stat(nombre_archivo).st_size == 0:
        return {}
    with open(nombre_archivo, 'r', encoding='utf-8') as f:
        return json.load(f)

def guardar_datos_json(datos, nombre_archivo):
    """Guarda datos en un archivo JSON."""
    with open(nombre_archivo, 'w', encoding='utf-8') as f:
        json.dump(datos, f, indent=4, ensure_ascii=False)
    print(f"✅ Datos guardados en '{nombre_archivo}'.")

# --- Gestión de Materias ---
def crear_materia_y_cupos(datos_estudiantes):
    """Permite al profesor crear una nueva materia y asignarle un límite de cupos."""
    print("\n================= 📚 CREAR NUEVA MATERIA =================")
    
    while True:
        nombre_materia = input("📝 Ingrese el nombre de la nueva materia: ").strip()
        if not nombre_materia:
            print("❌ El nombre de la materia no puede estar vacío.")
        elif not nombre_materia.replace(" ", "").isalpha():
            print("❌ El nombre de la materia solo puede contener letras.")
        else:
            break
            
    if nombre_materia.lower() in datos_estudiantes.get("materias", {}):
        print(f"❌ La materia '{nombre_materia.capitalize()}' ya existe.")
        return
        
    while True:
        try:
            cupos = int(input("👥 Ingrese el número de cupos disponibles: "))
            if cupos <= 0:
                print("❌ El número de cupos debe ser mayor a 0.")
            else:
                break
        except ValueError:
            print("❌ Por favor, ingrese un número válido.")
            
    if "materias" not in datos_estudiantes:
        datos_estudiantes["materias"] = {}
        
    datos_estudiantes["materias"][nombre_materia.lower()] = {
        "cupos_disponibles": cupos,
        "estudiantes_inscritos": [],
        "total_sesiones": 0
    }
    
    guardar_datos_json(datos_estudiantes, ARCHIVO_ESTUDIANTES)
    print(f"✅ Materia '{nombre_materia.capitalize()}' creada con {cupos} cupos.")

def ver_materias_disponibles_global(datos_estudiantes):
    """Muestra una lista de todas las materias disponibles y sus cupos."""
    print("\n================= 📋 TODAS LAS MATERIAS DISPONIBLES =================")
    
    materias = datos_estudiantes.get("materias", {})
    if not materias:
        print("⚠️ No hay materias creadas aún.")
        return
        
    print(f"{'Materia':<20} {'Cupos Usados':<15} {'Cupos Totales':<15} {'Sesiones':<10}")
    print("-" * 70)
    
    for nombre, info in materias.items():
        cupos_usados = len(info.get("estudiantes_inscritos", []))
        cupos_totales = info.get("cupos_disponibles", 0)
        sesiones = info.get('total_sesiones', 0)
        
        print(f"{nombre.capitalize():<20} {cupos_usados:<15} {cupos_totales:<15} {sesiones:<10}")

def inscribir_estudiante_en_materia(datos_estudiantes):
    """Permite inscribir un estudiante existente en una materia."""
    print("\n================= 👥 INSCRIBIR ESTUDIANTE EN MATERIA =================")
    
    estudiantes = datos_estudiantes.get("estudiantes", [])
    materias = datos_estudiantes.get("materias", {})

    if not estudiantes:
        print("⚠️ No hay estudiantes registrados para inscribir.")
        return
    if not materias:
        print("⚠️ No hay materias creadas para inscribir estudiantes.")
        return

    # Listar estudiantes
    print("\n👥 Estudiantes disponibles:")
    print(f"{'Nº':<3} {'Nombre':<25} {'ID':<10}")
    print("-" * 40)
    for i, est in enumerate(estudiantes, 1):
        print(f"{i:<3} {est['nombre']:<25} {est['id']:<10}")
    
    while True:
        try:
            opcion_est = int(input("\n🔢 Elige el número del estudiante a inscribir: "))
            if 1 <= opcion_est <= len(estudiantes):
                estudiante_seleccionado = estudiantes[opcion_est - 1]
                break
            else:
                print("❌ Opción no válida.")
        except ValueError:
            print("❌ Entrada inválida. Ingresa un número.")

    # Listar materias
    print("\n📚 Materias disponibles:")
    lista_materias = list(materias.keys())
    print(f"{'Nº':<3} {'Materia':<25} {'Cupos Restantes':<15}")
    print("-" * 45)
    
    for i, mat_nombre in enumerate(lista_materias, 1):
        cupos_restantes = materias[mat_nombre].get('cupos_disponibles', 0) - len(materias[mat_nombre].get('estudiantes_inscritos', []))
        print(f"{i:<3} {mat_nombre.capitalize():<25} {cupos_restantes:<15}")
    
    while True:
        try:
            opcion_mat = int(input("\n🔢 Elige el número de la materia para inscribir: "))
            if 1 <= opcion_mat <= len(lista_materias):
                materia_seleccionada = lista_materias[opcion_mat - 1]
                break
            else:
                print("❌ Opción no válida.")
        except ValueError:
            print("❌ Entrada inválida. Ingresa un número.")

    # Realizar la inscripción
    materia_info = materias[materia_seleccionada]
    estudiante_id = estudiante_seleccionado['id']

    if estudiante_id in materia_info.get("estudiantes_inscritos", []):
        print(f"⚠️ El estudiante {estudiante_seleccionado['nombre']} ya está inscrito en {materia_seleccionada.capitalize()}.")
        return

    if len(materia_info.get("estudiantes_inscritos", [])) >= materia_info.get("cupos_disponibles", 0):
        print(f"❌ No hay cupos disponibles en {materia_seleccionada.capitalize()}.")
        return

    # Añadir estudiante a la materia
    materia_info.get("estudiantes_inscritos", []).append(estudiante_id)
    
    # Inicializar datos del estudiante para esa materia
    if "materias_inscritas" not in estudiante_seleccionado:
        estudiante_seleccionado["materias_inscritas"] = {}
    estudiante_seleccionado["materias_inscritas"][materia_seleccionada] = {
        "asistencia": 0, 
        "calificaciones": {}
    }

    guardar_datos_json(datos_estudiantes, ARCHIVO_ESTUDIANTES)
    print(f"✅ Estudiante {estudiante_seleccionado['nombre']} inscrito en {materia_seleccionada.capitalize()} con éxito.")

# --- Gestión de Estudiantes (CRUD) ---
def registrar_estudiante(datos_estudiantes):
    """Permite registrar un nuevo estudiante en el sistema."""
    print("\n================= 👤 REGISTRAR NUEVO ESTUDIANTE =================")
    
    if "estudiantes" not in datos_estudiantes:
        datos_estudiantes["estudiantes"] = []
    
    estudiantes = datos_estudiantes["estudiantes"]
    
    nombre = input("📝 Ingrese el nombre completo del nuevo estudiante: ").strip()
    if not nombre:
        print("❌ El nombre no puede estar vacío.")
        return
        
    id_estudiante = input("🆔 Ingrese el ID del estudiante (ej. A101): ").strip()
    if not id_estudiante:
        print("❌ El ID no puede estar vacío.")
        return
    
    for estudiante in estudiantes:
        if estudiante["id"] == id_estudiante:
            print(f"❌ Ya existe un estudiante con el ID '{id_estudiante}'.")
            return
            
    nuevo_estudiante = {
        "nombre": nombre,
        "id": id_estudiante,
        "materias_inscritas": {}
    }
    
    estudiantes.append(nuevo_estudiante)
    guardar_datos_json(datos_estudiantes, ARCHIVO_ESTUDIANTES)
    print("✅ Estudiante registrado con éxito.")

def listar_estudiantes(datos_estudiantes):
    """Muestra la lista completa de estudiantes."""
    print("\n================= 👥 LISTA DE ESTUDIANTES =================")
    
    estudiantes = datos_estudiantes.get("estudiantes", [])
    if not estudiantes:
        print("⚠️ No hay estudiantes registrados.")
        return
        
    print(f"{'ID':<10} {'Nombre':<25} {'Materias Inscritas':<30}")
    print("-" * 70)
    
    for estudiante in estudiantes:
        materias_str = ", ".join([m.capitalize() for m in estudiante.get("materias_inscritas", {}).keys()])
        print(f"{estudiante['id']:<10} {estudiante['nombre']:<25} {materias_str if materias_str else 'Ninguna':<30}")

def actualizar_estudiante(datos_estudiantes):
    """Permite actualizar la información de un estudiante existente."""
    print("\n================= ✏️ ACTUALIZAR ESTUDIANTE =================")
    listar_estudiantes(datos_estudiantes)
    
    id_estudiante = input("\n🆔 Ingrese el ID del estudiante a actualizar: ").strip()
    
    estudiantes = datos_estudiantes.get("estudiantes", [])
    estudiante_encontrado = None
    for estudiante in estudiantes:
        if estudiante["id"] == id_estudiante:
            estudiante_encontrado = estudiante
            break
    
    if not estudiante_encontrado:
        print(f"❌ No se encontró un estudiante con el ID '{id_estudiante}'.")
        return
        
    print(f"📋 Estudiante encontrado: {estudiante_encontrado['nombre']}")
    nuevo_nombre = input("📝 Ingrese el nuevo nombre (deje en blanco para no cambiar): ").strip()
    
    if nuevo_nombre:
        estudiante_encontrado["nombre"] = nuevo_nombre
        guardar_datos_json(datos_estudiantes, ARCHIVO_ESTUDIANTES)
        print("✅ Estudiante actualizado con éxito.")
    else:
        print("ℹ️ No se realizaron cambios.")

def eliminar_estudiante(datos_estudiantes):
    """Permite eliminar un estudiante del sistema."""
    print("\n================= 🗑️ ELIMINAR ESTUDIANTE =================")
    listar_estudiantes(datos_estudiantes)
    
    id_estudiante = input("\n🆔 Ingrese el ID del estudiante a eliminar: ").strip()
    
    estudiantes = datos_estudiantes.get("estudiantes", [])
    estudiante_a_eliminar = None
    indice_a_eliminar = -1
    
    for i, estudiante in enumerate(estudiantes):
        if estudiante["id"] == id_estudiante:
            estudiante_a_eliminar = estudiante
            indice_a_eliminar = i
            break
    
    if not estudiante_a_eliminar:
        print(f"❌ No se encontró un estudiante con el ID '{id_estudiante}'.")
        return
    
    confirmar = input(f"⚠️ ¿Está seguro de eliminar a '{estudiante_a_eliminar['nombre']}'? (s/n): ").lower()
    if confirmar != 's':
        print("❌ Operación cancelada.")
        return
        
    # Eliminar al estudiante de todas las materias
    materias = datos_estudiantes.get("materias", {})
    for materia_nombre, materia_info in materias.items():
        if estudiante_a_eliminar['id'] in materia_info.get("estudiantes_inscritos", []):
            materia_info["estudiantes_inscritos"].remove(estudiante_a_eliminar['id'])

    # Eliminar de la lista principal
    if indice_a_eliminar != -1:
        del estudiantes[indice_a_eliminar]
    
    guardar_datos_json(datos_estudiantes, ARCHIVO_ESTUDIANTES)
    print(f"✅ Estudiante '{estudiante_a_eliminar['nombre']}' eliminado con éxito.")

# --- Funciones específicas por materia ---
def tomar_asistencia(datos_estudiantes, materia_seleccionada):
    """Permite al profesor tomar asistencia a los estudiantes de una materia específica."""
    print(f"\n================= ✅ TOMAR ASISTENCIA - {materia_seleccionada.upper()} =================")
    
    materias_data = datos_estudiantes.get("materias", {})
    if materia_seleccionada not in materias_data:
        print(f"❌ La materia '{materia_seleccionada.capitalize()}' no existe.")
        return

    materia_info = materias_data[materia_seleccionada]
    materia_info['total_sesiones'] = materia_info.get('total_sesiones', 0) + 1
    
    estudiantes_inscritos_ids = materia_info.get("estudiantes_inscritos", [])
    
    if not estudiantes_inscritos_ids:
        print(f"⚠️ No hay estudiantes inscritos en {materia_seleccionada.capitalize()}.")
        return

    todos_estudiantes = datos_estudiantes.get("estudiantes", [])
    estudiantes_en_materia = [e for e in todos_estudiantes if e['id'] in estudiantes_inscritos_ids]

    print(f"📅 Sesión #{materia_info['total_sesiones']} - {datetime.now().strftime('%Y-%m-%d')}")
    print(f"👥 Total de estudiantes: {len(estudiantes_en_materia)}")
    print("-" * 60)

    for estudiante in estudiantes_en_materia:
        if "materias_inscritas" not in estudiante:
            estudiante["materias_inscritas"] = {}
        if materia_seleccionada not in estudiante["materias_inscritas"]:
            estudiante["materias_inscritas"][materia_seleccionada] = {"asistencia": 0, "calificaciones": {}}

        while True:
            respuesta = input(f"👤 ¿{estudiante['nombre']} está presente? (s/n): ").lower()
            
            if respuesta == 's':
                estudiante['materias_inscritas'][materia_seleccionada]['asistencia'] += 1
                print("✅ Presente")
                break
            elif respuesta == 'n':
                print("❌ Ausente")
                break
            else:
                print("❌ Por favo5r ingrese 's' para presente o 'n' para ausente.")
    
    guardar_datos_json(datos_estudiantes, ARCHIVO_ESTUDIANTES)
    print("\n✅ Asistencia registrada y guardada.")

def enviar_tarea(tareas, materia):
    """Permite al profesor crear y enviar una nueva tarea para una materia específica."""
    print(f"\n================= 📝 ENVIAR NUEVA TAREA - {materia.upper()} =================")
    
    titulo = input("📋 Ingrese el título de la tarea: ").strip()
    if not titulo:
        print("❌ El título no puede estar vacío.")
        return
        
    descripcion = input("📄 Ingrese la descripción: ").strip()
    if not descripcion:
        print("❌ La descripción no puede estar vacía.")
        return
    
    while True:
        fecha_limite = input("📅 Ingrese la fecha límite (YYYY-MM-DD): ").strip()
        try:
            datetime.strptime(fecha_limite, '%Y-%m-%d')
            break
        except ValueError:
            print("❌ Por favor, ingrese la fecha en el formato correcto (YYYY-MM-DD).")
    
    nueva_tarea = {
        "titulo": titulo,
        "descripcion": descripcion,
        "fecha_limite": fecha_limite,
        "fecha_creacion": datetime.now().strftime('%Y-%m-%d %H:%M')
    }
    
    if materia not in tareas:
        tareas[materia] = []
        
    tareas[materia].append(nueva_tarea)
    guardar_datos_json(tareas, ARCHIVO_TAREAS)
    print("✅ Tarea enviada con éxito.")

def ver_reporte_asistencia(datos_estudiantes, materia_seleccionada):
    """Genera y muestra un reporte de asistencia de los estudiantes de una materia específica."""
    print(f"\n================= 📊 REPORTE DE ASISTENCIA - {materia_seleccionada.upper()} =================")
    
    materias = datos_estudiantes.get("materias", {})
    if materia_seleccionada not in materias:
        print(f"❌ La materia '{materia_seleccionada.capitalize()}' no existe.")
        return
        
    materia_info = materias[materia_seleccionada]
    total_sesiones_materia = materia_info.get("total_sesiones", 0)
    estudiantes_inscritos_ids = materia_info.get("estudiantes_inscritos", [])

    if not estudiantes_inscritos_ids or total_sesiones_materia == 0:
        print(f"⚠️ No hay asistencia registrada o estudiantes en {materia_seleccionada.capitalize()}.")
        return
    
    todos_estudiantes = datos_estudiantes.get("estudiantes", [])
    estudiantes_en_materia = [e for e in todos_estudiantes if e['id'] in estudiantes_inscritos_ids]

    print(f"📅 Total de sesiones realizadas: {total_sesiones_materia}")
    print(f"👥 Total de estudiantes inscritos: {len(estudiantes_en_materia)}")
    print("-" * 80)
    print(f"{'Estudiante':<25} {'Asistencias':<15} {'Porcentaje':<15} {'Estado':<10}")
    print("-" * 80)

    for estudiante in estudiantes_en_materia:
        asistencias = estudiante.get("materias_inscritas", {}).get(materia_seleccionada, {}).get("asistencia", 0)
        porcentaje = (asistencias / total_sesiones_materia) * 100 if total_sesiones_materia > 0 else 0
        
        if porcentaje >= 80:
            estado = "✅ Excelente"
        elif porcentaje >= 70:
            estado = "⚠️ Bueno"
        elif porcentaje >= 60:
            estado = "🔶 Regular"
        else:
            estado = "❌ Crítico"
        
        print(f"{estudiante['nombre']:<25} {asistencias}/{total_sesiones_materia:<15} {porcentaje:.1f}%{'':<10} {estado:<10}")

def ver_tareas_asignadas_materia(tareas, materia_seleccionada):
    """Muestra las tareas asignadas para una materia específica."""
    print(f"\n================= 📋 TAREAS ASIGNADAS - {materia_seleccionada.upper()} =================")
    
    if materia_seleccionada not in tareas or not tareas[materia_seleccionada]:
        print(f"⚠️ No hay tareas asignadas para {materia_seleccionada.capitalize()}.")
        return
        
    lista_tareas = tareas[materia_seleccionada]
    
    print(f"📊 Total de tareas: {len(lista_tareas)}")
    print("-" * 90)
    print(f"{'#':<3} {'Título':<25} {'Descripción':<35} {'Fecha Límite':<15} {'Creada':<15}")
    print("-" * 90)

    for i, tarea in enumerate(lista_tareas, 1):
        fecha_creacion = tarea.get('fecha_creacion', 'N/A')
        print(f"{i:<3} {tarea['titulo']:<25} {tarea['descripcion'][:30]+'...' if len(tarea['descripcion']) > 30 else tarea['descripcion']:<35} {tarea['fecha_limite']:<15} {fecha_creacion:<15}")

# ============ MENÚ PRINCIPAL DEL PROFESOR (FUNCIÓN PRINCIPAL) ============
def menuProfesor():
    """Función principal del menú del profesor con funcionalidades avanzadas."""
    
    # Cargar datos
    datos_estudiantes = cargar_datos_json(ARCHIVO_ESTUDIANTES)
    tareas = cargar_datos_json(ARCHIVO_TAREAS)

    # Inicialización de datos si están vacíos
    if not datos_estudiantes or not datos_estudiantes.get("estudiantes") or not datos_estudiantes.get("materias"):
        datos_estudiantes = {
            "estudiantes": [],
            "materias": {}
        }
        guardar_datos_json(datos_estudiantes, ARCHIVO_ESTUDIANTES)
    
    if not tareas:
        tareas = {}
        guardar_datos_json(tareas, ARCHIVO_TAREAS)

    while True:
        print("\n================= 👨‍🏫 MENÚ PRINCIPAL DEL PROFESOR =================")
        print("1. 🎯 Gestionar una Materia Específica")
        print("2. 👥 Gestión de Estudiantes (CRUD)")
        print("3. 📚 Gestión Global de Materias")
        print("4. 📋 Ver Todas las Tareas Asignadas")
        print("5. 📅 Ver información de períodos académicos")
        print("0. 🚪 Cerrar sesión")
        print("="*70)
        
        opcion = input('🔢 Seleccione una opción: ')
        
        if opcion == '1':
            menu_seleccion_materia_para_gestion(datos_estudiantes, tareas)
        elif opcion == '2':
            menu_gestion_estudiantes(datos_estudiantes)
        elif opcion == '3':
            menu_gestion_global_materias(datos_estudiantes)
        elif opcion == '4':
            ver_todas_tareas_global(tareas)
        elif opcion == '5':
            configurarPeriodosProfesor()
        elif opcion == '0':
            confirmar = input('¿Deseas cerrar sesión? (s/n): ').lower()
            if confirmar == 's':
                print('✅ Sesión cerrada. Regresando al login...')
                return False
        else:
            print("❌ Opción no válida.")

def menuAdministrativo():
    """Menú principal del personal administrativo."""
    while True:
        print("\n================= 👔 MENÚ ADMINISTRATIVO =================")
        print("1. 👥 Gestionar estudiantes")
        print("2. 📅 Gestionar horarios")
        print("3. 📊 Consultar reportes")
        print("4. 📋 Estadísticas generales")
        print("0. 🚪 Cerrar sesión")
        print("="*60)
        
        opcion = input('Seleccione una opción: ')
        
        if opcion == '1':
            print("👥 Funcionalidad de gestión de estudiantes en desarrollo...")
            input("📥 Presione Enter para continuar...")
        elif opcion == '2':
            print("📅 Funcionalidad de gestión de horarios en desarrollo...")
            input("📥 Presione Enter para continuar...")
        elif opcion == '3':
            print("📊 Funcionalidad de reportes en desarrollo...")
            input("📥 Presione Enter para continuar...")
        elif opcion == '4':
            print("📋 Funcionalidad de estadísticas en desarrollo...")
            input("📥 Presione Enter para continuar...")
        elif opcion == '0':
            confirmar = input('¿Deseas cerrar sesión? (s/n): ').lower()
            if confirmar == 's':
                print('✅ Sesión cerrada. Regresando al login...')
                return False
        else:
            print("\033[31m❌ Opción no válida.\033[0m")
            input("📥 Presione Enter para continuar...")

# --- Menús del Profesor ---
def menu_gestion_estudiantes(datos_estudiantes):
    """Menú para las operaciones CRUD de estudiantes."""
    while True:
        print("\n================= 👥 GESTIÓN DE ESTUDIANTES =================")
        print("1. 👤 Registrar nuevo estudiante")
        print("2. 📋 Listar todos los estudiantes")
        print("3. ✏️ Actualizar estudiante")
        print("4. 🗑️ Eliminar estudiante")
        print("0. ⬅️ Volver al menú principal")
        print("="*65)
        
        opcion = input('🔢 Seleccione una opción: ')
        
        if opcion == '1':
            registrar_estudiante(datos_estudiantes)
        elif opcion == '2':
            listar_estudiantes(datos_estudiantes)
        elif opcion == '3':
            actualizar_estudiante(datos_estudiantes)
        elif opcion == '4':
            eliminar_estudiante(datos_estudiantes)
        elif opcion == '0':
            break
        else:
            print("❌ Opción no válida.")

def menu_gestion_global_materias(datos_estudiantes):
    """Menú para la gestión global de materias."""
    while True:
        print("\n================= 📚 GESTIÓN GLOBAL DE MATERIAS =================")
        print("1. 🆕 Crear nueva materia y asignar cupos")
        print("2. 📋 Ver todas las materias disponibles y cupos")
        print("3. 👥 Inscribir estudiante en materia")
        print("0. ⬅️ Volver al menú principal")
        print("="*70)
        
        opcion = input('🔢 Seleccione una opción: ')
        
        if opcion == '1':
            crear_materia_y_cupos(datos_estudiantes)
        elif opcion == '2':
            ver_materias_disponibles_global(datos_estudiantes)
        elif opcion == '3':
            inscribir_estudiante_en_materia(datos_estudiantes)
        elif opcion == '0':
            break
        else:
            print("❌ Opción no válida.")

def menu_materia_especifica(datos_estudiantes, tareas, materia_seleccionada):
    """Menú para gestionar acciones específicas de una materia."""
    while True:
        print(f"\n================= 📚 GESTIÓN DE: {materia_seleccionada.upper()} =================")
        print("1. ✅ Tomar asistencia")
        print("2. 📝 Enviar nueva tarea")
        print("3. 📊 Ver reporte de asistencia")
        print("4. 📋 Ver tareas asignadas")
        print("5. 📈 Calificar tareas")
        print("6. 👀 Ver calificaciones de estudiantes")
        print("0. ⬅️ Volver a seleccionar otra materia")
        print("="*70)
        
        opcion = input('🔢 Seleccione una opción: ')
        
        if opcion == '1':
            tomar_asistencia(datos_estudiantes, materia_seleccionada)
        elif opcion == '2':
            enviar_tarea(tareas, materia_seleccionada)
        elif opcion == '3':
            ver_reporte_asistencia(datos_estudiantes, materia_seleccionada)
        elif opcion == '4':
            ver_tareas_asignadas_materia(tareas, materia_seleccionada)
        elif opcion == '5':
            print("🔄 Funcionalidad de calificar tareas en desarrollo...")
        elif opcion == '6':
            print("🔄 Funcionalidad de ver calificaciones en desarrollo...")
        elif opcion == '0':
            break
        else:
            print("❌ Opción no válida.")

def menu_seleccion_materia_para_gestion(datos_estudiantes, tareas):
    """Permite al profesor seleccionar una materia para gestionar."""
    while True:
        print("\n================= 🎯 SELECCIONAR MATERIA A GESTIONAR =================")
        
        materias = datos_estudiantes.get("materias", {})
        if not materias:
            print("⚠️ No hay materias creadas. Cree una primero en 'Gestión Global de Materias'.")
            input("📥 Presione Enter para continuar...")
            return
            
        lista_materias = list(materias.keys())
        
        print("📚 Materias disponibles:")
        for i, nombre in enumerate(lista_materias, 1):
            info = materias[nombre]
            estudiantes_count = len(info.get("estudiantes_inscritos", []))
            sesiones = info.get("total_sesiones", 0)
            print(f"   {i}. {nombre.capitalize()} ({estudiantes_count} estudiantes, {sesiones} sesiones)")
        
        print("   0. ⬅️ Volver al Menú Principal")
        print("="*75)
            
        opcion = input('🔢 Seleccione una materia (número) o 0 para volver: ')
        
        if opcion == '0':
            break
        
        try:
            opcion_num = int(opcion)
            if 1 <= opcion_num <= len(lista_materias):
                materia_seleccionada = lista_materias[opcion_num - 1]
                menu_materia_especifica(datos_estudiantes, tareas, materia_seleccionada)
            else:
                print("❌ Opción no válida.")
        except ValueError:
            print("❌ Por favor ingrese un número válido.")

def ver_todas_tareas_global(tareas):
    """Muestra todas las tareas asignadas en todas las materias."""
    print("\n================= 📋 TODAS LAS TAREAS ASIGNADAS =================")
    
    if not tareas:
        print("⚠️ No hay tareas asignadas en ninguna materia.")
        return
    
    hay_tareas = False
    total_tareas = 0
    
    for materia, lista_tareas in tareas.items():
        if lista_tareas:
            if not hay_tareas:
                print(f"{'Materia':<20} {'Título':<25} {'Descripción':<35} {'Fecha Límite':<15}")
                print("-" * 95)
                hay_tareas = True
            
            for tarea in lista_tareas:
                desc_corta = tarea['descripcion'][:30] + "..." if len(tarea['descripcion']) > 30 else tarea['descripcion']
                print(f"{materia.capitalize():<20} {tarea['titulo']:<25} {desc_corta:<35} {tarea['fecha_limite']:<15}")
                total_tareas += 1
    
    if hay_tareas:
        print("-" * 95)
        print(f"📊 Total de tareas: {total_tareas}")
    else:
        print("⚠️ No hay tareas asignadas en ninguna materia.")

# ============ FUNCIONES AVANZADAS PARA ESTUDIANTES ============

def cargar_datos_estudiante(nombre_archivo):
    """Carga datos desde un archivo JSON específico para estudiantes."""
    if not os.path.exists(nombre_archivo) or os.stat(nombre_archivo).st_size == 0:
        return {}
    with open(nombre_archivo, 'r', encoding='utf-8') as f:
        return json.load(f)

def guardar_datos_estudiante(datos, nombre_archivo):
    """Guarda datos en un archivo JSON específico para estudiantes."""
    with open(nombre_archivo, 'w', encoding='utf-8') as f:
        json.dump(datos, f, indent=4, ensure_ascii=False)

# 1. Ver materias inscritas
def ver_mis_materias():
    """Ver las materias en las que está inscrito el estudiante."""
    datos = cargar_datos_estudiante(ARCHIVO_ESTUDIANTES)
    
    # En un sistema real, obtendrías el ID del estudiante logueado
    est_id = input("🆔 Ingrese su ID de estudiante: ").strip()
    
    estudiante = None
    for e in datos.get("estudiantes", []):
        if e['id'] == est_id:
            estudiante = e
            break
    
    if not estudiante:
        print("❌ Estudiante no encontrado.")
        return
    
    materias = estudiante.get("materias_inscritas", {})
    if not materias:
        print("⚠️ No estás inscrito en ninguna materia.")
        return
    
    print("\n================= 📚 MIS MATERIAS INSCRITAS =================")
    print(f"👤 Estudiante: {estudiante['nombre']}")
    print("-" * 60)
    
    for i, materia in enumerate(materias, 1):
        info = materias[materia]
        asistencias = info.get("asistencia", 0)
        total_calificaciones = len(info.get("calificaciones", {}))
        
        print(f"{i}. 📖 {materia.capitalize()}")
        print(f"   📊 Asistencias: {asistencias}")
        print(f"   📝 Calificaciones: {total_calificaciones}")
        print()
    
    print(f"📊 Total de materias: {len(materias)}")
    print("=" * 60)

# 2. Ver material de estudio
def ver_material_estudio():
    """Ver material de estudio disponible por materia."""
    datos = cargar_datos_estudiante(ARCHIVO_ESTUDIANTES)
    
    est_id = input("🆔 Ingrese su ID de estudiante: ").strip()
    
    estudiante = None
    for e in datos.get("estudiantes", []):
        if e['id'] == est_id:
            estudiante = e
            break
    
    if not estudiante:
        print("❌ Estudiante no encontrado.")
        return
    
    materias = estudiante.get("materias_inscritas", {})
    
    print("\n================= 📚 MATERIAL DE ESTUDIO =================")
    
    if not materias:
        print("⚠️ No estás inscrito en ninguna materia.")
        return
    
    for materia in materias:
        print(f"\n📖 {materia.upper()}")
        print("-" * 50)
        print("📄 Material disponible:")
        
        # Material simulado por materia
        materiales = {
            "matematicas": [
                "📘 Álgebra_Básica.pdf",
                "📊 Presentación_Ecuaciones.pptx", 
                "🎥 Video_Funciones.mp4",
                "📝 Ejercicios_Práctica.docx"
            ],
            "fisica": [
                "📗 Mecánica_Clásica.pdf",
                "⚗️ Laboratorio_Movimiento.pdf",
                "📊 Gráficas_Cinemática.pptx",
                "🧮 Calculadora_Física.xlsx"
            ],
            "quimica": [
                "📙 Tabla_Periódica.pdf",
                "⚗️ Experimentos_Básicos.pdf",
                "📊 Reacciones_Químicas.pptx",
                "📝 Formulario_Química.docx"
            ]
        }
        
        material_materia = materiales.get(materia.lower(), [
            "📄 Documento_Clase1.pdf",
            "📊 Presentación_Tema1.pptx",
            "📝 Guía_Estudio.docx"
        ])
        
        for material in material_materia:
            print(f"   {material}")
    
    print("\n💡 Tip: Descarga el material antes de cada clase.")
    print("=" * 60)

# 3. Ver horario personal
def ver_mi_horario():
    """Ver el horario personalizado del estudiante."""
    datos = cargar_datos_estudiante(ARCHIVO_ESTUDIANTES)
    
    est_id = input("🆔 Ingrese su ID de estudiante: ").strip()
    
    estudiante = None
    for e in datos.get("estudiantes", []):
        if e['id'] == est_id:
            estudiante = e
            break
    
    if not estudiante:
        print("❌ Estudiante no encontrado.")
        return
    
    materias = list(estudiante.get("materias_inscritas", {}).keys())
    
    print("\n================= 📅 MI HORARIO DE CLASES =================")
    print(f"👤 Estudiante: {estudiante['nombre']}")
    print("-" * 70)
    
    if not materias:
        print("⚠️ No tienes materias inscritas para mostrar horario.")
        return
    
    # Horario simulado basado en las materias del estudiante
    dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    horas = ["08:00-10:00", "10:15-12:15", "14:00-16:00"]
    
    for i, dia in enumerate(dias):
        print(f"\n📆 {dia.upper()}")
        print("-" * 40)
        
        if i < len(materias):
            materia = materias[i]
            hora = horas[i % len(horas)]
            aula = f"A-{100 + i + 1}"
            
            print(f"🕐 {hora}")
            print(f"📚 {materia.capitalize()}")
            print(f"🏫 Aula: {aula}")
            print(f"👨‍🏫 Prof. García")  # Profesor simulado
        else:
            print("✨ ¡Día libre!")
    
    print("\n📊 Resumen:")
    print(f"   📚 Total materias: {len(materias)}")
    print(f"   🕐 Horas semanales: {len(materias) * 2}")
    print("=" * 70)

# 4. Ver tareas asignadas detalladas
def ver_mis_tareas():
    """Ver todas las tareas asignadas en mis materias."""
    datos = cargar_datos_estudiante(ARCHIVO_ESTUDIANTES)
    tareas = cargar_datos_estudiante(ARCHIVO_TAREAS)
    
    est_id = input("🆔 Ingrese su ID de estudiante: ").strip()
    
    estudiante = None
    for e in datos.get("estudiantes", []):
        if e['id'] == est_id:
            estudiante = e
            break
    
    if not estudiante:
        print("❌ Estudiante no encontrado.")
        return
    
    materias = estudiante.get("materias_inscritas", {})
    
    print("\n================= 📝 MIS TAREAS ASIGNADAS =================")
    print(f"👤 Estudiante: {estudiante['nombre']}")
    print("-" * 80)
    
    if not materias:
        print("⚠️ No estás inscrito en ninguna materia.")
        return
    
    total_tareas = 0
    tareas_pendientes = 0
    
    for materia in materias:
        if materia in tareas and tareas[materia]:
            print(f"\n📚 {materia.upper()}")
            print("-" * 60)
            print(f"{'#':<3} {'Título':<20} {'Descripción':<25} {'Fecha Límite':<12} {'Estado':<10}")
            print("-" * 60)
            
            for i, tarea in enumerate(tareas[materia], 1):
                titulo = tarea['titulo']
                descripcion = tarea['descripcion'][:22] + "..." if len(tarea['descripcion']) > 22 else tarea['descripcion']
                fecha_limite = tarea['fecha_limite']
                
                # Verificar si está entregada
                entregas = materias[materia].get("entregas", {})
                estado = "✅ Entregada" if titulo in entregas else "⏳ Pendiente"
                
                if titulo not in entregas:
                    tareas_pendientes += 1
                
                print(f"{i:<3} {titulo:<20} {descripcion:<25} {fecha_limite:<12} {estado:<10}")
                total_tareas += 1
        else:
            print(f"\n📚 {materia.upper()}: ✨ No hay tareas asignadas")
    
    print("\n📊 RESUMEN:")
    print(f"   📝 Total de tareas: {total_tareas}")
    print(f"   ⏳ Pendientes: {tareas_pendientes}")
    print(f"   ✅ Entregadas: {total_tareas - tareas_pendientes}")
    print("=" * 80)

# 5. Entregar tarea
def entregar_tarea():
    """Marcar una tarea como entregada."""
    datos = cargar_datos_estudiante(ARCHIVO_ESTUDIANTES)
    
    est_id = input("🆔 Ingrese su ID de estudiante: ").strip()
    
    estudiante = None
    estudiante_index = -1
    for i, e in enumerate(datos.get("estudiantes", [])):
        if e['id'] == est_id:
            estudiante = e
           
            estudiante_index = i
            break
    
    if not estudiante:
        print("❌ Estudiante no encontrado.")
        return
    
    materias = estudiante.get("materias_inscritas", {})
    
    print("\n================= 📤 ENTREGAR TAREA =================")
    
    if not materias:
        print("⚠️ No estás inscrito en ninguna materia.")
        return
    
    # Mostrar materias disponibles
    print("📚 Tus materias:")
    lista_materias = list(materias.keys())
    for i, materia in enumerate(lista_materias, 1):
        print(f"   {i}. {materia.capitalize()}")
    
    try:
        opcion = int(input("\n🔢 Selecciona el número de la materia: "))
        if 1 <= opcion <= len(lista_materias):
            materia_seleccionada = lista_materias[opcion - 1]
        else:
            print("❌ Opción no válida.")
            return
    except ValueError:
        print("❌ Entrada inválida.")
        return
    
    titulo_tarea = input("📝 Ingrese el título de la tarea a entregar: ").strip()
    if not titulo_tarea:
        print("❌ El título no puede estar vacío.")
        return
    
    # Inicializar entregas si no existe
    if "entregas" not in materias[materia_seleccionada]:
        materias[materia_seleccionada]["entregas"] = {}
    
    # Marcar como entregada
    hoy = datetime.now().strftime('%Y-%m-%d %H:%M')
    materias[materia_seleccionada]["entregas"][titulo_tarea] = {
        "fecha_entrega": hoy,
        "estado": "Entregada"
    }
    
    # Actualizar en el archivo
    datos["estudiantes"][estudiante_index] = estudiante
    guardar_datos_estudiante(datos, ARCHIVO_ESTUDIANTES)
    
    print(f"✅ Tarea '{titulo_tarea}' marcada como entregada en {materia_seleccionada.capitalize()}.")
    print(f"📅 Fecha de entrega: {hoy}")

# 6. Ver calificaciones detalladas
def ver_mis_calificaciones_detalladas():
    """Ver calificaciones detalladas por materia."""
    datos = cargar_datos_estudiante(ARCHIVO_ESTUDIANTES)
    
    est_id = input("🆔 Ingrese su ID de estudiante: ").strip()
    
    estudiante = None
    for e in datos.get("estudiantes", []):
        if e['id'] == est_id:
            estudiante = e
            break
    
    if not estudiante:
        print("❌ Estudiante no encontrado.")
        return
    
    materias = estudiante.get("materias_inscritas", {})
    
    print("\n================= 📊 MIS CALIFICACIONES DETALLADAS =================")
    print(f"👤 Estudiante: {estudiante['nombre']}")
    print("-" * 80)
    
    if not materias:
        print("⚠️ No estás inscrito en ninguna materia.")
        return
    
    total_promedio = 0
    materias_con_calificaciones = 0
    
    for materia, info in materias.items():
        print(f"\n📚 {materia.upper()}")
        print("-" * 50)
        
        calificaciones = info.get("calificaciones", {})
        
        if not calificaciones:
            print("   📝 No hay calificaciones registradas aún.")
        else:
            suma_notas = 0
            print(f"{'Evaluación':<25} {'Nota':<10} {'Estado':<15}")
            print("-" * 50)
            
            for evaluacion, nota in calificaciones.items():
                if nota >= 7.0:
                    estado = "✅ Aprobado"
                    color = ""
                elif nota >= 6.0:
                    estado = "⚠️ Regular"
                    color = ""
                else:
                    estado = "❌ Reprobado"
                    color = ""
                
                print(f"{evaluacion:<25} {nota:<10.1f} {estado:<15}")
                suma_notas += nota
            
            promedio_materia = suma_notas / len(calificaciones)
            total_promedio += promedio_materia
            materias_con_calificaciones += 1
            
            print("-" * 50)
            print(f"📈 Promedio de {materia.capitalize()}: {promedio_materia:.2f}")
    
    if materias_con_calificaciones > 0:
        promedio_general = total_promedio / materias_con_calificaciones
        print("\n" + "="*60)
        print(f"🎯 PROMEDIO GENERAL: {promedio_general:.2f}")
        
        if promedio_general >= 8.5:
            print("🏆 ¡EXCELENTE RENDIMIENTO ACADÉMICO!")
        elif promedio_general >= 7.0:
            print("👍 Buen rendimiento, ¡sigue así!")
        elif promedio_general >= 6.0:
            print("📈 Rendimiento regular, puedes mejorar.")
        else:
            print("⚠️ Necesitas esforzarte más. ¡No te rindas!")
        
        print("="*60)

# 7. Ver reporte de asistencia detallado
def ver_mi_asistencia_detallada():
    """Ver reporte detallado de asistencia por materia."""
    datos = cargar_datos_estudiante(ARCHIVO_ESTUDIANTES)
    
    est_id = input("🆔 Ingrese su ID de estudiante: ").strip()
    
    estudiante = None
    for e in datos.get("estudiantes", []):
        if e['id'] == est_id:
            estudiante = e
            break
    
    if not estudiante:
        print("❌ Estudiante no encontrado.")
        return
    
    materias_globales = datos.get("materias", {})
    materias_estudiante = estudiante.get("materias_inscritas", {})
    
    print("\n================= 📊 MI REPORTE DE ASISTENCIA =================")
    print(f"👤 Estudiante: {estudiante['nombre']}")
    print("-" * 80)
    
    if not materias_estudiante:
        print("⚠️ No estás inscrito en ninguna materia.")
        return
    
    print(f"{'Materia':<20} {'Asistencias':<15} {'Total Sesiones':<15} {'Porcentaje':<12} {'Estado':<15}")
    print("-" * 80)
    
    total_asistencias = 0
    total_sesiones_todas = 0
    
    for materia, info_estudiante in materias_estudiante.items():
        asistencias = info_estudiante.get("asistencia", 0)
        total_sesiones = materias_globales.get(materia, {}).get("total_sesiones", 0)
        
        if total_sesiones > 0:
            porcentaje = (asistencias / total_sesiones) * 100
        else:
            porcentaje = 0
        
        # Determinar estado
        if porcentaje >= 80:
            estado = "✅ Excelente"
        elif porcentaje >= 70:
            estado = "⚠️ Bueno"
        elif porcentaje >= 60:
            estado = "🔶 Regular"
        else:
            estado = "❌ Crítico"
        
        print(f"{materia.capitalize():<20} {asistencias:<15} {total_sesiones:<15} {porcentaje:.1f}%{'':<7} {estado:<15}")
        
        total_asistencias += asistencias
        total_sesiones_todas += total_sesiones
    
    # Promedio general
    if total_sesiones_todas > 0:
        promedio_asistencia = (total_asistencias / total_sesiones_todas) * 100
        print("-" * 80)
        print(f"📊 PROMEDIO GENERAL DE ASISTENCIA: {promedio_asistencia:.1f}%")
        
        if promedio_asistencia >= 90:
            print("🏆 ¡Excelente asistencia! Sigue así.")
        elif promedio_asistencia >= 80:
            print("👍 Buena asistencia, mantén el ritmo.")
        elif promedio_asistencia >= 70:
            print("⚠️ Asistencia regular, trata de mejorar.")
        else:
            print("❌ Asistencia baja, necesitas ser más constante.")
    
    print("=" * 80)

# REEMPLAZA LA FUNCIÓN menuEstudiante() EXISTENTE CON ESTA VERSIÓN AVANZADA:
def menuEstudiante():
    """Menú principal del estudiante con funcionalidades avanzadas."""
    while True:
        print("\n================= 🎓 MENÚ ESTUDIANTE AVANZADO =================")
        print("1. 📚 Ver mis materias inscritas")
        print("2. 📖 Ver material de estudio")
        print("3. 📅 Ver mi horario de clases")
        print("4. 📝 Ver mis tareas asignadas")
        print("5. 📤 Entregar tarea")
        print("6. 📊 Ver mis calificaciones detalladas")
        print("7. 📈 Ver mi reporte de asistencia")
        print("8. 🔄 Actualizar información personal")
        print("0. 🚪 Cerrar sesión")
        print("="*70)
        
        opcion = input('🔢 Seleccione una opción: ')
        
        if opcion == '1':
            ver_mis_materias()
        elif opcion == '2':
            ver_material_estudio()
        elif opcion == '3':
            ver_mi_horario()
        elif opcion == '4':
            ver_mis_tareas()
        elif opcion == '5':
            entregar_tarea()
        elif opcion == '6':
            ver_mis_calificaciones_detalladas()
        elif opcion == '7':
            ver_mi_asistencia_detallada()
        elif opcion == '8':
            print("🔄 Funcionalidad de actualización en desarrollo...")
            input("📥 Presione Enter para continuar...")
        elif opcion == '0':
            confirmar = input('¿Deseas cerrar sesión? (s/n): ').lower()
            if confirmar == 's':
                print('✅ Sesión cerrada. Regresando al login...')
                return False
        else:
            print("❌ Opción no válida.")
            input("📥 Presione Enter para continuar...")

# También mantén las funciones originales para compatibilidad
def verCalificacionesEstudiante():
    """Función de compatibilidad - redirige a la versión avanzada"""
    ver_mis_calificaciones_detalladas()

def verHorarioEstudiante():
    """Función de compatibilidad - redirige a la versión avanzada"""
    ver_mi_horario()

def run_server():
    app.run(debug=True, use_reloader=False)

def main():
    print('================= SISTEMA ACADEMICO EDUCONNECT =================')
    print('📚 Bienvenido al Sistema de Gestión Académica EduConnect')
    print('🔐 Puedes iniciar sesión con tu email o nombre de usuario')
    print('================================================================')

    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    while True:
        usuario = iniciarSesion()
        if usuario is None:
            print("No se inició sesión. Cerrando sistema...")
            break

        rol_normalizado = normalizarRol(usuario['rol'])
        
        periodoActivo = obtenerPeriodoActivo()
        if periodoActivo:
            print(f'\n📅 Período Académico Activo: \033[1m{periodoActivo}\033[0m\n')
        else:
            print('\n⚠️ No hay un período académico activo actualmente.\n')

        if rol_normalizado == 'administrador':
            salir = menuAdministrador()
        elif rol_normalizado == 'profesor':
            salir = menuProfesor()
        elif rol_normalizado == 'estudiante':
            salir = menuEstudiante()
        elif rol_normalizado == 'administrativo':
            salir = menuAdministrativo()
        else:
            print(f'Rol no reconocido: {usuario["rol"]}')
            salir = True
        
        if salir:
            print('✅ Gracias por usar el Sistema Académico EduConnect.')
            break

if __name__ == "__main__":
    main()