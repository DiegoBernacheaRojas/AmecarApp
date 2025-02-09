API_PERMISSIONS = {
    # APIs de cliente
    "/api/cliente/getAll": ["clientes"],
    "/api/cliente/getId": ["clientes"],
    "/api/cliente/register": ["clientes"],
    "/api/cliente/update": ["clientes"],
    "/api/cliente/delete": None,  # Bloqueado
    "/api/cliente/desactivar": ["clientes"],
    "/api/cliente/getRucODni": ["ventas"],

    # APIs de distrito
    "/api/distrito/getAll": ["clientes", "empleados"],

    # APIs de empleado
    "/api/empleado/getAll": ["empleados"],
    "/api/empleado/getId": ["empleados"],
    "/api/empleado/register": ["empleados"],
    "/api/empleado/update": ["empleados"],
    "/api/empleado/delete": None,  # Bloqueado
    "/api/empleado/desactivar": ["empleados"],

    # APIs de main (pantallas)
    "/index": ["home"],
    "/ventas": ["ventas"],
    "/clientes": ["clientes"],
    "/productos": ["productos"],
    "/detalleVentas": ["detalleVentas"],
    "/empleados": ["empleados"],
    "/roles": ["roles"],
    "/recuperarVentas": ["recuperarVentas"],

    # APIs de producto
    "/api/producto/getAll": ["productos", "ventas"],
    "/api/producto/getId": ["productos"],
    "/api/producto/register": ["productos"],
    "/api/producto/update": ["productos"],
    "/api/producto/delete": None,  # Bloqueado
    "/api/producto/desactivar": ["productos"],
    "/api/producto/getCodBarras": ["ventas"],
    
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
    "/api/venta/getAll": ["detalleVentas"],
    "/api/venta/getId": ["detalleVentas"],
    "/api/venta/register": ["ventas"],
    "/api/venta/delete": None,  # Bloqueado
    "/api/venta/desactivar": ["detalleVentas"],
    "/api/venta/activar": ["recuperarVentas"],
    "/api/venta/getDataSunat": ["ventas"],
    "/api/venta/savePdf": ["ventas"],

}