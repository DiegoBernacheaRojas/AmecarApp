from flask import Blueprint, jsonify, request
from app import db
from ..models import Producto
from ..utils import login_required

producto = Blueprint('producto', __name__)

@producto.route('/api/producto/getAll', methods=['GET'])
@login_required
def obtener_todos():
    try:
        productos = Producto.query.all()
        productos_lista = [
            {
                "Producto_ID": producto.id,
                "Nombre": producto.nombre,
                "Descripcion": producto.descripcion,
                "Precio": producto.precio,
                "Stock": producto.stock,
                "FechaIngreso": producto.fecha_ingreso.strftime("%Y-%m-%d %H:%M:%S")
            }
            for producto in productos
        ]
        return jsonify({"success": True, "data": productos_lista}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@producto.route('/api/producto/get/<int:id>', methods=['GET'])
@login_required
def obtener_producto(id):
    try:
        producto = Producto.query.get(id)
        if not producto:
            return jsonify({"success": False, "message": "Producto no encontrado"}), 404

        producto_data = {
            "Producto_ID": producto.id,
            "Nombre": producto.nombre,
            "Descripcion": producto.descripcion,
            "Precio": producto.precio,
            "Stock": producto.stock,
            "FechaIngreso": producto.fecha_ingreso.strftime("%Y-%m-%d %H:%M:%S")
        }
        return jsonify({"success": True, "data": producto_data}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@producto.route('/api/producto/register', methods=['POST'])
@login_required
def registrar_producto():
    try:
        data = request.get_json()
        nuevo_producto = Producto(
            nombre=data.get('Nombre'),
            descripcion=data.get('Descripcion'),
            precio=data.get('Precio'),
            stock=data.get('Stock')
        )
        db.session.add(nuevo_producto)
        db.session.commit()
        return jsonify({"success": True, "message": "Producto registrado con éxito"}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@producto.route('/api/producto/update/<int:id>', methods=['PUT'])
@login_required
def actualizar_producto(id):
    try:
        data = request.get_json()
        producto = Producto.query.get(id)
        if not producto:
            return jsonify({"success": False, "message": "Producto no encontrado"}), 404

        producto.nombre = data.get('Nombre', producto.nombre)
        producto.descripcion = data.get('Descripcion', producto.descripcion)
        producto.precio = data.get('Precio', producto.precio)
        producto.stock = data.get('Stock', producto.stock)

        db.session.commit()
        return jsonify({"success": True, "message": "Producto actualizado con éxito"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@producto.route('/api/producto/delete/<int:id>', methods=['DELETE'])
@login_required
def eliminar_producto(id):
    try:
        producto = Producto.query.get(id)
        if not producto:
            return jsonify({"success": False, "message": "Producto no encontrado"}), 404

        db.session.delete(producto)
        db.session.commit()
        return jsonify({"success": True, "message": "Producto eliminado con éxito"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
