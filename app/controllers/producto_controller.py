from flask import Blueprint, jsonify, request
from app import db
from ..models import Producto, DetalleVenta
from ..utils import login_required

producto = Blueprint('producto', __name__)

@producto.route('/getAll', methods=['GET'])
@login_required
def getAll():
    try:
        productos = Producto.query.filter_by(Estado=True).all()
        data = [
            {
                "Producto_ID": producto.Producto_ID,
                "SubCategoria": producto.subcategoria.Nombre,
                "CodigoBarras": producto.CodigoBarras,
                "Descripcion": producto.Descripcion,
                "Precio": producto.Precio,
                "Stock": producto.Stock,
                "FechaIngreso": producto.FechaIngreso.isoformat()
            }
            for producto in productos
        ]
        return jsonify({
            "success": True,
            "message": "Productos encontrados.",
            "data": data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al obtener los productos.",
            "error": str(e)
        }), 500

@producto.route('/getId/<int:Producto_ID>', methods=['GET'])
@login_required
def getId(Producto_ID):
    try:
        producto = Producto.query.get(Producto_ID)
        if not producto:
            return jsonify({"success": False, "message": "Producto no encontrado"}), 404

        data = {
                "Producto_ID": producto.Producto_ID,
                "SubCategoria": producto.Subcategoria_ID,
                "CodigoBarras": producto.CodigoBarras,
                "Descripcion": producto.Descripcion,
                "Precio": producto.Precio,
                "Stock": producto.Stock,
                "FechaIngreso": producto.FechaIngreso.isoformat()
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

@producto.route('/register', methods=['POST'])
@login_required
def register():
    try:
        data = request.get_json()
        nuevo_producto = Producto(
            Subcategoria_ID = data.get('Subcategoria_ID'),
            CodigoBarras = data.get('CodigoBarras'),
            Descripcion = data.get('Descripcion'),
            Precio = data.get('Precio'),
            Stock = data.get('Stock'),
            FechaIngreso = data.get('FechaIngreso'),
            Estado = True,
        )
        db.session.add(nuevo_producto)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Producto registrado exitosamente.",
            "Producto_ID": nuevo_producto.Producto_ID
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al registrar el producto.",
            "error": str(e)
        }), 500

@producto.route('/update/<int:Producto_ID>', methods=['PUT'])
@login_required
def update(Producto_ID):
    try:
        data = request.get_json()
        producto = Producto.query.get(Producto_ID)
        if not producto:
            return jsonify({"success": False, "message": "Producto no encontrado"}), 404

        # Eliminar las comas adicionales que crean tuplas
        producto.Subcategoria_ID = data.get('Subcategoria_ID', producto.Subcategoria_ID)
        producto.CodigoBarras = data.get('CodigoBarras', producto.CodigoBarras)
        producto.Descripcion = data.get('Descripcion', producto.Descripcion)
        producto.Precio = data.get('Precio', producto.Precio)
        producto.Stock = data.get('Stock', producto.Stock)
        producto.FechaIngreso = data.get('FechaIngreso', producto.FechaIngreso)

        db.session.commit()
        return jsonify({"success": True, "message": "Producto actualizado con éxito"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@producto.route('/delete/<int:Producto_ID>', methods=['DELETE'])
@login_required
def delete(Producto_ID):
    try:
        producto = Producto.query.get(Producto_ID)
        if not producto:
            return jsonify({"success": False, "message": "Producto no encontrado"}), 404

        db.session.delete(producto)
        db.session.commit()
        return jsonify({"success": True, "message": "Producto eliminado con éxito"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@producto.route('/desactivar/<int:Producto_ID>', methods=['POST'])
@login_required
def desactivar(Producto_ID):
    try:
        producto = Producto.query.get(Producto_ID)

        if producto is None:
            return jsonify({
                "success": False,
                "message": "Producto no encontrado."
            }), 404
        
        # Desactivar el cliente estableciendo 'activo' a False o 0
        producto.Estado = False  # o cliente.activo = 0, dependiendo de cómo esté definido en tu modelo
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Producto eliminado exitosamente."
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al eliminar el producto.",
            "error": str(e)
        }), 500
    
@producto.route('/getCodBarras', methods=['POST'])
@login_required
def getCodBarras():
    # Obtener el código de barras enviado en el cuerpo de la solicitud
    data = request.get_json()
    codigo_barras = data.get('codigo_barras')

    if not codigo_barras:
        return jsonify({"error": "Código de barras no proporcionado"}), 400

    # Buscar el producto en la base de datos
    producto = Producto.query.filter_by(CodigoBarras=codigo_barras).first()

    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    # Crear un diccionario con los datos del producto
    producto_data = {
        "Producto_ID": producto.Producto_ID,
        "CodigoBarras": producto.CodigoBarras,
        "Descripcion": producto.Descripcion,
        "Precio": float(producto.Precio),
        "Stock": producto.Stock,
        "FechaIngreso": producto.FechaIngreso.strftime('%Y-%m-%d'),
        "Estado": producto.Estado,
        "Cantidad": 1,  # Valor inicial por defecto
        "Total": float(producto.Precio)  # Cantidad * Precio (inicialmente 1)
    }

    return jsonify(producto_data), 200

@producto.route('/productos-mas-vendidos', methods=['GET'])
@login_required
def productos_mas_vendidos():
    try:
        from sqlalchemy import func
        ventas_productos = db.session.query(
            Producto.Producto_ID,
            Producto.Descripcion,
            func.sum(DetalleVenta.Cantidad).label('cantidad_vendida')
        ).join(DetalleVenta, Producto.Producto_ID == DetalleVenta.Producto_ID
        ).filter(Producto.Estado == True
        ).group_by(Producto.Producto_ID, Producto.Descripcion  # Se incluye Descripcion en el GROUP BY
        ).order_by(func.sum(DetalleVenta.Cantidad).desc()
        ).limit(5).all()

        result = []
        for prod in ventas_productos:
            result.append({
                "Producto_ID": prod.Producto_ID,
                "nombre": prod.Descripcion,
                "cantidad": prod.cantidad_vendida
            })
        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    
@producto.route('/stock-bajo', methods=['GET'])
@login_required
def stock_bajo():
    try:
        threshold = 10  # Define el umbral de stock bajo
        productos = Producto.query.filter(Producto.Estado == True, Producto.Stock < threshold).all()
        data = []
        for producto in productos:
            data.append({
                "Producto_ID": producto.Producto_ID,
                "nombre": producto.Descripcion,
                "stock": producto.Stock,
                "SubCategoria": producto.subcategoria.Nombre if producto.subcategoria else "",
                "CodigoBarras": producto.CodigoBarras,
                "Precio": float(producto.Precio),
                "FechaIngreso": producto.FechaIngreso.isoformat()
            })
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500