import datetime
from app.models import Empleado, Cliente
from flask import Blueprint, jsonify, request
from app import db
from ..models import Venta, DetalleVenta
from ..utils import login_required

venta = Blueprint('venta', __name__)

# Obtener todas las ventas activas
@venta.route('/getAll', methods=['GET'])
@login_required('Gerente')
def getAll():
    try:
        ventas = Venta.query.filter_by(Estado=1).all()  # Filtra solo ventas activas
        result = [
            {
                "Venta_ID": venta.Venta_ID,
                "Cliente_Nombre": venta.cliente.Nombre,
                "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                "FechaVenta": venta.FechaVenta.isoformat(),
                "Total": venta.Total,
                "Estado": venta.Estado
            } for venta in ventas
        ]
        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@venta.route('/guardar_documento', methods=['POST'])
@login_required('Gerente','Empleado')
def guardar_documento():
    data = request.get_json()
    tipoDocumento = data.get('tipoDocumento')

    if tipoDocumento == 'boleta':
        dni = data.get('dni')
        nombre = data.get('nombre')

        # Verificar si el DNI ya existe
        cliente = dni.query.filter_by(Dni=dni).first()
        if cliente:
            # Si ya existe, no hacer nada (solo mostrar los datos existentes)
            return jsonify({'message': 'DNI ya registrado', 'cliente': cliente.Dni, 'nombre': cliente.Nombre})
        else:
            # Si no existe, insertar nuevo DNI
            nuevo_cliente = dni(Dni=dni, Nombre=nombre)
            db.session.add(nuevo_cliente)
            db.session.commit()
            return jsonify({'message': 'DNI guardado correctamente'})

    elif tipoDocumento == 'factura':
        ruc = data.get('ruc')
        razonSocial = data.get('razonSocial')
        direccion = data.get('direccion')

        # Verificar si el RUC ya existe
        empresa = ruc.query.filter_by(Ruc=ruc).first()
        if empresa:
            # Si ya existe, devolver los datos de la empresa
            return jsonify({
                'message': 'RUC encontrado',
                'ruc': empresa.Ruc,
                'razonSocial': empresa.RazonSocial,
                'direccion': empresa.Direccion
            })
        else:
            # Si no existe, insertar nuevo RUC
            nueva_empresa = ruc(Ruc=ruc, RazonSocial=razonSocial, Direccion=direccion)
            db.session.add(nueva_empresa)
            db.session.commit()
            return jsonify({'message': 'RUC guardado correctamente'})

    return jsonify({'message': 'Tipo de documento no válido'})


# Obtener una venta por ID
@venta.route('/getId/<int:Venta_ID>', methods=['GET'])
@login_required('Gerente')
def getId(Venta_ID):
    try:
        # Obtener la venta principal
        venta = Venta.query.get(Venta_ID)
        if not venta:
            return jsonify({"success": False, "message": "Venta no encontrada"}), 404
        
        # Obtener los detalles relacionados con la venta
        detalles = DetalleVenta.query.filter_by(Venta_ID=Venta_ID).all()
        detalles_result = [
            {
                "DetalleVenta_ID": detalle.DetalleVenta_ID,
                "Producto_Descripcion": detalle.producto.Descripcion,
                "Cantidad": detalle.Cantidad,
                "PrecioUnitario": detalle.PrecioUnitario,
                "SubTotal": detalle.SubTotal
            } for detalle in detalles
        ]
        
        # Formar la respuesta con la venta y sus detalles
        result = {
            "Venta_ID": venta.Venta_ID,
            "Cliente_Nombre": venta.cliente.Nombre,
            "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
            "FechaVenta": venta.FechaVenta.isoformat(),
            "Total": venta.Total,
            "Estado": venta.Estado,
            "Detalles": detalles_result
        }
        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
# Eliminar una venta (DELETE)
@venta.route('/delete/<int:Venta_ID>', methods=['DELETE'])
@login_required('Gerente')
def delete(venta_id):
    try:
        venta = Venta.query.get(venta_id)
        if not venta:
            return jsonify({"success": False, "message": "Venta no encontrada"}), 404
        
        db.session.delete(venta)
        db.session.commit()
        return jsonify({"success": True, "message": "Venta eliminada correctamente"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Desactivar una venta (Actualizar Estado a 0)
@venta.route('/desactivar/<int:venta_id>', methods=['POST'])
@login_required('Gerente')
def desactivar(venta_id):
    try:
        venta = Venta.query.get(venta_id)
        if not venta:
            return jsonify({"success": False, "message": "Venta no encontrada"}), 404
        
        venta.Estado = 0  # Cambia el estado a inactivo
        db.session.commit()
        return jsonify({"success": True, "message": "Venta desactivada correctamente"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    


@venta.route("/registrar", methods=["POST"])
def registrar_venta():
    data = request.json
    # Verificar que los datos esenciales estén en la solicitud
    required_fields = ["Empleado_ID", "TipoDocumento", "MetodoPago", "TotalVenta"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    # Verificar si el empleado existe
    empleado = Empleado.query.filter_by(Empleado_ID=data["Empleado_ID"]).first()
    if not empleado:
        return jsonify({"error": "Empleado no encontrado"}), 404

    # Verificar si el cliente existe
    cliente = Cliente.query.filter_by(Cliente_ID=data.get("Cliente_ID")).first()  # Cliente_ID puede ser opcional
    if not cliente:
        return jsonify({"error": "Cliente no encontrado"}), 404

    try:
        nueva_venta = Venta(
            Cliente_ID=data.get("Cliente_ID", "Clientes Varios"),  # Usar un cliente por defecto si no se pasa
            Empleado_ID=data["Empleado_ID"],
            FechaVenta=datetime.utcnow(),
            Estado=1,  # Por defecto
            TipoDocumento=data["TipoDocumento"],
            MetodoPago=data["MetodoPago"],
            TotalVenta=data["TotalVenta"]
        )
        
        db.session.add(nueva_venta)
        db.session.commit()

        return jsonify({"message": "Venta registrada con éxito"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500