import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Ajusta la ruta del archivo para que funcione desde cualquier ubicación
USERS_FILE = os.path.join(os.path.dirname(__file__), '..', 'usuarios.json')

def cargar_usuarios():
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

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
                'rol': usuario.get('rol', 'user')
            })
    return jsonify({'success': False, 'message': 'Credenciales incorrectas'})

if __name__ == '__main__':
    app.run(debug=True)
