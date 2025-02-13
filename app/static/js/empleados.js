// Función para inicializar la tabla
function inicializarTabla() {
    $('#tablaEmpleados').DataTable({
        ajax: {
            url: '/api/empleado/getAll',
            dataSrc: 'data'
        },
        columns: [
            { data: 'Empleado_ID' },
            { data: 'TipoDoc_Nombre' },
            { data: 'NumeroDoc' },
            { data: 'NombreCompleto' },
            { data: 'Rol_Nombre' },
            { data: 'Distrito_Nombre' },
            { data: 'Sexo_Nombre' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button type="button" class="btn btn-primary btn-sm editarBtn" data-id="${row.Empleado_ID}" data-target="#modal-nuevo" data-toggle="modal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                            </svg>
                        </button>
                        <button type="button" class="btn btn-danger btn-sm eliminarBtn" data-id="${row.Empleado_ID}" data-target="#modal-confirm" data-toggle="modal">
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
    let empleadoId = null;

    // Inicializar la tabla
    inicializarTabla();

    // Llenar selects
    await llenarSelect("/api/rol/getAll", "rolEmpleado", "Rol_ID", "Nombre");
    await llenarSelect("/api/distrito/getAll", "distritoEmpleado", "Codigo", "Nombre");
    await llenarSelect("/api/sexo/getAll", "sexoEmpleado", "Sexo_ID", "Nombre");
    await llenarSelect("/api/tipodocumento/getAll", "tipoDocEmpleado", "TipoDoc_ID", "Nombre");

    // Evento para abrir el modal de registro
    $(document).on('click', '.nuevoBtn', function () {
        limpiarModal();
        empleadoId = null;
        $('#modal-nuevoLabel').text('Registrar Empleado');
        $('#guardar').text('Registrar');
        if ($('#color-modal').hasClass('card-primary')) {
            $('#color-modal').removeClass('card-primary').addClass('card-success');
        } 
    });

    // Evento para editar empleado
    $(document).on('click', '.editarBtn', async function () {
        empleadoId = $(this).data('id');
        $('#modal-nuevoLabel').text('Editar Empleado');
        $('#guardar').text('Actualizar');
        if ($('#color-modal').hasClass('card-success')) {
            $('#color-modal').removeClass('card-success').addClass('card-primary');
        } 
        try {
            const response = await fetch(`/api/empleado/getId/${empleadoId}`);
            if (!response.ok) throw new Error(`Error al obtener empleado: ${response.statusText}`);

            const data = await response.json();
            if (data.success) {
                const empleado = data.data;
                $('#nombresEmpleado').val(empleado.Nombres);
                $('#apellidosEmpleado').val(empleado.Apellidos);
                $('#edadEmpleado').val(empleado.Edad);
                $('#usuarioEmpleado').val(empleado.Usuario);
                $('#claveEmpleado').val(empleado.Clave);
                $('#telefonoEmpleado').val(empleado.Telefono);
                $('#rolEmpleado').val(empleado.Rol_ID);
                $('#distritoEmpleado').val(empleado.Distrito_Codigo);
                $('#sexoEmpleado').val(empleado.Sexo_ID);
                $('#tipoDocEmpleado').val(empleado.TipoDoc_ID);
                $('#numDocEmpleado').val(empleado.NumeroDoc);
                $('#fechaNacEmpleado').val(empleado.FechaNacimiento);
                $('#correoEmpleado').val(empleado.Correo);

            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al editar empleado:", error);
        }
    });

    // Evento para eliminar empleado
    $(document).on('click', '.eliminarBtn', function () {
        empleadoId = $(this).data('id');
    });

    // Confirmar eliminación
    $('#confirmarEliminar').click(async function () {
        try {
            const response = await fetch(`/api/empleado/desactivar/${empleadoId}`, { method: 'POST' });
            if (response.ok) {
                $('#tablaEmpleados').DataTable().ajax.reload();
                $('#modal-confirm').modal('hide');
            } else {
                alert("Error al eliminar el empleado.");

            }
        } catch (error) {
            console.error("Error al eliminar empleado:", error);
        }
    });

    // Guardar empleado
    $('#guardar').click(async function () {
        const empleadoData = {
            Nombres: $('#nombresEmpleado').val(),
            Apellidos: $('#apellidosEmpleado').val(),
            Edad: $('#edadEmpleado').val(),
            Usuario: $('#usuarioEmpleado').val(),
            Clave: $('#claveEmpleado').val(),
            Telefono: $('#telefonoEmpleado').val(),
            Rol_ID: $('#rolEmpleado').val(),
            Distrito_Codigo: $('#distritoEmpleado').val(),
            Sexo_ID: $('#sexoEmpleado').val(),
            TipoDoc_ID: $('#tipoDocEmpleado').val(),
            NumeroDoc: $('#numDocEmpleado').val(),
            FechaNacimiento: $('#fechaNacEmpleado').val(),
            Correo: $('#correoEmpleado').val()
        };

        if (Object.values(empleadoData).some(value => !value)) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }

        const method = empleadoId ? 'PUT' : 'POST';
        const url = empleadoId ? `/api/empleado/update/${empleadoId}` : '/api/empleado/register';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empleadoData)
            });

            const data = await response.json();
            if (data.success) {
                $('#tablaEmpleados').DataTable().ajax.reload();
                limpiarModal();
                $('#modal-nuevo').modal('hide');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al guardar empleado:", error);
        }
    });
}

// Ejecutar la función principal al cargar el documento
$(document).ready(main);
