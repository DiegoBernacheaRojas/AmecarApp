from flask import Blueprint, request, jsonify, session
from app import db
from ..models import Empleado

login = Blueprint('login', __name__)

@login.route('/', methods=['POST'])
def post_login():
    # Obtener datos del frontend
    data = request.get_json()
    usuario = data.get('usuario')
    clave = data.get('clave')

    if not usuario or not clave:
        return jsonify({
            "success": False,
            "message": "Usuario y clave son requeridos."
        }), 200

    # Buscar al usuario en la base de datos
    empleado = Empleado.query.filter_by(Usuario=usuario).first()

    if not empleado:
        return jsonify({
            "success": False,
            "message": "Usuario no encontrado."
        }), 200

    # Verificar la clave
    if empleado.Clave != clave:  # Comparación directa de las cadenas
        return jsonify({
            "success": False,
            "message": "Clave incorrecta."
        }), 200

    # Guardar la sesión
    session['user_id'] = empleado.Empleado_ID
    session['rol'] = empleado.rol.Nombre


    return jsonify({
        "success": True,
        "message": "Inicio de sesión correcto.",
        "user": {
            "id": empleado.Empleado_ID,
            "nombres": empleado.Nombres,
            "apellidos": empleado.Apellidos,
            "rol": empleado.rol.Nombre
        }
    }), 200

@login.route('/logout', methods=['POST'])
def logout():
    try:
        # Eliminar todos los datos de la sesión
        session.clear()

        return jsonify({
            "success": True,
            "message": "Sesión cerrada correctamente."
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Ocurrió un error al cerrar sesión.",
            "error": str(e)
        }), 500