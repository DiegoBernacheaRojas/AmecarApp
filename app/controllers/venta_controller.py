from flask import Blueprint, jsonify, request, send_from_directory, session, make_response
from app import db
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from ..models import Venta, DetalleVenta, Cliente, Producto
from ..utils import login_required
import os
import requests
from dotenv import load_dotenv
from fpdf import FPDF
from datetime import datetime
import platform
import textwrap

load_dotenv()

# Obtener el token desde el .env
SUNAT_API_TOKEN = os.getenv("SUNAT_API_TOKEN")
API_BASE_URL = ""

# Importar librerías para imprimir
if platform.system() == "Windows":
    import win32print
    import win32api

venta = Blueprint('venta', __name__)

PDF_FOLDER = "/static/pdfs"

if not os.path.exists(PDF_FOLDER):
    print("Creando la carpeta PDF_FOLDER...")  # Debug
    os.makedirs(PDF_FOLDER)

# Obtener todas las ventas activas
@venta.route('/getAll', methods=['GET'])
@login_required
def getAll():
    try:
        ventas = Venta.query.filter_by(Estado=1).all()  # Filtra solo ventas activas
        result = []

        for venta in ventas:  # Itera sobre cada venta
            # Verificar si tiene Cliente_ID
            if venta.Cliente_ID is not None:
                result.append({
                    "Venta_ID": venta.Venta_ID,
                    "Comprador": venta.cliente.Nombre,
                    "NumDoc": venta.cliente.NumDoc,
                    "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                    "FechaVenta": venta.FechaVenta.isoformat(),
                    "TipoVenta": venta.TipoVenta,
                    "TipoPago": venta.TipoPago,
                    "Total": venta.Total,
                    "Estado": venta.Estado
                })
            else:
                # Dependiendo del tipo de venta, se maneja diferente
                if venta.TipoVenta.upper() == "BOLETA":
                    result.append({
                        "Venta_ID": venta.Venta_ID,
                        "Comprador": venta.DatosDocumentoVenta["Nombre"],
                        "NumDoc": venta.DatosDocumentoVenta["DNI"],
                        "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                        "FechaVenta": venta.FechaVenta.isoformat(),
                        "TipoVenta": venta.TipoVenta,
                        "TipoPago": venta.TipoPago,
                        "Total": venta.Total,
                        "Estado": venta.Estado
                    })
                elif venta.TipoVenta.upper() == "FACTURA":
                    result.append({
                        "Venta_ID": venta.Venta_ID,
                        "Comprador": venta.DatosDocumentoVenta["Razon_Social"],
                        "NumDoc": venta.DatosDocumentoVenta["RUC"],
                        "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                        "FechaVenta": venta.FechaVenta.isoformat(),
                        "TipoVenta": venta.TipoVenta,
                        "TipoPago": venta.TipoPago,
                        "Total": venta.Total,
                        "Estado": venta.Estado
                    })

        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Obtener todas las ventas desacrivadas
@venta.route('/getAllDesactivadas', methods=['GET'])
@login_required
def getAllDesactivadas():
    try:
        ventas = Venta.query.filter_by(Estado=0).all()  # Filtra solo ventas activas
        result = []

        for venta in ventas:  # Itera sobre cada venta
            # Verificar si tiene Cliente_ID
            if venta.Cliente_ID is not None:
                result.append({
                    "Venta_ID": venta.Venta_ID,
                    "Comprador": venta.cliente.Nombre,
                    "NumDoc": venta.cliente.NumDoc,
                    "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                    "FechaVenta": venta.FechaVenta.isoformat(),
                    "TipoVenta": venta.TipoVenta,
                    "TipoPago": venta.TipoPago,
                    "Total": venta.Total,
                    "Estado": venta.Estado
                })
            else:
                # Dependiendo del tipo de venta, se maneja diferente
                if venta.TipoVenta.upper() == "BOLETA":
                    result.append({
                        "Venta_ID": venta.Venta_ID,
                        "Comprador": venta.DatosDocumentoVenta["Nombre"],
                        "NumDoc": venta.DatosDocumentoVenta["DNI"],
                        "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                        "FechaVenta": venta.FechaVenta.isoformat(),
                        "TipoVenta": venta.TipoVenta,
                        "TipoPago": venta.TipoPago,
                        "Total": venta.Total,
                        "Estado": venta.Estado
                    })
                elif venta.TipoVenta.upper() == "FACTURA":
                    result.append({
                        "Venta_ID": venta.Venta_ID,
                        "Comprador": venta.DatosDocumentoVenta["Razon_Social"],
                        "NumDoc": venta.DatosDocumentoVenta["RUC"],
                        "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                        "FechaVenta": venta.FechaVenta.isoformat(),
                        "TipoVenta": venta.TipoVenta,
                        "TipoPago": venta.TipoPago,
                        "Total": venta.Total,
                        "Estado": venta.Estado
                    })

        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@venta.route('/getId/<int:Venta_ID>', methods=['GET'])
@login_required
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
        result = []
        if venta.Cliente_ID is not None:
            result = {  # Cambié los corchetes por llaves
                "Venta_ID": venta.Venta_ID,
                "Comprador": venta.cliente.Nombre,
                "NumDoc": venta.cliente.NumDoc,
                "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                "FechaVenta": venta.FechaVenta.isoformat(),
                "TipoVenta": venta.TipoVenta,
                "DatosDocumentoVenta": venta.DatosDocumentoVenta,
                "TipoPago": venta.TipoPago,
                "DatosPago": venta.DatosPago,
                "Total": venta.Total,
                "Detalles": detalles_result,
                "Estado": venta.Estado
            }
        else:
            # Dependiendo del tipo de venta, se maneja diferente
            if venta.TipoVenta.upper() == "BOLETA":
                result = {  # Cambié los corchetes por llaves
                    "Venta_ID": venta.Venta_ID,
                    "Comprador": venta.DatosDocumentoVenta["Nombre"],
                    "NumDoc": venta.DatosDocumentoVenta["DNI"],
                    "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                    "FechaVenta": venta.FechaVenta.isoformat(),
                    "TipoVenta": venta.TipoVenta,
                    "DatosDocumentoVenta": venta.DatosDocumentoVenta,
                    "TipoPago": venta.TipoPago,
                    "DatosPago": venta.DatosPago,
                    "Total": venta.Total,
                    "Detalles": detalles_result,
                    "Estado": venta.Estado
                }
            elif venta.TipoVenta.upper() == "FACTURA":
                result = {  # Cambié los corchetes por llaves
                    "Venta_ID": venta.Venta_ID,
                    "Comprador": venta.DatosDocumentoVenta["Razon_Social"],
                    "NumDoc": venta.DatosDocumentoVenta["RUC"],
                    "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                    "FechaVenta": venta.FechaVenta.isoformat(),
                    "TipoVenta": venta.TipoVenta,
                    "DatosDocumentoVenta": venta.DatosDocumentoVenta,
                    "TipoPago": venta.TipoPago,
                    "DatosPago": venta.DatosPago,
                    "Total": venta.Total,
                    "Detalles": detalles_result,
                    "Estado": venta.Estado
                }
        
        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
@venta.route('/delete/<int:Venta_ID>', methods=['DELETE'])
@login_required
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

@venta.route('/desactivar/<int:venta_id>', methods=['POST'])
@login_required
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

@venta.route('/activar/<int:venta_id>', methods=['POST'])
@login_required
def activar(venta_id):
    try:
        venta = Venta.query.get(venta_id)
        if not venta:
            return jsonify({"success": False, "message": "Venta no encontrada"}), 404
        
        venta.Estado = 1  # Cambia el estado a inactivo
        db.session.commit()
        return jsonify({"success": True, "message": "Venta activada correctamente"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
@venta.route('/getDataSunat', methods=['POST'])
@login_required
def getDataSunat():
    data = request.get_json()

    tipo = data.get("tipo")  # Puede ser "ruc" o "dni"
    numero = data.get("numero")  # El número de RUC o DNI

    # Validaciones básicas
    if tipo not in ["ruc", "dni"]:
        return jsonify({"success": False, "message": "Tipo inválido. Debe ser 'ruc' o 'dni'."}), 400
    if not numero or not numero.isdigit():
        return jsonify({"success": False, "message": "Número inválido."}), 400
     
    if tipo == "ruc":
        API_BASE_URL = "https://api.apis.net.pe/v2/sunat/ruc?numero="
    elif tipo == "dni":
        API_BASE_URL = "https://api.apis.net.pe/v2/reniec/dni?numero="
    else:
        return {"error": "Tipo inválido"}

    # Construir la URL de consulta
    url = f"{API_BASE_URL}{numero}"

    # Configurar los headers con el token Bearer y el Content-Type
    headers = {
        "Authorization": f"Bearer {SUNAT_API_TOKEN}",
        "Content-Type": "application/json"
    }


    try:
         # Hacer la solicitud GET a la API
        response = requests.get(url, headers=headers)

        # Verificar si la respuesta fue exitosa
        if response.status_code == 200:
            response_data = response.json()
        else:
            return {"error": f"Error en la consulta: {response.status_code}", "detalle": response.text}
        
        if response.status_code != 200 or not response_data:
            return jsonify({"success": False, "message": "No se encontraron datos."}), 404

        # Procesar la respuesta según el tipo
        if tipo == "dni":
            return jsonify({"success": True, "nombre": response_data.get('nombreCompleto', '')})

        elif tipo == "ruc":
            razon_social = response_data.get("razonSocial", "No disponible")
            direccion = response_data.get("direccion", "No disponible")
            return jsonify({"success": True, "razonSocial": razon_social, "direccion": direccion})

    except requests.exceptions.RequestException as e:
        return jsonify({"success": False, "message": "Error al conectar con la API", "error": str(e)}), 500
    
@venta.route('/register', methods=['POST'])
@login_required
def register():
    try:
        data = request.get_json()

        # Obtener datos principales de la venta
        tipo_venta = data.get("TipoVenta")  # "boleta" o "factura"
        datos_documento_venta = data.get("DatosDocumentoVenta")  # JSON con los datos de documento
        tipo_pago = data.get("TipoPago")
        datos_pago = data.get("DatosPago")
        estado = data.get("Estado", True)  # Por defecto, activo

        # Validar que se envíen los campos obligatorios
        if not all([ tipo_venta, datos_documento_venta, tipo_pago]):
            return jsonify({"success": False, "message": "Faltan datos obligatorios"}), 400

        # Validar estructura de DatosDocumentoVenta según el tipo de venta
        if tipo_venta.lower() == "boleta":
            if not all(["DNI" in datos_documento_venta, "Nombre" in datos_documento_venta]):
                return jsonify({"success": False, "message": "Estructura incorrecta para boleta"}), 400
        elif tipo_venta.lower() == "factura":
            if not all(["RUC" in datos_documento_venta, "Razon_Social" in datos_documento_venta, "Direccion" in datos_documento_venta]):
                return jsonify({"success": False, "message": "Estructura incorrecta para factura"}), 400
        else:
            return jsonify({"success": False, "message": "Tipo de venta no válido (Debe ser 'boleta' o 'factura')"}), 400

        # Buscar cliente por su número de documento
        num_documento = datos_documento_venta.get("DNI") if tipo_venta.lower() == "boleta" else datos_documento_venta.get("RUC")
        cliente = Cliente.query.filter_by(NumDoc=num_documento).first()
        cliente_id = cliente.Cliente_ID if cliente else None  # Si no existe, será NULL

        # Crear nueva venta
        nueva_venta = Venta(
            Cliente_ID=cliente_id,
            Empleado_ID=session.get('user_id', 'guest'),
            FechaVenta=datetime.today().date(),
            Total=0.00,  # Se calculará con los detalles
            Estado=estado,
            TipoVenta=tipo_venta,
            DatosDocumentoVenta=datos_documento_venta,
            TipoPago=tipo_pago,
            DatosPago=datos_pago
        )

        db.session.add(nueva_venta)
        db.session.flush()  # Para obtener el ID de la venta antes de hacer commit

        # Procesar los detalles de la venta
        detalles_venta = data.get("Detalles", [])  # Lista de productos
        total_venta = 0.00

        for detalle in detalles_venta:
            producto_id = detalle.get("Producto_ID")
            cantidad = detalle.get("Cantidad")
            precio_unitario = detalle.get("PrecioUnitario")

            if not all([producto_id, cantidad, precio_unitario]):
                return jsonify({"success": False, "message": "Datos de producto incompletos"}), 400

            # Obtener el producto de la base de datos
            producto = Producto.query.get(producto_id)

            if not producto:
                return jsonify({"success": False, "message": "Producto no encontrado"}), 404

            # Restar del stock
            producto.Stock -= cantidad

            subtotal = cantidad * precio_unitario
            total_venta += subtotal

            detalle_venta = DetalleVenta(
                Venta_ID=nueva_venta.Venta_ID,
                Producto_ID=producto_id,
                Cantidad=cantidad,
                PrecioUnitario=precio_unitario,
                SubTotal=subtotal,
                Estado=True
            )

            db.session.add(detalle_venta)

        # Actualizar el total de la venta
        nueva_venta.Total = total_venta
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Venta registrada exitosamente",
            "Venta_ID": nueva_venta.Venta_ID,
            "Total": nueva_venta.Total
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"success": False, "message": "Error al registrar la venta", "error": str(e)}), 500
    
@venta.route('/static/pdfs/<filename>')
def serve_pdf(filename):
    """ Servir los PDFs guardados desde la carpeta estática. """
    return send_from_directory(PDF_FOLDER, filename)

@venta.route('/savePdf/<int:idVenta>', methods=['GET'])
@login_required
def save_pdf(idVenta):
    # Consultar la venta en la base de datos
    venta = Venta.query.get(idVenta)
    if not venta:
        return jsonify({"success": False, "message": "Venta no encontrada"}), 404

    detalles = DetalleVenta.query.filter_by(Venta_ID=idVenta).all()
    if not detalles:
        return jsonify({"success": False, "message": "No hay detalles para esta venta"}), 404

    # Crear el PDF con formato de ticket
    pdf = FPDF('P', 'mm', (80, 150))
    pdf.set_margins(2, 2, 2)  # Reduce los márgenes para aprovechar mejor el espacio
    pdf.add_page()
    pdf.set_font("Arial", size=10)

    pdf.cell(76, 5, "AMECAR", ln=True, align="C")
    pdf.cell(76, 5, "RUC: numruc", ln=True, align="C")
    pdf.ln(2)  # Espacio pequeño

    # Tipo de documento
    if venta.TipoVenta.upper() == "BOLETA":
        pdf.cell(76, 5, f"BOLETA- {venta.Venta_ID}", ln=True, align="C")
    elif venta.TipoVenta.upper() == "FACTURA":
        pdf.cell(76, 5, f"FACTURA- {venta.Venta_ID}", ln=True, align="C")
    pdf.ln(5)
    # Función para dividir texto largo en líneas
    def dividir_texto(texto):
        pdf.multi_cell(76, 5, texto)  # Siempre usar multi_cell()

    # Información del cliente
    if venta.Cliente_ID is not None:
        if venta.TipoVenta.upper() == "BOLETA":
            dividir_texto(f"Nombre: {venta.cliente.Nombre}")
            dividir_texto(f"{venta.cliente.tipo_documento.Nombre}: {venta.cliente.NumDoc}")
        else:  # FACTURA
            dividir_texto(f"Razon social: {venta.cliente.Nombre}")
            dividir_texto(f"Dirección: {venta.cliente.Direccion}")
            dividir_texto(f"RUC: {venta.cliente.NumDoc}")
    else:
        if venta.TipoVenta.upper() == "BOLETA":
            dividir_texto(f"Nombre: {venta.DatosDocumentoVenta['Nombre']}")
            dividir_texto(f"DNI: {venta.DatosDocumentoVenta['DNI']}")
        else:  # FACTURA
            dividir_texto(f"Razon social: {venta.DatosDocumentoVenta['Razon_Social']}")
            dividir_texto(f"Dirección: {venta.DatosDocumentoVenta['Direccion']}")
            dividir_texto(f"RUC: {venta.DatosDocumentoVenta['RUC']}")

    # Fecha y Hora
    fecha_venta = venta.FechaVenta.strftime('%Y-%m-%d')
    hora_actual = datetime.now().strftime('%H:%M:%S')
    pdf.ln(5)
    pdf.cell(76, 5, f"Fecha: {fecha_venta} | Hora: {hora_actual}", ln=True)

    # Línea separadora completa
    pdf.cell(76, 5, "-" * 73, ln=True)

    # Cabecera de productos
    pdf.cell(36, 5, "Descripcion", border=0)
    pdf.cell(10, 5, "Cant", border=0, align="C")
    pdf.cell(15, 5, "Precio", border=0, align="C")
    pdf.cell(15, 5, "Subtotal", border=0, align="C")
    pdf.ln()

    # Listado de productos
    total = 0
    for item in detalles:
        nombre = item.producto.Descripcion if item.producto else "Producto desconocido"
        cantidad = item.Cantidad
        precio = item.PrecioUnitario
        subtotal = cantidad * precio
        total += subtotal

        # Imprimir primera línea del nombre
        nombre_lineas = [nombre[i:i+20] for i in range(0, len(nombre), 20)]
        pdf.cell(36, 5, nombre_lineas[0], border=0)
        pdf.cell(10, 5, str(cantidad), border=0, align="C")
        pdf.cell(15, 5, f"S/ {precio:.2f}", border=0, align="R")
        pdf.cell(15, 5, f"S/ {subtotal:.2f}", border=0, align="R")
        pdf.ln()

        # Imprimir líneas restantes del nombre
        for linea in nombre_lineas[1:]:
            pdf.cell(36, 5, linea, border=0)
            pdf.cell(10, 5, "", border=0)
            pdf.cell(15, 5, "", border=0)
            pdf.cell(15, 5, "", border=0)
            pdf.ln()

    # Línea separadora completa
    pdf.cell(76, 5, "-" * 73, ln=True)
    pdf.cell(76, 5, f"Total: S/ {total:.2f}", ln=True)

    pdf.cell(76, 5, f"Metodo de pago :{venta.TipoPago}", ln=True)
    pdf.ln(1)
    if venta.TipoPago.upper() == "EFECTIVO":
        pdf.cell(76, 5, f"Monto entregado: S/ {venta.DatosPago['MontoEntregado']}", ln=True)
        pdf.ln(1)
        pdf.cell(76, 5, f"Vuelto: S/ {venta.DatosPago['Vuelto']}", ln=True)

    elif venta.TipoPago.upper() == "TARJETA":
        pdf.cell(76, 5, f"Numero de Transferencia: {venta.DatosPago['NumeroTransferencia']}", ln=True)

    elif venta.TipoPago.upper() in ["YAPE", "PLIN"]:
        pdf.cell(76, 5, f"Numero de celular: {venta.DatosPago['NumeroCelular']}", ln=True)
    pdf.ln(5)
    pdf.cell(76, 5, "*" * 76, ln=True, align="C")

    pdf.cell(76, 5, "Gracias por su compra", ln=True, align="C")

    pdf.cell(76, 5, "*" * 76, ln=True, align="C")

    pdf_filename = f"boleta_{idVenta}.pdf"
    pdf_path = os.path.join(PDF_FOLDER, pdf_filename)
    pdf.output(pdf_path)

    # Enviar a imprimir automáticamente (descomentar si se necesita)
    imprimir_pdf(pdf_path)

    return jsonify({
        "success": True,
        "message": "PDF guardado e impreso",
        "pdf_url": f"/api/venta/static/pdfs/{pdf_filename}"
    }), 200

def imprimir_pdf(pdf_path):
    """ Función para imprimir automáticamente el PDF en Windows (descomentar si se usa). """
    try:
        os.startfile(pdf_path, "print")
    except Exception as e:
        print(f"Error al imprimir: {e}")
    """ Función para imprimir el PDF automáticamente en la impresora predeterminada """

    if platform.system() == "Windows":
        try:
            printer_name = win32print.GetDefaultPrinter()  # Obtener la impresora predeterminada
            win32api.ShellExecute(0, "print", pdf_path, f'/d:"{printer_name}"', ".", 0)
        except Exception as e:
            print(f"Error al imprimir en Windows: {e}")

@venta.route('/getAllWithFilter', methods=['POST'])
@login_required
def getAllWithFilter():
    data = request.get_json()

    # Parámetros recibidos desde el frontend
    check_todo        = data.get('checkTodo', False)
    filtro_tipo       = data.get('filtroTipo')      # "cliente", "producto" o "empleado"
    selected_ids      = data.get('selectedIds', [])
    fecha_inicio_str  = data.get('fechaInicio')
    fecha_fin_str     = data.get('fechaFin')
    check_boleta      = data.get('checkBoleta', False)
    check_factura     = data.get('checkFactura', False)

    # Iniciar la consulta filtrando solo las ventas activas (Estado=1)
    query = Venta.query.filter_by(Estado=1)

    # Filtrado por fecha
    if fecha_inicio_str:
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').date()
            query = query.filter(Venta.FechaVenta >= fecha_inicio)
        except Exception as e:
            return jsonify({'success': False, 'message': 'FechaInicio inválida'}), 400

    if fecha_fin_str:
        try:
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d').date()
            query = query.filter(Venta.FechaVenta <= fecha_fin)
        except Exception as e:
            return jsonify({'success': False, 'message': 'FechaFin inválida'}), 400

    # Filtrado por Tipo de Venta (boleta y/o factura)
    tipo_venta_filter = []
    if check_boleta:
        tipo_venta_filter.append('Boleta')
    if check_factura:
        tipo_venta_filter.append('Factura')
    if tipo_venta_filter:
        query = query.filter(Venta.TipoVenta.in_(tipo_venta_filter))
    
    # Si "Todos" está marcado, se ignoran los filtros del select;
    # de lo contrario, se filtra según el tipo (cliente, empleado o producto) y los IDs seleccionados.
    if not check_todo and selected_ids:
        if filtro_tipo == "cliente":
            query = query.filter(Venta.Cliente_ID.in_(selected_ids))
        elif filtro_tipo == "empleado":
            query = query.filter(Venta.Empleado_ID.in_(selected_ids))
        elif filtro_tipo == "producto":
            query = query.filter(Venta.detalles.any(DetalleVenta.Producto_ID.in_(selected_ids)))

    # Ejecutar la consulta
    ventas = query.all()

    # Formatear la respuesta de la misma forma que en getAll
    result = []
    for venta in ventas:
        if venta.Cliente_ID is not None:
            result.append({
                "Venta_ID": venta.Venta_ID,
                "Comprador": venta.cliente.Nombre,
                "NumDoc": venta.cliente.NumDoc,
                "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                "FechaVenta": venta.FechaVenta.isoformat(),
                "TipoVenta": venta.TipoVenta,
                "TipoPago": venta.TipoPago,
                "Total": venta.Total,
                "Estado": venta.Estado
            })
        else:
            # Si no tiene Cliente_ID, se formatea según el tipo de venta
            if venta.TipoVenta.upper() == "BOLETA":
                result.append({
                    "Venta_ID": venta.Venta_ID,
                    "Comprador": venta.DatosDocumentoVenta.get("Nombre"),
                    "NumDoc": venta.DatosDocumentoVenta.get("DNI"),
                    "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                    "FechaVenta": venta.FechaVenta.isoformat(),
                    "TipoVenta": venta.TipoVenta,
                    "TipoPago": venta.TipoPago,
                    "Total": venta.Total,
                    "Estado": venta.Estado
                })
            elif venta.TipoVenta.upper() == "FACTURA":
                result.append({
                    "Venta_ID": venta.Venta_ID,
                    "Comprador": venta.DatosDocumentoVenta.get("Razon_Social"),
                    "NumDoc": venta.DatosDocumentoVenta.get("RUC"),
                    "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                    "FechaVenta": venta.FechaVenta.isoformat(),
                    "TipoVenta": venta.TipoVenta,
                    "TipoPago": venta.TipoPago,
                    "Total": venta.Total,
                    "Estado": venta.Estado
                })

    return jsonify({"success": True, "data": result}), 200

@venta.route('/printPdf', methods=['POST'])
@login_required
def printPdf():
    data = request.get_json()

    # Parámetros recibidos desde el frontend
    check_todo        = data.get('checkTodo', False)
    filtro_tipo       = data.get('filtroTipo')      # "cliente", "producto" o "empleado"
    selected_ids      = data.get('selectedIds', [])
    fecha_inicio_str  = data.get('fechaInicio')
    fecha_fin_str     = data.get('fechaFin')
    check_boleta      = data.get('checkBoleta', False)
    check_factura     = data.get('checkFactura', False)

    # Iniciar la consulta filtrando solo ventas activas (Estado=1)
    query = Venta.query.filter_by(Estado=1)

    # Filtrado por fecha
    if fecha_inicio_str:
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').date()
            query = query.filter(Venta.FechaVenta >= fecha_inicio)
        except Exception as e:
            return jsonify({'success': False, 'message': 'FechaInicio inválida'}), 400

    if fecha_fin_str:
        try:
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d').date()
            query = query.filter(Venta.FechaVenta <= fecha_fin)
        except Exception as e:
            return jsonify({'success': False, 'message': 'FechaFin inválida'}), 400

    # Filtrado por Tipo de Venta (Boleta y/o Factura)
    tipo_venta_filter = []
    if check_boleta:
        tipo_venta_filter.append('Boleta')
    if check_factura:
        tipo_venta_filter.append('Factura')
    if tipo_venta_filter:
        query = query.filter(Venta.TipoVenta.in_(tipo_venta_filter))
    
    # Filtrado por elementos seleccionados (si "Todos" no está marcado)
    if not check_todo and selected_ids:
        if filtro_tipo == "cliente":
            query = query.filter(Venta.Cliente_ID.in_(selected_ids))
        elif filtro_tipo == "empleado":
            query = query.filter(Venta.Empleado_ID.in_(selected_ids))
        elif filtro_tipo == "producto":
            query = query.filter(Venta.detalles.any(DetalleVenta.Producto_ID.in_(selected_ids)))
    
    # Ejecutar la consulta
    ventas = query.all()

    # Formatear los datos al estilo de getAll
    result = []
    for venta in ventas:
        if venta.Cliente_ID is not None:
            result.append({
                "Venta_ID": venta.Venta_ID,
                "Comprador": venta.cliente.Nombre,
                "NumDoc": venta.cliente.NumDoc,
                "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                "FechaVenta": venta.FechaVenta.isoformat(),
                "TipoVenta": venta.TipoVenta,
                "TipoPago": venta.TipoPago,
                "Total": str(venta.Total),  # Convertir a cadena si es necesario
                "Estado": venta.Estado
            })
        else:
            if venta.TipoVenta.upper() == "BOLETA":
                result.append({
                    "Venta_ID": venta.Venta_ID,
                    "Comprador": venta.DatosDocumentoVenta.get("Nombre"),
                    "NumDoc": venta.DatosDocumentoVenta.get("DNI"),
                    "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                    "FechaVenta": venta.FechaVenta.isoformat(),
                    "TipoVenta": venta.TipoVenta,
                    "TipoPago": venta.TipoPago,
                    "Total": str(venta.Total),
                    "Estado": venta.Estado
                })
            elif venta.TipoVenta.upper() == "FACTURA":
                result.append({
                    "Venta_ID": venta.Venta_ID,
                    "Comprador": venta.DatosDocumentoVenta.get("Razon_Social"),
                    "NumDoc": venta.DatosDocumentoVenta.get("RUC"),
                    "Empleado_Nombre": venta.empleado.Nombres + " " + venta.empleado.Apellidos,
                    "FechaVenta": venta.FechaVenta.isoformat(),
                    "TipoVenta": venta.TipoVenta,
                    "TipoPago": venta.TipoPago,
                    "Total": str(venta.Total),
                    "Estado": venta.Estado
                })

    # Crear PDF en orientación horizontal
    pdf = FPDF('L', 'mm', 'A4')
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Reporte de Ventas", ln=True, align="C")
    pdf.ln(10)

    # Configurar la fuente para la tabla
    pdf.set_font("Arial", "B", 10)

    # Cabeceras de la tabla
    headers = ["Comprador", "N° Documento", "Empleado", "Fecha de Venta", "Tipo de Venta", "Tipo de Pago", "Total"]
    col_widths = [80, 30, 50, 35, 30, 30, 20]  # Ancho de columnas
    row_height = 8  # Altura base de la celda

    # Dibujar cabeceras
    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], row_height, header, border=1, align="C")
    pdf.ln()

    # Configurar fuente para los datos
    pdf.set_font("Arial", "", 10)

    # Inicializar suma total
    total_general = 0

    # Función para calcular la altura de la fila
    def get_row_height(row_data, col_widths, base_height):
        max_lines = 1
        for i, text in enumerate(row_data):
            wrapped_text = textwrap.wrap(text, width=int(col_widths[i] / 2.5))  # Ajustar el texto al ancho de la celda
            lines = len(wrapped_text)  # Contar cuántas líneas ocupa
            max_lines = max(max_lines, lines)  # Tomar el mayor número de líneas en la fila
        return max_lines * base_height  # Altura total de la fila

    # Dibujar filas con datos de ventas
    for venta in result:
        row_data = [
            str(venta["Comprador"]),
            str(venta["NumDoc"]),
            str(venta["Empleado_Nombre"]),
            str(venta["FechaVenta"]),
            str(venta["TipoVenta"]),
            str(venta["TipoPago"]),
            f"{float(venta['Total']):.2f}"
        ]

        # Calcular la altura máxima de la fila
        max_height = get_row_height(row_data, col_widths, row_height)

        # Guardar la posición Y actual
        y_position = pdf.get_y()

        # Dibujar cada celda asegurando que todas tengan la misma altura
        for i, text in enumerate(row_data):
            x_position = pdf.get_x()
            pdf.multi_cell(col_widths[i], row_height, text, border=1, align="L")
            pdf.set_xy(x_position + col_widths[i], y_position)  # Restaurar la posición en X

        pdf.ln(max_height)  # Saltar a la siguiente fila

        # Sumar al total general
        total_general += float(venta["Total"])

    # Dibujar fila del total general
    pdf.set_font("Arial", "B", 12)
    pdf.cell(sum(col_widths[:-1]), row_height, "TOTAL GENERAL:", border=1, align="R")
    pdf.cell(col_widths[-1], row_height, f"{total_general:.2f}", border=1, align="R")

    # Generar el PDF en memoria
    pdf_output = pdf.output(dest='S').encode('latin1')

    response = make_response(pdf_output)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=ventas_report.pdf'
    return response