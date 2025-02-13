API_PERMISSIONS = {
    # APIs de cliente
    "/api/cliente/getAll": ["clientes", "reporteVentas"],
    "/api/cliente/getId": ["clientes"],
    "/api/cliente/register": ["clientes"],
    "/api/cliente/update": ["clientes"],
    "/api/cliente/delete": None,  # Bloqueado
    "/api/cliente/desactivar": ["clientes"],
    "/api/cliente/getRucODni": ["ventas"],
    "/api/cliente/clientes-frecuentes": ["home"],

    # APIs de distrito
    "/api/distrito/getAll": ["clientes", "empleados"],

    # APIs de empleado
    "/api/empleado/getAll": ["empleados","reporteVentas"],
    "/api/empleado/getId": ["empleados"],
    "/api/empleado/register": ["empleados"],
    "/api/empleado/update": ["empleados"],
    "/api/empleado/delete": None,  # Bloqueado
    "/api/empleado/desactivar": ["empleados"],
    "/api/empleado/mejor-empleado": ["home"],

    # APIs de main (pantallas)
    "/index": ["home"],
    "/ventas": ["ventas"],
    "/clientes": ["clientes"],
    "/productos": ["productos"],
    "/detalleVentas": ["detalleVentas"],
    "/empleados": ["empleados"],
    "/roles": ["roles"],
    "/recuperarVentas": ["recuperarVentas"],
    "/reporteVentas": ["reporteVentas"],

    # APIs de producto
    "/api/producto/getAll": ["productos", "ventas", "reporteVentas"],
    "/api/producto/getId": ["productos"],
    "/api/producto/register": ["productos"],
    "/api/producto/update": ["productos"],
    "/api/producto/delete": None,  # Bloqueado
    "/api/producto/desactivar": ["productos"],
    "/api/producto/getCodBarras": ["ventas"],
    "/api/producto/productos-mas-vendidos": ["home"],
    "/api/producto/stock-bajo": ["home"],
    
    # APIs de rol
    "/api/rol/getAll": ["empleados","roles"],
    "/api/rol/getId": ["roles"],
    "/api/rol/register": ["roles"],
    "/api/rol/update": ["roles"],
    "/api/rol/desactivar": ["roles"],

    # APIs de sexo
    "/api/sexo/getAll": ["empleados", "clientes"],  # "Clientes" corregido a "clientes"

    # APIs de subcategoria
    "/api/subcategoria/getAll": ["productos"],

    # APIs de tipo de documento
    "/api/tipodocumento/getAll": ["empleados", "clientes"],  # "Clientes" corregido a "clientes"

    # APIs de venta
    "/api/venta/getAllDesactivadas": ["recuperarVentas"],
    "/api/venta/getAll": ["detalleVentas", "reporteVentas"],
    "/api/venta/getId": ["detalleVentas"],
    "/api/venta/register": ["ventas"],
    "/api/venta/delete": None,  # Bloqueado
    "/api/venta/desactivar": ["detalleVentas"],
    "/api/venta/activar": ["recuperarVentas"],
    "/api/venta/getDataSunat": ["ventas"],
    "/api/venta/savePdf": ["ventas"],
    "/api/venta/getAllWithFilter": ["reporteVentas"],
    "/api/venta/printPdf": ["reporteVentas"],
    "/api/venta/ultimas-ventas": ["home"],
    "/api/venta/ventas-por-mes": ["home"],

}