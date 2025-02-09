const modulos = ["roles","ventas", "productos", "detalleVentas", "clientes", "empleados", "home", "recuperarVentas"];

// Definir nombres personalizados para ciertos módulos
const modulosPersonalizados = {
    "ventas": "Realizar Ventas",
};

// Función para transformar nombres en una versión más legible si no hay un nombre personalizado
function formatearNombreModulo(modulo) {
    return modulosPersonalizados[modulo] || 
           modulo.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
}

// Función para inicializar la tabla
function inicializarTabla() {
    $('#tablaRoles').DataTable({
        ajax: {
            url: '/api/rol/getAll',
            dataSrc: 'data'
        },
        columns: [
            { data: 'Rol_ID' },
            { data: 'Nombre' },
            {
                data: 'Permisos',
                render: function (data, type, row) {
                    // Convierte la cadena de permisos JSON en un array
                    const permisos = JSON.parse(data);
                    
                    // Crea una lista de badges con mayor tamaño y nombres formateados
                    return permisos.map(function (permiso) {
                        const nombreFormateado = formatearNombreModulo(permiso); // Formatear el nombre del permiso
                        return `<span class="badge badge-info" style="font-size: 1rem; padding: 5px 5px; margin: 2px;">${nombreFormateado}</span>`; 
                    }).join(' '); // Une todos los badges con un espacio entre ellos
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button type="button" class="btn btn-primary btn-sm editarBtn" data-id="${row.Rol_ID}" data-target="#modal-nuevo" data-toggle="modal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                            </svg>
                        </button>
                        <button type="button" class="btn btn-danger btn-sm eliminarBtn" data-id="${row.Rol_ID}" data-target="#modal-confirm" data-toggle="modal">
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

// Función para cargar los módulos con Bootstrap Switch
function cargarModulos() {
    const container = document.getElementById("modulosContainer");
    container.innerHTML = ""; // Limpiar antes de agregar

    modulos.forEach((modulo, index) => {
        const nombreFormateado = formatearNombreModulo(modulo);

        const moduloHTML = `
            <tr>
                <td class="align-middle">${nombreFormateado}</td>
                <td class="text-end">
                    <input type="checkbox" class="modulo-switch" id="modulo${index}" name="modulo[]" value="${modulo}" data-bootstrap-switch>
                </td>
            </tr>
        `;
        container.innerHTML += moduloHTML;
    });

    // Inicializar Bootstrap Switch en los nuevos elementos
    $("input[data-bootstrap-switch]").bootstrapSwitch({
        state: false // 🔹 Inician apagados
    });
}

// Llamar a la función cuando se abra el modal
document.addEventListener("DOMContentLoaded", cargarModulos);

function limpiarModal() {
    // Limpiar el formulario
    $('#form')[0].reset();

    // Desactivar los switches
    $("input[data-bootstrap-switch]").bootstrapSwitch('state', false);
}

// Función principal para manejar eventos y lógica
async function main() {
    let rolId = null;

    // Inicializar la tabla
    inicializarTabla();

    // Evento para abrir el modal de registro
    $(document).on('click', '.nuevoBtn', function () {
        limpiarModal();
        rolId = null;
        $('#modal-nuevoLabel').text('Registrar Rol');
        $('#guardar').text('Registrar');
        if ($('#color-modal').hasClass('card-primary')) {
            $('#color-modal').removeClass('card-primary').addClass('card-success');
        } 
    });

    // Evento para editar rol
    $(document).on('click', '.editarBtn', async function () {
        rolId = $(this).data('id');
        limpiarModal();
        $('#modal-nuevoLabel').text('Editar Rol');
        $('#guardar').text('Actualizar');
        if ($('#color-modal').hasClass('card-success')) {
            $('#color-modal').removeClass('card-success').addClass('card-primary');
        } 
        
        try {
            const response = await fetch(`/api/rol/getId/${rolId}`);
            if (!response.ok) throw new Error(`Error al obtener rol: ${response.statusText}`);
        
            const data = await response.json();
            if (data.success) {
                const rol = data.data;
                $('#nombreRol').val(rol.Nombre);
        
                // Convertir permisos en un array
                const permisosRol = rol.Permisos ? JSON.parse(rol.Permisos) : [];
        
                // Activar los switches correspondientes a los permisos del rol
                permisosRol.forEach(permiso => {
                    $(`input[name="modulo[]"][value="${permiso}"]`).bootstrapSwitch('state', true);
                });
        
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al editar rol:", error);
        }
    });

    // Evento para eliminar cliente
    $(document).on('click', '.eliminarBtn', function () {
        rolId = $(this).data('id');
    });

    // Confirmar eliminación
    $('#confirmarEliminar').click(async function () {
        try {
            const response = await fetch(`/api/rol/desactivar/${rolId}`, { method: 'POST' });
    
            // Comprobar si la respuesta es exitosa
            if (response.ok) {
                // Recargar la tabla y ocultar el modal si la desactivación fue exitosa
                $('#tablaRoles').DataTable().ajax.reload();
                $('#modal-confirm').modal('hide');
            } else {
                // Si la respuesta no es exitosa, obtener el mensaje de error y mostrarlo
                const data = await response.json();
                toastr.error(data.message);  // Usa `toastr.error` para mostrar el mensaje de error
            }
        } catch (error) {
            // Si hay un error en la solicitud
            toastr.error("Ocurrió un error al intentar desactivar el rol.");
        }
    });

    $('#guardar').click(async function () {
        const nombreRol = $('#nombreRol').val();
    
        // Obtener los permisos seleccionados
        const permisosSeleccionados = [];
        $("input[data-bootstrap-switch]:checked").each(function () {
            permisosSeleccionados.push($(this).val()); // El valor del permiso
        });
    
        // Convertir el array de permisos a una cadena JSON
        const permisosText = JSON.stringify(permisosSeleccionados); // Esto generará algo como '["ventas", "home"]'
    
        // Preparar los datos para la solicitud
        const rolData = {
            Nombre: nombreRol,
            Permisos: permisosText  // Ahora es un string que representa un array JSON
        };
    
        // Validar que el nombre y los permisos estén seleccionados
        if (!nombreRol || permisosSeleccionados.length === 0) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }
    
        // Determinar el método y URL de la API
        const method = rolId ? 'PUT' : 'POST';
        const url = rolId ? `/api/rol/update/${rolId}` : '/api/rol/register';
    
        try {
            // Realizar la solicitud a la API
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rolData) // Enviar los datos de nombre y permisos
            });
    
            const data = await response.json();
            if (data.success) {
                // Recargar la tabla de roles y limpiar el modal
                $('#tablaRoles').DataTable().ajax.reload();
                limpiarModal();
                $('#modal-nuevo').modal('hide');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al guardar rol:", error);
        }
    });
    
}

// Ejecutar la función principal cuando el documento esté listo
$(document).ready(main);