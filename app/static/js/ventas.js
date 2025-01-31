// Función para inicializar la tabla
function inicializarTabla() {
    $('#tablaVentas').DataTable({
        ajax: {
            url: '/api/venta/getAll',
            dataSrc: 'data'
        },
        columns: [
            { data: 'Venta_ID' },
            { data: 'Cliente_ID' },
            { data: 'Empleado_ID' },
            { data: 'FechaVenta' },
            { data: 'Estado' },
            { data: 'TipoDocumento' },
            { data: 'MetodoPago' },
            { data: 'TotalVenta' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-info btn-sm consultarBtn" data-id="${row.Venta_ID}">Consultar</button>
                        <button class="btn btn-danger btn-sm anularBtn" data-id="${row.Venta_ID}">Anular</button>
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

// Función para llenar un select con datos de un API (si es necesario en la vista de ventas)
async function llenarSelect(apiUrl, selectId, valueField, textField) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Error al obtener datos: ${response.statusText}`);

        const data = await response.json();
        const selectElement = document.getElementById(selectId);

        if (data.success && Array.isArray(data.data)) {
            data.data.forEach(item => {
                const option = document.createElement("option");
                option.value = item[valueField];
                option.textContent = item[textField];
                selectElement.appendChild(option);
            });
        } else {
            console.error(`No se obtuvieron datos válidos para ${selectId}.`);
        }
    } catch (error) {
        console.error(`Error al llenar ${selectId}:`, error);
    }
}

// Función para limpiar el modal
function limpiarModal() {
    $('#clienteVenta').val('');
    $('#empleadoVenta').val('');
    $('#fechaVenta').val('');
    $('#totalVenta').val('');
    $('#detalleVenta').empty();
}

// Función principal para manejar eventos y lógica
async function main() {
    let ventaId = null;

    // Inicializar la tabla
    inicializarTabla();

    // Evento para abrir el modal de consulta
    $(document).on('click', '.consultarBtn', async function () {
        ventaId = $(this).data('id');
        
        try {
            const response = await fetch(`/api/venta/getId/${ventaId}`);
            if (!response.ok) throw new Error(`Error al obtener venta: ${response.statusText}`);

            const data = await response.json();
            if (data.success) {
                const venta = data.data;
                $('#clienteVenta').val(venta.Cliente_ID);
                $('#empleadoVenta').val(venta.Empleado_ID);
                $('#fechaVenta').val(venta.FechaVenta);
                $('#totalVenta').val(venta.TotalVenta);
                $('#detalleVenta').html(`<ul>${venta.detalle.map(item => `<li>${item}</li>`).join('')}</ul>`);

                $('#ventaModalLabel').text('Consultar Venta');
                $('#ventaModal').modal('show');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al consultar venta:", error);
        }
    });

    // Evento para anular venta
    $(document).on('click', '.anularBtn', function () {
        ventaId = $(this).data('id');
        $('#confirmarAnularModal').modal('show');
    });

    // Confirmar anulación
    $('#confirmarAnular').click(async function () {
        try {
            const response = await fetch(`/api/venta/anular/${ventaId}`, { method: 'POST' });
            if (response.ok) {
                $('#tablaVentas').DataTable().ajax.reload();
                $('#confirmarAnularModal').modal('hide');
                ventaId = null;
            } else {
                alert("Error al anular la venta.");
                ventaId = null;
            }
        } catch (error) {
            console.error("Error al anular venta:", error);
        }
    });

    // Evento para cerrar modales
    $(document).on('click', '.cerrarBtn', function () {
        limpiarModal();
        $('#ventaModal').modal('hide');
        $('#confirmarAnularModal').modal('hide');
        ventaId = null;
    });
}

// Ejecutar la función principal cuando el documento esté listo
$(document).ready(main);
