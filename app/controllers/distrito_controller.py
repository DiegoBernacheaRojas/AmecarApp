from flask import Blueprint, request, jsonify
from app import db
from ..models import Distrito
from ..utils import login_required

distrito = Blueprint('distrito', __name__)

@distrito.route('/getAll', methods=['GET'])
@login_required
def getAll():
    try:
        # Obtener todos los clientes
        distritos = Distrito.query.all()
        
        if not distritos:
            return jsonify({
                "success": False,
                "message": "No se encontraron distritos."
            }), 404
        
        # Formatear los datos
        data = [{
            "Distrito_ID": distrito.Distrito_ID,
            "Codigo": distrito.Codigo,
            "Nombre": distrito.Nombre,
            "Estado": distrito.Estado
        } for distrito in distritos]

        return jsonify({
            "success": True,
            "message": "Distritos encontrados.",
            "data": data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al obtener los distritos.",
            "error": str(e)
        }), 500
