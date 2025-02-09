// Función para inicializar la tabla de ventas
function inicializarTablaVentas() {
    $('#tablaVentas').DataTable({
        ajax: {
            url: '/api/venta/getAllDesactivadas', // URL de API para obtener ventas
            dataSrc: 'data'
        },
        columns: [
            { data: 'Venta_ID' },
            { data: 'Comprador' },
            { data: 'NumDoc' },
            { data: 'Empleado_Nombre' },
            { data: 'TipoPago' },
            { data: 'TipoVenta' },
            { data: 'Total' },
            { data: 'FechaVenta' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button type="button" class="btn btn-warning btn-sm btn-recuperar" data-id="${row.Venta_ID}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                            </svg>
                        </button>
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
    });
}

// Delegar evento a los botones generados dinámicamente
$(document).on('click', '.btn-recuperar', async function () {
    const ventaId = $(this).data('id'); // Obtener ID de la venta desde el botón
    try {
        const response = await fetch(`/api/venta/activar/${ventaId}`, { method: 'POST' });
        if (response.ok) {
            toastr.success("Venta activada correctamente.");
            $('#tablaVentas').DataTable().ajax.reload();
        } else {
            toastr.error("Error al recuperar la venta.");
        }
    } catch (error) {
        toastr.error("Error al recuperar venta:", error);
    }
});

// Ejecutar la función cuando el documento esté listo
$(document).ready(function () {
    inicializarTablaVentas();
});