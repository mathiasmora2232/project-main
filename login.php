<?php
// login.php
// Endpoint simple para autenticación durante desarrollo.
// Lee usuarios desde usuarios.json (archivo en la raíz) y responde JSON.

header('Content-Type: application/json');
// Permitir CORS en desarrollo (ajustar en producción)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Responder preflight
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Bad request']);
    exit;
}

$email = mb_strtolower(trim($data['email']));
$password = $data['password'];

$usersFile = __DIR__ . '/usuarios.json';
if (!file_exists($usersFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'usuarios.json not found']);
    exit;
}

$users = json_decode(file_get_contents($usersFile), true);
if (!is_array($users)) $users = [];

$found = null;
foreach ($users as $u) {
    if (isset($u['email']) && mb_strtolower($u['email']) === $email) {
        $found = $u;
        break;
    }
}

if (!$found) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
    exit;
}

// Manejo simple de contraseñas:
// - Si el campo tiene prefijo "scrypt:", en modo desarrollo aceptamos la contraseña demo "123456"
// - En caso contrario comparamos texto plano (este archivo es para desarrollo / migración)

$stored = isset($found['password']) ? $found['password'] : '';
$isHashed = is_string($stored) && strpos($stored, 'scrypt:') === 0;
$ok = false;
if ($isHashed) {
    if ($password === '123456') $ok = true; // DEMO: permitir login local para cuentas migradas
} else {
    if ($password === $stored) $ok = true;
}

if (!$ok) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
    exit;
}

// Autenticado: iniciar sesión PHP (opcional)
session_start();
$_SESSION['user_id'] = $found['id'];

$role = '';
if (isset($found['rol'])) $role = mb_strtolower($found['rol']);

// Respuesta (mismo formato que el localBackend/JS espera)
echo json_encode([
    'success' => true,
    'id' => $found['id'],
    'username' => isset($found['username']) ? $found['username'] : null,
    'email' => isset($found['email']) ? $found['email'] : null,
    'rol' => $role,
    // En este ejemplo no generamos JWT, pero podríamos añadirlo aquí
]);

?>
