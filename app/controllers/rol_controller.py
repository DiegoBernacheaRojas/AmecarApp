from flask import Blueprint, request, jsonify
from app import db
from ..models import Rol
from ..utils import login_required
import json

rol = Blueprint('rol', __name__)

@rol.route('/getAll', methods=['GET'])
@login_required
def getAll():
    try:
        # Obtener todos los clientes
        roles = Rol.query.filter_by(Estado=True).all()
        
        if not roles:
            return jsonify({
                "success": False,
                "message": "No se encontraron roles."
            }), 404
        
        # Formatear los datos
        data = [{
            "Rol_ID": rol.Rol_ID,
            "Nombre": rol.Nombre,
            "Estado": rol.Estado,
            "Permisos": rol.Permisos

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
    
@rol.route('/getId/<int:Rol_ID>', methods=['GET'])
@login_required
def getId(Rol_ID):
    try:
        rol = Rol.query.get(Rol_ID)
        if not rol:
            return jsonify({"success": False, "message": "Rol no encontrado"}), 404

        data = {
                "Rol_ID": rol.Rol_ID,
                "Nombre": rol.Nombre,
                "Permisos": rol.Permisos,

        }
        return jsonify({
            "success": True, 
            "data": data
        }), 200
    except Exception as e:
        return jsonify({
            "success": False, 
            "message": str(e)
        }), 500

@rol.route('/register', methods=['POST'])
@login_required
def register():
    try:
        # Obtener los datos del cuerpo de la solicitud
        data = request.get_json()

        # Obtener el nombre y los permisos
        nombre = data.get('Nombre')
        permisos = data.get('Permisos')  # Lista de permisos, que ya es un string JSON

        # Aquí ya no es necesario convertir permisos a JSON nuevamente, 
        # ya que viene como una cadena JSON directamente.
        permisos_json = permisos  # Lo guardamos tal cual como una cadena JSON

        # Crear el nuevo rol
        nuevo_rol = Rol(  # Cambié a Rol (el nombre correcto del modelo)
            Nombre=nombre,
            Permisos=permisos_json,  # Guardamos la cadena JSON tal cual
            Estado=True
        )

        # Añadir a la sesión de base de datos y guardar
        db.session.add(nuevo_rol)
        db.session.commit()

        # Respuesta exitosa
        return jsonify({
            "success": True,
            "message": "Rol registrado exitosamente.",
            "Rol_ID": nuevo_rol.Rol_ID
        }), 201  # Created

    except Exception as e:
        # Si ocurre un error, devolver un mensaje con el error específico
        return jsonify({
            "success": False,
            "message": "Error al registrar el rol.",
            "error": str(e)
        }), 500  # Internal Server Error

    
@rol.route('/update/<int:Rol_ID>', methods=['PUT'])
@login_required
def update(Rol_ID):
    try:
        data = request.get_json()

        # Buscar el rol por su ID
        rol = Rol.query.get(Rol_ID)
        if not rol:
            return jsonify({"success": False, "message": "Rol no encontrado"}), 404

        # Obtener los nuevos valores para el rol, usando los valores actuales si no se proporcionan nuevos
        rol.Nombre = data.get('Nombre', rol.Nombre)

        # Obtener los permisos de la solicitud y asegurarse de que sean una lista JSON válida
        permisos = data.get('Permisos')
        if permisos:
            permisos_json = permisos  # Asumimos que 'Permisos' es ya una cadena JSON correcta
            rol.Permisos = permisos_json  # Actualizar los permisos en la base de datos

        db.session.commit()

        return jsonify({"success": True, "message": "Rol actualizado con éxito"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@rol.route('/desactivar/<int:Rol_ID>', methods=['POST'])
@login_required
def desactivar(Rol_ID):
    try:
        rol = Rol.query.get(Rol_ID)

        if rol is None:
            return jsonify({
                "success": False,
                "message": "Rol no encontrado."
            }), 404
        
        # Verificar si el rol tiene empleados asociados
        if rol.empleados:  # Si hay empleados vinculados al rol
            return jsonify({
                "success": False,
                "message": "No se puede desactivar el rol porque tiene empleados vinculados."
            }), 400  # Bad Request

        # Desactivar el rol estableciendo 'Estado' a False
        rol.Estado = False
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Rol desactivado exitosamente."
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al desactivar el rol.",
            "error": str(e)
        }), 500