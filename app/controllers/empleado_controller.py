from flask import Blueprint, jsonify, request
from app import db
from ..models import Empleado
from ..utils import login_required

empleado = Blueprint('empleado', __name__)

@empleado.route('/getAll', methods=['GET'])
@login_required('Gerente')
def getAll():
    try:
        empleados = Empleado.query.filter_by(Estado=True).all()
        data = [
            {
                "Empleado_ID": empleado.Empleado_ID,
                "Rol_Nombre": empleado.rol.Nombre,
                "Sexo_Nombre": empleado.sexo.Nombre,
                "TipoDoc_Nombre": empleado.tipo_documento.Nombre,
                "NumeroDoc": empleado.NumeroDoc,
                "Distrito_Nombre": empleado.distrito.Nombre,
                "NombreCompleto": empleado.Nombres+' '+ empleado.Apellidos,
                "Telefono": empleado.Telefono,
                "Correo": empleado.Correo,
                "FechaNacimiento": empleado.FechaNacimiento.isoformat()
            }
            for empleado in empleados
        ]
        return jsonify({
            "success": True,
            "message": "Empleados encontrados.",
            "data": data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al obtener los empleados.",
            "error": str(e)
        }), 500

@empleado.route('/getId/<int:Empleado_ID>', methods=['GET'])
@login_required('Gerente')
def getId(Empleado_ID):
    try:
        empleado = Empleado.query.get(Empleado_ID)
        if not empleado:
            return jsonify({"success": False, "message": "Empleado no encontrado"}), 404

        data = {
                "Empleado_ID": empleado.Empleado_ID,
                "Rol_ID": empleado.Rol_ID,
                "Sexo_ID": empleado.Sexo_ID,
                "TipoDoc_ID": empleado.TipoDoc_ID,
                "NumeroDoc": empleado.NumeroDoc,
                "Distrito_Codigo": empleado.Distrito_Codigo,
                "Nombres": empleado.Nombres,
                "Apellidos":empleado.Apellidos,
                "Telefono": empleado.Telefono,
                "Correo": empleado.Correo,
                "FechaNacimiento": empleado.FechaNacimiento.isoformat(),
                "Usuario": empleado.Usuario,
                "Edad": empleado.Edad,
                "Clave": empleado.Clave,
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

@empleado.route('/register', methods=['POST'])
@login_required('Gerente')
def register():
    try:
        data = request.get_json()
        nuevo_empleado = Empleado(
            Rol_ID=data.get('Rol_ID'),
            Sexo_ID=data.get('Sexo_ID'),
            TipoDoc_ID=data.get('TipoDoc_ID'),
            Distrito_Codigo=data.get('Distrito_Codigo'),
            Nombres=data.get('Nombres'),
            Apellidos=data.get('Apellidos'),
            Edad=data.get('Edad'),
            NumeroDoc=data.get('NumeroDoc'),
            FechaNacimiento=data.get('FechaNacimiento'),
            Telefono=data.get('Telefono'),
            Correo=data.get('Correo'),
            Usuario=data.get('Usuario'),
            Clave=data.get('Clave'),
            Estado=data.get('Estado', True)
        )
        db.session.add(nuevo_empleado)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Empleado registrado exitosamente.",
            "Empleado_ID": nuevo_empleado.Empleado_ID
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al registrar el empleado.",
            "error": str(e)
        }), 500

@empleado.route('/update/<int:Empleado_ID>', methods=['PUT'])
@login_required('Gerente')
def update(Empleado_ID):
    try:
        data = request.get_json()
        empleado = Empleado.query.get(Empleado_ID)
        if not empleado:
            return jsonify({"success": False, "message": "Empleado no encontrado"}), 404

        empleado.Rol_ID = data.get('Rol_ID', empleado.Rol_ID)
        empleado.Sexo_ID = data.get('Sexo_ID', empleado.Sexo_ID)
        empleado.TipoDoc_ID = data.get('TipoDoc_ID', empleado.TipoDoc_ID)
        empleado.Distrito_Codigo = data.get('Distrito_Codigo', empleado.Distrito_Codigo)
        empleado.Nombres = data.get('Nombres', empleado.Nombres)
        empleado.Apellidos = data.get('Apellidos', empleado.Apellidos)
        empleado.Edad = data.get('Edad', empleado.Edad)
        empleado.NumeroDoc = data.get('NumeroDoc', empleado.NumeroDoc)
        empleado.FechaNacimiento = data.get('FechaNacimiento', empleado.FechaNacimiento)
        empleado.Telefono = data.get('Telefono', empleado.Telefono)
        empleado.Correo = data.get('Correo', empleado.Correo)
        empleado.Usuario = data.get('Usuario', empleado.Usuario)
        empleado.Clave = data.get('Clave', empleado.Clave)
        
        db.session.commit()
        return jsonify({"success": True, "message": "Empleado actualizado con éxito"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": "Error al actualizar el empleado.", "error": str(e)}), 500

@empleado.route('/delete/<int:Empleado_ID>', methods=['DELETE'])
@login_required('Gerente')
def delete(Empleado_ID):
    try:
        empleado = Empleado.query.get(Empleado_ID)
        if not empleado:
            return jsonify({"success": False, "message": "Empleado no encontrado"}), 404

        db.session.delete(empleado)
        db.session.commit()
        return jsonify({"success": True, "message": "Empleado eliminado con éxito"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@empleado.route('/desactivar/<int:Empleado_ID>', methods=['POST'])
@login_required('Gerente')
def desactivar(Empleado_ID):
    try:
        empleado = Empleado.query.get(Empleado_ID)

        if empleado is None:
            return jsonify({
                "success": False,
                "message": "Empleado no encontrado."
            }), 404
        
        empleado.Estado = False  
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Empleado eliminado exitosamente."
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al eliminar el empleado.",
            "error": str(e)
        }), 500
    