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
            { data: 'Sexo' },
            { data: 'Correo' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button type="button" class="btn btn-primary btn-sm editarBtn" data-id="${row.Cliente_ID}" data-target="#modal-nuevo" data-toggle="modal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                            </svg>
                        </button>
                        <button type="button" class="btn btn-danger btn-sm eliminarBtn" data-id="${row.Cliente_ID}" data-target="#modal-confirm" data-toggle="modal">
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
    $('#form')[0].reset();
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
        clienteId = null;
        $('#modal-nuevoLabel').text('Registrar Cliente');
        $('#guardar').text('Registrar');
        if ($('#color-modal').hasClass('card-primary')) {
            $('#color-modal').removeClass('card-primary').addClass('card-success');
        } 
    });

    // Evento para editar cliente
    $(document).on('click', '.editarBtn', async function () {
        clienteId = $(this).data('id');
        $('#modal-nuevoLabel').text('Editar Cliente');
        $('#guardar').text('Actualizar');
        if ($('#color-modal').hasClass('card-success')) {
            $('#color-modal').removeClass('card-success').addClass('card-primary');
        } 

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
    });

    // Confirmar eliminación
    $('#confirmarEliminar').click(async function () {
        try {
            const response = await fetch(`/api/cliente/desactivar/${clienteId}`, { method: 'POST' });
            if (response.ok) {
                $('#tablaClientes').DataTable().ajax.reload();
                $('#modal-confirm').modal('hide');
            } else {
                alert("Error al eliminar el cliente.");

            }
        } catch (error) {
            console.error("Error al eliminar cliente:", error);
        }
    });

    // Guardar cliente
    $('#guardar').click(async function () {
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

        if (Object.values(clienteData).some(value => !value)) {
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
                $('#modal-nuevo').modal('hide');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al guardar cliente:", error);
        }
    });
}

// Ejecutar la función principal cuando el documento esté listo
$(document).ready(main);
