$(document).ready(function () {
    let clienteId = null;  // Variable global para almacenar el ID del cliente que se editará/eliminará


    // Inicialización de la tabla
    $('#tablaClientes').DataTable({
        ajax: {
            url: '/api/cliente/getAll', // Endpoint que devuelve los datos en formato JSON
            dataSrc: 'data' // Ruta donde están los datos dentro del JSON de respuesta
        },
        columns: [
            { data: 'Cliente_ID' },   // Coincide con la clave en el JSON
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
        // dom: 'Bfrtip',  // Botones (copy, csv, excel, etc.)
        // buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
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
        pageLength: 10, // Número de filas por página
        lengthChange: true, // Permitir cambiar el número de filas por página
        ordering: true, // Habilitar ordenación por columnas
        searching: true, // Habilitar búsqueda
        autoWidth: false, // Evitar ajuste automático del ancho
    });

    // URL de las APIs para obtener los datos
    const apiTipoDocumento = "/api/tipodocumento/getAll";
    const apiDistrito = "/api/distrito/getAll";
    const apiSexo = "/api/sexo/getAll";

    // Función para llenar el select de Tipo de Documento
    async function llenarTipoDocumento() {
        try {
            const response = await fetch(apiTipoDocumento);
            if (!response.ok) {
                throw new Error(`Error al obtener datos: ${response.statusText}`);
            }

            const data = await response.json();
            const selectElement = document.getElementById("tipoDocumento");

            if (data.success && Array.isArray(data.data)) {
                data.data.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.TipoDoc_ID; // Clave específica para este caso
                    option.textContent = item.Nombre; // Nombre para mostrar
                    selectElement.appendChild(option);
                });
            } else {
                console.error("No se obtuvieron datos válidos para Tipo de Documento.");
            }
        } catch (error) {
            console.error("Error al llenar Tipo de Documento:", error);
        }
    }

    // Función para llenar el select de Distrito
    async function llenarDistrito() {
        try {
            const response = await fetch(apiDistrito);
            if (!response.ok) {
                throw new Error(`Error al obtener datos: ${response.statusText}`);
            }

            const data = await response.json();
            const selectElement = document.getElementById("distritonCliente");

            if (data.success && Array.isArray(data.data)) {
                data.data.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.Codigo; // Clave específica para este caso
                    option.textContent = item.Nombre; // Nombre para mostrar
                    selectElement.appendChild(option);
                });
            } else {
                console.error("No se obtuvieron datos válidos para Distrito.");
            }
        } catch (error) {
            console.error("Error al llenar Distrito:", error);
        }
    }

    // Función para llenar el select de Sexo
    async function llenarSexo() {
        try {
            const response = await fetch(apiSexo);
            if (!response.ok) {
                throw new Error(`Error al obtener datos: ${response.statusText}`);
            }

            const data = await response.json();
            const selectElement = document.getElementById("sexoCliente");

            if (data.success && Array.isArray(data.data)) {
                data.data.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.Sexo_ID; // Clave específica para este caso
                    option.textContent = item.Nombre; // Nombre para mostrar
                    selectElement.appendChild(option);
                });
            } else {
                console.error("No se obtuvieron datos válidos para Sexo.");
            }
        } catch (error) {
            console.error("Error al llenar Sexo:", error);
        }
    }

    // Llamar a cada función para llenar los selects correspondientes
    llenarTipoDocumento();
    llenarDistrito();
    llenarSexo();

    // limpiar modal
    async function modalClear() {
        $('#nombreCliente').val(''); 
        $('#fechaNacimiento').val('');
        $('#numeroDocumento').val('');
        $('#direccionCliente').val('');
        $('#telefonoCliente').val('');
        $('#correoCliente').val('');
    }
    // abrir modal registro
    $(document).on('click', '.nuevoBtn', function () {
        $('#clienteModalLabel').text('Registrar Cliente');
        $('#clienteModal').modal('show');
    });

    // abrir modal registro
    $(document).on('click', '.xBtn', function () {
        modalClear();

        $('#clienteModal').modal('hide');
        $('#confirmarEliminarModal').modal('hide');
    });

    //boton cerrar modal
    $(document).on('click', '.cerrarBtn', function () {

        modalClear();

        $('#clienteModal').modal('hide');
        $('#confirmarEliminarModal').modal('hide');
    });

    // Acción para editar cliente    
    $(document).on('click', '.editarBtn', function () {
        clienteId = $(this).data('id');
        // Aquí puedes hacer una petición AJAX para obtener los datos del cliente
        // y llenar el formulario con esos datos

        // Simulando la carga de datos para edición:
        $('#clienteModalLabel').text('Editar Cliente');
        $('#nombreCliente').val('Nombre del cliente'); // Cargar datos reales
        $('#tipoCliente').val('Tipo de Cliente');
        $('#tipoDocumento').val('DNI');
        $('#numeroDocumento').val('12345678');
        $('#direccionCliente').val('Dirección');
        $('#telefonoCliente').val('123456789');
        $('#correoCliente').val('correo@cliente.com');

        // Mostrar el modal
        $('#clienteModal').modal('show');
    });

    // Acción para eliminar cliente
    $(document).on('click', '.eliminarBtn', function () {
        clienteId = $(this).data('id');
        // Mostrar modal de confirmación
        $('#confirmarEliminarModal').modal('show');
    });

    // Confirmar eliminación
    $('#confirmarEliminar').click(function () {
        // Llamar a una API para eliminar el cliente
        // Por ejemplo:
        $.ajax({
            url: '/api/cliente/delete/' + clienteId,
            type: 'DELETE',
            success: function (response) {
                // Refrescar la tabla después de eliminar
                $('#tablaClientes').DataTable().ajax.reload();
                $('#confirmarEliminarModal').modal('hide');
            }
        });
    });

    $('#guardarCliente').click(function () {
        // Obtener los datos del formulario y adaptarlos al formato requerido
        let clienteData = {
            Sexo_ID: $('#sexoCliente').val(), // ID del sexo
            Distrito_Codigo: $('#distritonCliente').val(), // Código del distrito
            Nombre: $('#nombreCliente').val(),
            TipoCliente: $('#tipoCliente').val(),
            TipoDoc_ID: $('#tipoDocumento').val(), // ID del tipo de documento
            NumDoc: $('#numeroDocumento').val(),
            Telefono: $('#telefonoCliente').val(),
            Correo: $('#correoCliente').val(),
            Direccion: $('#direccionCliente').val(),
            FechaNacimiento: $('#fechaNacimiento').val()
        };

        // Validación de datos básicos antes de enviar
        if (!clienteData.Nombre || !clienteData.NumDoc || !clienteData.Telefono || !clienteData.Correo) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }
    
        // Diferenciar entre agregar y editar un cliente
        if (clienteId) {
            // Editar cliente
            $.ajax({
                url: '/api/cliente/update/' + clienteId,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(clienteData),
                success: function (response) {
                    if (response.success) {
                        $('#tablaClientes').DataTable().ajax.reload();
                        $('#clienteModal').modal('hide');
                        alert("Cliente editado con éxito.");
                    } else {
                        alert("Error al editar el cliente: " + response.message);
                    }
                },
                error: function (xhr, status, error) {
                    alert("Error en la solicitud: " + error);
                }
            });
        } else {
            // Agregar nuevo cliente
            $.ajax({
                url: '/api/cliente/register',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(clienteData),
                success: function (response) {
                    if (response.success) {
                        $('#tablaClientes').DataTable().ajax.reload();
                        modalClear();
                        $('#clienteModal').modal('hide');
                        alert("Cliente agregado con éxito.");
                    } else {
                        alert("Error al agregar el cliente: " + response.message);
                    }
                },
                error: function (xhr, status, error) {
                    alert("Error en la solicitud: " + error);
                }
            });
        }
    });
    
});
