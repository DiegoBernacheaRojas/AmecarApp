// Función para inicializar la tabla
function inicializarTabla() {
    $('#tablaClientes').DataTable({
        ajax: {
            url: '/api/cliente/getAll',
            dataSrc: 'data'
        },
        columns: [
            { data: 'Cliente_ID' },
            { data: 'Nombre' },
            { data: 'TipoCliente' },
            { data: 'TipoDoc_ID' },
            { data: 'NumDoc' },
            { data: 'Direccion' },
            { data: 'Distrito' },
            { data: 'Sexo' },
            { data: 'Correo' },
            { data: 'Telefono' },
            { data: 'FechaNacimiento' },
            { data: 'FechaCreacion' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-primary btn-sm editarBtn" data-id="${row.Cliente_ID}">Editar</button>
                        <button class="btn btn-danger btn-sm eliminarBtn" data-id="${row.Cliente_ID}">Eliminar</button>
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

// Función para llenar un select con datos de un API
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
    $('#nombreCliente').val('');
    $('#fechaNacimiento').val('');
    $('#numeroDocumento').val('');
    $('#direccionCliente').val('');
    $('#telefonoCliente').val('');
    $('#correoCliente').val('');
}

// Función principal para manejar eventos y lógica
async function main() {
    let clienteId = null;

    // Inicializar la tabla
    inicializarTabla();

    // Llenar selects
    await llenarSelect("/api/tipodocumento/getAll", "tipoDocumento", "TipoDoc_ID", "Nombre");
    await llenarSelect("/api/distrito/getAll", "distritonCliente", "Distrito_ID", "Nombre");
    await llenarSelect("/api/sexo/getAll", "sexoCliente", "Sexo_ID", "Nombre");

    // Evento para abrir el modal de registro
    $(document).on('click', '.nuevoBtn', function () {
        limpiarModal();
        $('#clienteModalLabel').text('Registrar Cliente');
        $('#guardarCliente').text('Registrar');
        $('#clienteModal').modal('show');
    });

    // Evento para cerrar modales
    $(document).on('click', '.cerrarBtn', function () {
        limpiarModal();
        $('#clienteModal').modal('hide');
        $('#confirmarEliminarModal').modal('hide');
        clienteId = null;
    });

    // Evento para editar cliente
    $(document).on('click', '.editarBtn', async function () {
        clienteId = $(this).data('id');
        $('#clienteModalLabel').text('Editar Cliente');
        $('#guardarCliente').text('Actualizar');

        try {
            const response = await fetch(`/api/cliente/getId/${clienteId}`);
            if (!response.ok) throw new Error(`Error al obtener cliente: ${response.statusText}`);

            const data = await response.json();
            if (data.success) {
                const cliente = data.data;
                $('#nombreCliente').val(cliente.Nombre);
                $('#tipoCliente').val(cliente.TipoCliente);
                $('#tipoDocumento').val(cliente.TipoDoc_ID);
                $('#numeroDocumento').val(cliente.NumDoc);
                $('#sexoCliente').val(cliente.Sexo);
                $('#direccionCliente').val(cliente.Direccion);
                $('#distritonCliente').val(cliente.Distrito);
                $('#telefonoCliente').val(cliente.Telefono);
                $('#correoCliente').val(cliente.Correo);
                $('#fechaNacimiento').val(cliente.FechaNacimiento);

                $('#clienteModal').modal('show');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al editar cliente:", error);
        }
    });

    // Evento para eliminar cliente
    $(document).on('click', '.eliminarBtn', function () {
        clienteId = $(this).data('id');
        $('#confirmarEliminarModal').modal('show');
    });

    // Confirmar eliminación
    $('#confirmarEliminar').click(async function () {
        try {
            const response = await fetch(`/api/cliente/desactivar/${clienteId}`, { method: 'POST' });
            if (response.ok) {
                $('#tablaClientes').DataTable().ajax.reload();
                $('#confirmarEliminarModal').modal('hide');
                clienteId = null;
            } else {
                alert("Error al eliminar el cliente.");
                clienteId = null;
            }
        } catch (error) {
            console.error("Error al eliminar cliente:", error);
        }
    });

    // Guardar cliente
    $('#guardarCliente').click(async function () {
        const clienteData = {
            Sexo_ID: $('#sexoCliente').val(),
            Distrito_Codigo: $('#distritonCliente').val(),
            Nombre: $('#nombreCliente').val(),
            TipoCliente: $('#tipoCliente').val(),
            TipoDoc_ID: $('#tipoDocumento').val(),
            NumDoc: $('#numeroDocumento').val(),
            Telefono: $('#telefonoCliente').val(),
            Correo: $('#correoCliente').val(),
            Direccion: $('#direccionCliente').val(),
            FechaNacimiento: $('#fechaNacimiento').val()
        };

        if (!clienteData.Nombre || !clienteData.NumDoc || !clienteData.Telefono || !clienteData.Correo) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }

        const method = clienteId ? 'PUT' : 'POST';
        const url = clienteId ? `/api/cliente/update/${clienteId}` : '/api/cliente/register';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            });

            const data = await response.json();
            if (data.success) {
                $('#tablaClientes').DataTable().ajax.reload();
                limpiarModal();
                $('#clienteModal').modal('hide');
                clienteId = null;
            } else {
                alert(`Error: ${data.message}`);
                clienteId = null;
            }
        } catch (error) {
            console.error("Error al guardar cliente:", error);
        }
    });
}

// Ejecutar la función principal cuando el documento esté listo
$(document).ready(main);
