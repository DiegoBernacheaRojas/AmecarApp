from flask import Blueprint, jsonify, request
from app import db
from ..models import Venta,Producto
from ..utils import login_required


venta = Blueprint('venta', __name__)
@venta.route('/buscar_producto', methods=['POST'])
@login_required('Gerente','Empleado')
def buscar_producto():
    """
    Ruta para buscar un producto por código de barras.
    """
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

# Ruta para calcular el total
@venta.route('/calcular_total', methods=['POST'])
@login_required('Gerente','Empleado')
def calcular_total():
    # Obtener datos enviados en la solicitud
    data = request.get_json()

    if not data or "codigo_barras" not in data or "cantidad" not in data:
        return jsonify({"error": "Debe proporcionar código de barras y cantidad"}), 400

    codigo_barras = data['codigo_barras']
    cantidad = data['cantidad']

    if not isinstance(cantidad, (int, float)) or cantidad <= 0:
        return jsonify({"error": "La cantidad debe ser un número mayor a 0"}), 400

    try:
        # Consulta en la base de datos utilizando el modelo Producto
        producto = Producto.query.filter_by(CodigoBarra=codigo_barras).first()

        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404

        # Calcular el total
        total = producto.PrecioUnitario * cantidad

        # Devolver la información del producto con el total calculado
        return jsonify({
            "CodigoBarra": producto.CodigoBarra,
            "Descripcion": producto.Descripcion,
            "PrecioUnitario": producto.PrecioUnitario,
            "Cantidad": cantidad,
            "Total": total
        })

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