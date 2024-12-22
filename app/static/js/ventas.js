// Función para inicializar la tabla de ventas
function inicializarTablaVentas() {
    $('#tablaVentas').DataTable({
        ajax: {
            url: '/api/venta/getAll', // URL de API para obtener ventas
            dataSrc: 'data'
        },
        columns: [
            { data: 'Venta_ID' },
            { data: 'Cliente_Nombre' },
            { data: 'Empleado_Nombre' },
            { data: 'Total' },
            { data: 'FechaVenta' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-info btn-sm detallesBtn" data-id="${row.Venta_ID}">Detalles</button>
                        <button class="btn btn-danger btn-sm eliminarBtn" data-id="${row.Venta_ID}">Eliminar</button>
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
        responsive: true,
        paging: true,
        lengthChange: true,
        ordering: true,
        searching: true,
        autoWidth: false,
        scrollX: true,
    });
}

// Función para limpiar campos del modal de detalles
function limpiarModalDetalles() {
    $('#clienteVenta').val('');
    $('#empleadoVenta').val('');
    $('#fechaVenta').val('');
    $('#tablaDetalles tbody').empty();
    $('#totalVenta').val('');
}

// Función para mostrar los detalles de una venta
async function mostrarDetallesVenta(ventaId) {
    try {
        const response = await fetch(`/api/venta/getId/${ventaId}`); // URL de API para obtener detalles de venta
        if (!response.ok) throw new Error(`Error al obtener detalles: ${response.statusText}`);

        const data = await response.json();
        if (data.success) {
            const venta = data.data;
            $('#clienteVenta').val(venta.Cliente_Nombre);
            $('#empleadoVenta').val(venta.Empleado_Nombre);
            $('#fechaVenta').val(venta.FechaVenta);

            // Agregar productos a la tabla de detalles
            const tbody = $('#tablaDetalles tbody');
            tbody.empty();
            venta.Detalles.forEach(detalle => {
                tbody.append(`
                    <tr>
                        <td>${detalle.Producto_Descripcion}</td>
                        <td>${detalle.PrecioUnitario}</td>
                        <td>${detalle.Cantidad}</td>
                        <td>${detalle.SubTotal}</td>
                    </tr>
                `);
            });

            $('#totalVenta').val(venta.Total);
            $('#Modal').modal('show');
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Error al mostrar detalles:", error);
    }
}

// Función para confirmar eliminación de una venta
async function eliminarVenta(ventaId) {
    try {
        const response = await fetch(`/api/venta/desactivar/${ventaId}`, { method: 'POST' }); // URL de API para eliminar venta
        if (response.ok) {
            $('#tablaVentas').DataTable().ajax.reload();
            $('#confirmarEliminarModal').modal('hide');
        } else {
            alert("Error al eliminar la venta.");
        }
    } catch (error) {
        console.error("Error al eliminar venta:", error);
    }
}

// Función principal para manejar eventos y lógica
async function main() {
    let ventaId = null;

    // Inicializar la tabla
    inicializarTablaVentas();

    // Evento para abrir detalles de venta
    $(document).on('click', '.detallesBtn', function () {
        ventaId = $(this).data('id');
        limpiarModalDetalles();
        mostrarDetallesVenta(ventaId);
    });

    // Evento para abrir el modal de confirmación de eliminación
    $(document).on('click', '.eliminarBtn', function () {
        ventaId = $(this).data('id');
        $('#confirmarEliminarModal').modal('show');
    });

    // Confirmar eliminación
    $('#confirmarEliminar').click(function () {
        eliminarVenta(ventaId);
    });

    // Evento para cerrar modales
    $(document).on('click', '.cerrarBtn', function () {
        $('#Modal').modal('hide');
        $('#confirmarEliminarModal').modal('hide');
    });
}

// Ejecutar la función principal cuando el documento esté listo
$(document).ready(main);
