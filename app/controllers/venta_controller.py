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
        return jsonify({"success": False, "message": str(e)}), 500

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

