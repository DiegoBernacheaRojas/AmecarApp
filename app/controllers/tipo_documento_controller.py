from flask import Blueprint, request, jsonify
from app import db
from ..models import TipoDocumento
from ..utils import login_required

tipo_documento = Blueprint('tipo_documento', __name__)

@tipo_documento.route('/getAll', methods=['GET'])
@login_required
def getAll():
    try:
        # Obtener todos los clientes
        tiposDocumento = TipoDocumento.query.all()
        
        if not tiposDocumento:
            return jsonify({
                "success": False,
                "message": "No se encontraron tipos de documento."
            }), 404
        
        # Formatear los datos
        data = [{
            "TipoDoc_ID": tipoDocumento.TipoDoc_ID,
            "Nombre": tipoDocumento.Nombre,
            "Estado": tipoDocumento.Estado
        } for tipoDocumento in tiposDocumento]

        return jsonify({
            "success": True,
            "message": "Tipos de documento encontrados.",
            "data": data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al obtener los tipos de documento.",
            "error": str(e)
        }), 500
