from flask import Blueprint, request, jsonify
from app import db
from ..models import Rol
from ..utils import login_required

rol = Blueprint('rol', __name__)

@rol.route('/getAll', methods=['GET'])
@login_required('Gerente')
def getAll():
    try:
        # Obtener todos los clientes
        roles = Rol.query.all()
        
        if not roles:
            return jsonify({
                "success": False,
                "message": "No se encontraron roles."
            }), 404
        
        # Formatear los datos
        data = [{
            "Rol_ID": rol.Rol_ID,
            "Nombre": rol.Nombre,
            "Estado": rol.Estado
        } for rol in roles]

        return jsonify({
            "success": True,
            "message": "Roles encontrados.",
            "data": data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al obtener los roles.",
            "error": str(e)
        }), 500