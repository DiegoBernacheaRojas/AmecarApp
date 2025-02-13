from flask import Blueprint, request, jsonify
from app import db
from ..models import Sexo
from ..utils import login_required

sexo = Blueprint('sexo', __name__)

@sexo.route('/getAll', methods=['GET'])
@login_required
def getAll():
    try:
        # Obtener todos los clientes
        sexos = Sexo.query.all()
        
        if not sexos:
            return jsonify({
                "success": False,
                "message": "No se encontraron sexos."
            }), 404
        
        # Formatear los datos
        data = [{
            "Sexo_ID": sexo.Sexo_ID,
            "Nombre": sexo.Nombre,
            "Estado": sexo.Estado
        } for sexo in sexos]

        return jsonify({
            "success": True,
            "message": "Sexos encontrados.",
            "data": data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al obtener los sexos.",
            "error": str(e)
        }), 500
