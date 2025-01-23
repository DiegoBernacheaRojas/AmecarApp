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
            { data: 'Correo' },
            { data: 'Telefono' },
            { data: 'FechaNacimiento' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-primary btn-sm editarBtn" data-id="${row.Empleado_ID}">Editar</button>
                        <button class="btn btn-danger btn-sm eliminarBtn" data-id="${row.Empleado_ID}">Eliminar</button>
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
    $('#empleadoForm')[0].reset();
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
        $('#empleadoModalLabel').text('Registrar Empleado');
        $('#guardarCliente').text('Registrar');
        $('#empleadoModal').modal('show');
    });

    // Evento para cerrar modales
    $(document).on('click', '.cerrarBtn', function () {
        limpiarModal();
        $('#empleadoModal').modal('hide');
        $('#confirmarEliminarModal').modal('hide');
        empleadoId = null;
    });

    // Evento para editar empleado
    $(document).on('click', '.editarBtn', async function () {
        empleadoId = $(this).data('id');
        $('#empleadoModalLabel').text('Editar Empleado');
        $('#guardarCliente').text('Actualizar');

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

                $('#empleadoModal').modal('show');
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
        $('#confirmarEliminarModal').modal('show');
    });

    // Confirmar eliminación
    $('#confirmarEliminar').click(async function () {
        try {
            const response = await fetch(`/api/empleado/desactivar/${empleadoId}`, { method: 'POST' });
            if (response.ok) {
                $('#tablaEmpleados').DataTable().ajax.reload();
                $('#confirmarEliminarModal').modal('hide');
                empleadoId = null;
            } else {
                alert("Error al eliminar el empleado.");
                empleadoId = null;
            }
        } catch (error) {
            console.error("Error al eliminar empleado:", error);
        }
    });

    // Guardar empleado
    $('#guardarCliente').click(async function () {
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
                $('#empleadoModal').modal('hide');
                empleadoId = null;
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
