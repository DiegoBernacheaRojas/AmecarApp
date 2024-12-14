$(document).ready(function () {
    let productoId = null; // Variable global para almacenar el ID del producto a editar/eliminar

    // Inicialización de la tabla
    $('#tablaProductos').DataTable({
        ajax: {
            url: '/api/producto/getAll', // Endpoint que devuelve los datos en formato JSON
            dataSrc: 'data', // Ruta donde están los datos dentro del JSON de respuesta
        },
        columns: [
            { data: 'Producto_ID' },
            { data: 'SubCategoria' },
            { data: 'CodigoBarras' },
            { data: 'Descripcion' },
            { data: 'Precio' },
            { data: 'Stock' },
            { data: 'FechaIngreso' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-primary btn-sm editarBtn" data-id="${row.Producto_ID}">Editar</button>
                        <button class="btn btn-danger btn-sm eliminarBtn" data-id="${row.Producto_ID}">Eliminar</button>
                    `;
                }
            }
        ],
        language: {
            decimal: ",",
            thousands: ".",
            lengthMenu: "Mostrar _MENU_ registros por página",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros en total)",
            search: "Buscar:",
            zeroRecords: "No se encontraron registros coincidentes",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último"
            },
            aria: {
                sortAscending: ": activar para ordenar la columna de manera ascendente",
                sortDescending: ": activar para ordenar la columna de manera descendente"
            }
        },
        responsive: true, // Activar diseño responsivo
        paging: true, // Habilitar paginación (es la configuración predeterminada)
        lengthChange: true, // Permitir cambiar el número de filas por página
        ordering: true, // Habilitar ordenación por columnas
        searching: true, // Habilitar búsqueda
        autoWidth: false, // Evitar ajuste automático del ancho
        scrollX: true, 
    });

    // Función para limpiar el modal
    function limpiarModal() {
        $('#nombreProducto').val('');
        $('#descripcionProducto').val('');
        $('#precioProducto').val('');
        $('#stockProducto').val('');
    }

    // Abrir modal para registrar un nuevo producto
    $(document).on('click', '.nuevoBtn', function () {
        limpiarModal();
        $('#productoModalLabel').text('Registrar Producto');
        $('#productoModal').modal('show');
    });

    // Abrir modal para editar producto
    $(document).on('click', '.editarBtn', function () {
        productoId = $(this).data('id');

        // Realizar una solicitud AJAX para obtener los datos del producto
        $.ajax({
            url: `/api/producto/get/${productoId}`,
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    const producto = response.data;
                    $('#subcategoriaProducto').val(producto.Subcategoria);
                    $('#descripcionProducto').val(producto.Descripcion);
                    $('#precioProducto').val(producto.Precio);
                    $('#stockProducto').val(producto.Stock);

                    $('#productoModalLabel').text('Editar Producto');
                    $('#productoModal').modal('show');
                } else {
                    alert('Error al obtener los datos del producto.');
                }
            },
            error: function () {
                alert('Error en la solicitud.');
            }
        });
    });

    // Acción para guardar o actualizar producto
    $('#guardarProducto').click(function () {
        const productoData = {
            Nombre: $('#subcategoriaProducto').val(),
            Descripcion: $('#descripcionProducto').val(),
            Precio: $('#precioProducto').val(),
            Stock: $('#stockProducto').val()
        };

        // Validar campos requeridos
        if (!productoData.Subcategoria || !productoData.Precio || !productoData.Stock) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        if (productoId) {
            // Editar producto
            $.ajax({
                url: `/api/producto/update/${productoId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(productoData),
                success: function (response) {
                    if (response.success) {
                        $('#tablaProductos').DataTable().ajax.reload();
                        $('#productoModal').modal('hide');
                        alert('Producto editado con éxito.');
                    } else {
                        alert(`Error al editar el producto: ${response.message}`);
                    }
                },
                error: function () {
                    alert('Error en la solicitud.');
                }
            });
        } else {
            // Agregar nuevo producto
            $.ajax({
                url: '/api/producto/register',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(productoData),
                success: function (response) {
                    if (response.success) {
                        $('#tablaProductos').DataTable().ajax.reload();
                        limpiarModal();
                        $('#productoModal').modal('hide');
                        alert('Producto registrado con éxito.');
                    } else {
                        alert(`Error al registrar el producto: ${response.message}`);
                    }
                },
                error: function () {
                    alert('Error en la solicitud.');
                }
            });
        }
    });

    // Abrir modal de confirmación para eliminar producto
    $(document).on('click', '.eliminarBtn', function () {
        productoId = $(this).data('id');
        $('#confirmarEliminarModal').modal('show');
    });

    // Confirmar eliminación
    $('#confirmarEliminar').click(function () {
        $.ajax({
            url: `/api/producto/delete/${productoId}`,
            type: 'DELETE',
            success: function (response) {
                if (response.success) {
                    $('#tablaProductos').DataTable().ajax.reload();
                    $('#confirmarEliminarModal').modal('hide');
                    alert('Producto eliminado con éxito.');
                } else {
                    alert('Error al eliminar el producto.');
                }
            },
            error: function () {
                alert('Error en la solicitud.');
            }
        });
    });

    // Cerrar modales
    $(document).on('click', '.cerrarBtn', function () {
        limpiarModal();
        $('#productoModal').modal('hide');
        $('#confirmarEliminarModal').modal('hide');
    });

    $(document).on('click', '.xBtn', function () {
        limpiarModal();
        $('#productoModal').modal('hide');
        $('#confirmarEliminarModal').modal('hide');
    });
    $('#buscarProducto, #filtrarSubcategoria, #filtrarEstado').on('change', function () {
        $('#tablaProductos').DataTable().ajax.reload();
    });
});
