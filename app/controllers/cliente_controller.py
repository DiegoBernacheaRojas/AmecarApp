from flask import Blueprint, request, jsonify
from app import db
from ..models import Cliente
from ..utils import login_required

cliente = Blueprint('cliente', __name__)

@cliente.route('/getId/<int:Cliente_ID>', methods=['GET'])
@login_required
def getId(Cliente_ID):
    try:
        # Buscar el cliente por su ID
        cliente = Cliente.query.get(Cliente_ID)
        
        if cliente is None:
            return jsonify({
                "success": False,
                "message": "Cliente no encontrado."
            }), 404
        
        # Devolver todos los atributos del cliente
        return jsonify({
            "success": True,
            "message": "Cliente encontrado.",
            "data": {
                "Cliente_ID": cliente.Cliente_ID,
                "Sexo": cliente.sexo.Nombre,
                "Distrito": cliente.distrito.Nombre,
                "Nombre": cliente.Nombre,
                "TipoCliente": cliente.TipoCliente,
                "TipoDoc_ID": cliente.tipo_documento.Nombre,
                "NumDoc": cliente.NumDoc,
                "Telefono": cliente.Telefono,
                "Correo": cliente.Correo,
                "Direccion": cliente.Direccion,
                "FechaCreacion": cliente.FechaCreacion.isoformat() if cliente.FechaCreacion else None,
                "FechaNacimiento": cliente.FechaNacimiento.isoformat() if cliente.FechaNacimiento else None,
                "Estado": cliente.Estado
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al obtener el cliente.",
            "error": str(e)
        }), 500

@cliente.route('/getAll', methods=['GET'])
@login_required
def getAll():
    try:
        # Obtener todos los clientes
        clientes = Cliente.query.all()
        
        if not clientes:
            return jsonify({
                "success": False,
                "message": "No se encontraron clientes."
            }), 404
        
        # Formatear los datos
        data = [{
            "Cliente_ID": cliente.Cliente_ID,
            "Sexo": cliente.sexo.Nombre,
            "Distrito": cliente.distrito.Nombre,
            "Nombre": cliente.Nombre,
            "TipoCliente": cliente.TipoCliente,
            "TipoDoc_ID": cliente.tipo_documento.Nombre,
            "NumDoc": cliente.NumDoc,
            "Telefono": cliente.Telefono,
            "Correo": cliente.Correo,
            "Direccion": cliente.Direccion,
            "FechaCreacion": cliente.FechaCreacion.isoformat() if cliente.FechaCreacion else None,
            "FechaNacimiento": cliente.FechaNacimiento.isoformat() if cliente.FechaNacimiento else None,
            "Estado": cliente.Estado
        } for cliente in clientes]

        return jsonify({
            "success": True,
            "message": "Clientes encontrados.",
            "data": data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al obtener los clientes.",
            "error": str(e)
        }), 500

@cliente.route('/register', methods=['POST'])
@login_required
def register():
    try:
        data = request.get_json()
        
        # Crear una nueva instancia de Cliente
        nuevo_cliente = Cliente(
            Sexo_ID=data.get('Sexo_ID'),
            Distrito_Codigo=data.get('Distrito_Codigo'),
            Nombre=data.get('Nombre'),
            TipoCliente=data.get('TipoCliente'),
            TipoDoc_ID=data.get('TipoDoc_ID'),
            NumDoc=data.get('NumDoc'),
            Telefono=data.get('Telefono'),
            Correo=data.get('Correo'),
            Direccion=data.get('Direccion'),
            FechaNacimiento=data.get('FechaNacimiento'),
            Estado=data.get('Estado', True)  # Estado predeterminado: activo
        )
        
        # Guardar en la base de datos
        db.session.add(nuevo_cliente)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Cliente registrado exitosamente.",
            "Cliente_ID": nuevo_cliente.Cliente_ID
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al registrar el cliente.",
            "error": str(e)
        }), 500

@cliente.route('/update/<int:Cliente_ID>', methods=['PUT'])
@login_required
def update(Cliente_ID):
    try:
        cliente = Cliente.query.get(Cliente_ID)

        if cliente is None:
            return jsonify({
                "success": False,
                "message": "Cliente no encontrado."
            }), 404

        data = request.get_json()
        
        # Actualizar los campos del cliente
        cliente.Sexo_ID = data.get('Sexo_ID', cliente.Sexo_ID)
        cliente.Distrito_Codigo = data.get('Distrito_Codigo', cliente.Distrito_Codigo)
        cliente.Nombre = data.get('Nombre', cliente.Nombre)
        cliente.TipoCliente = data.get('TipoCliente', cliente.TipoCliente)
        cliente.TipoDoc_ID = data.get('TipoDoc_ID', cliente.TipoDoc_ID)
        cliente.NumDoc = data.get('NumDoc', cliente.NumDoc)
        cliente.Telefono = data.get('Telefono', cliente.Telefono)
        cliente.Correo = data.get('Correo', cliente.Correo)
        cliente.Direccion = data.get('Direccion', cliente.Direccion)
        cliente.FechaNacimiento = data.get('FechaNacimiento', cliente.FechaNacimiento)
        cliente.Estado = data.get('Estado', cliente.Estado)

        # Guardar cambios
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Cliente actualizado exitosamente."
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al actualizar el cliente.",
            "error": str(e)
        }), 500

@cliente.route('/delete/<int:Cliente_ID>', methods=['DELETE'])
@login_required
def delete(Cliente_ID):
    try:
        cliente = Cliente.query.get(Cliente_ID)

        if cliente is None:
            return jsonify({
                "success": False,
                "message": "Cliente no encontrado."
            }), 404
        
        # Eliminar el cliente
        db.session.delete(cliente)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Cliente eliminado exitosamente."
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al eliminar el cliente.",
            "error": str(e)
        }), 500
