from flask import Blueprint, request, jsonify
from app import db
from ..models import SubCategoria
from ..utils import login_required

subcategoria = Blueprint('subcategoria', __name__)

@subcategoria.route('/getAll', methods=['GET'])
@login_required
def getAll():
    try:
        # Obtener todos los clientes
        subcategorias = SubCategoria.query.all()
        
        if not subcategorias:
            return jsonify({
                "success": False,
                "message": "No se encontraron subcategorias."
            }), 404
        
        # Formatear los datos
        data = [{
            "Subcategoria_ID": subcategoria.Subcategoria_ID,
            "Categoria_ID": subcategoria.Categoria_ID,
            "Categoria_Nombre": subcategoria.categoria.Nombre,
            "Nombre": subcategoria.Nombre
        } for subcategoria in subcategorias]

        return jsonify({
            "success": True,
            "message": "Subcategorias encontrados.",
            "data": data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al obtener los subcategorias.",
            "error": str(e)
        }), 500
        