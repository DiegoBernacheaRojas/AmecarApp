// Función para inicializar la tabla de ventas
function inicializarTablaVentas() {
    $('#tablaVentas').DataTable({
        ajax: {
            url: '/api/venta/getAll', // URL de API para obtener ventas
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
                        <button type="button" class="btn btn-info btn-sm detallesBtn" data-id="${row.Venta_ID}" data-target="#modal-nuevo" data-toggle="modal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-clipboard2-minus-fill" viewBox="0 0 16 16">
                                <path d="M10 .5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5.5.5 0 0 1-.5.5.5.5 0 0 0-.5.5V2a.5.5 0 0 0 .5.5h5A.5.5 0 0 0 11 2v-.5a.5.5 0 0 0-.5-.5.5.5 0 0 1-.5-.5"/>
                                <path d="M4.085 1H3.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1h-.585q.084.236.085.5V2a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 2v-.5q.001-.264.085-.5M6 8h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1 0-1"/>
                            </svg>
                        </button>
                        <button type="button" class="btn btn-danger btn-sm eliminarBtn" data-id="${row.Venta_ID}" data-target="#modal-confirm" data-toggle="modal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
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

// Función para limpiar campos del modal de detalles
function limpiarModal() {
    $('#form')[0].reset();
    $('#documentoBoleta').hide();
    $('#documentoFactura').hide();
    $('#pagoDetalleRow').hide();
}

// Función principal para manejar eventos y lógica
async function main() {
    let ventaId = null;

    inicializarTablaVentas();

    // Evento para abrir detalles de venta
    $(document).on('click', '.detallesBtn', async function () {
        const ventaId = $(this).data('id');
        limpiarModal();
    
        try {
            const response = await fetch(`/api/venta/getId/${ventaId}`);
            if (!response.ok) throw new Error(`Error al obtener detalles: ${response.statusText}`);
    
            const data = await response.json();
            if (data.success) {
                const venta = data.data;
                
                // Información general
                $('#compradorVenta').val(venta.Comprador);
                $('#empleadoVenta').val(venta.Empleado_Nombre);
                $('#fechaVenta').val(venta.FechaVenta);
                $('#totalVenta').val(venta.Total);
                
                $('#tipoVentaInput').val(venta.TipoVenta);
                if (venta.TipoVenta.toUpperCase() === "FACTURA") {
                    $('#documentoFactura').show();
                    $('#documentoBoleta').hide();
                    $('#rucInput').val(venta.DatosDocumentoVenta.RUC || "");
                    $('#razonSocialInput').val(venta.DatosDocumentoVenta.Razon_Social || "");
                    $('#direccionInput').val(venta.DatosDocumentoVenta.Direccion || "");
                } else if (venta.TipoVenta.toUpperCase() === "BOLETA") {
                    $('#documentoBoleta').show();
                    $('#documentoFactura').hide();
                    $('#dniInput').val(venta.DatosDocumentoVenta.DNI || "");
                    $('#nombreInput').val(venta.DatosDocumentoVenta.Nombre || "");
                } else {
                    $('#documentoBoleta, #documentoFactura').hide();
                }
                
                // Tipo de Pago
                $('#tipoPagoInput').val(venta.TipoPago);  // Mostrar el tipo de pago
                $('#pagoDetalleRow').show();             // Mostrar la fila completa de pago
                
                const tp = venta.TipoPago.toLowerCase();
                
                if (tp === "efectivo") {
                    $('#efectivoBlock, #efectivoBlock2').show();
                    $('#tarjetaBlock, #celularBlock').hide();
                    $('#montoEntregadoInput').val(venta.DatosPago.MontoEntregado || "");
                    $('#vueltoInput').val(venta.DatosPago.Vuelto || "");
                } else if (tp === "tarjeta") {
                    $('#tarjetaBlock').show();
                    $('#efectivoBlock, #efectivoBlock2, #celularBlock').hide();
                    $('#numeroTransferenciaInput').val(venta.DatosPago.NumeroTransferencia || "");
                } else if (tp === "yape" || tp === "plin") {
                    $('#celularBlock').show();
                    $('#efectivoBlock, #efectivoBlock2, #tarjetaBlock').hide();
                    $('#numeroCelularInput').val(venta.DatosPago.NumeroCelular || "");
                } else {
                    // En caso de otro método, ocultar todos los bloques específicos
                    $('#efectivoBlock, #efectivoBlock2, #tarjetaBlock, #celularBlock').hide();
                }
                
                // Llenar tabla de productos
                const tbody = $('#tablaDetalles tbody');
                tbody.empty();
                venta.Detalles.forEach(detalle => {
                    tbody.append(`
                        <tr>
                            <td>${detalle.Producto_Descripcion}</td>
                            <td class="text-center">${detalle.PrecioUnitario}</td>
                            <td class="text-center">${detalle.Cantidad}</td>
                            <td class="text-center">${detalle.SubTotal}</td>
                        </tr>
                    `);
                });
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al mostrar detalles:", error);
        }
    });
    
    $(document).on('click', '.eliminarBtn', function () {
        ventaId = $(this).data('id');
    });

    $('#confirmarEliminar').click(async function () {
        try {
            const response = await fetch(`/api/venta/desactivar/${ventaId}`, { method: 'POST' }); // URL de API para eliminar venta
            if (response.ok) {
                $('#tablaVentas').DataTable().ajax.reload();
                $('#modal-confirm').modal('hide');
            } else {
    
                alert("Error al eliminar la venta.");
            }
        } catch (error) {
            console.error("Error al eliminar venta:", error);
        }
    
    });
}

// Ejecutar la función principal cuando el documento esté listo
$(document).ready(main);