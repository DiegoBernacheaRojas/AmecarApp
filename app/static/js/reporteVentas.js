// Variable global para la instancia de DataTable
var tablaVentas;

// Inicializar el Select2 para todos los selects con clase .select2
$(document).ready(function() {
    $('.select2').select2({
        theme: 'bootstrap4'
    });
});

// Función para inicializar la tabla de ventas
function inicializarTablaVentas() {
    tablaVentas = $('#tablaVentas').DataTable({
        ajax: {
            url: '/api/venta/getAll', // URL de API para obtener ventas (por defecto)
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
            { data: 'FechaVenta' }
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
        paging: false,
        lengthChange: false,
        ordering: false,
        searching: false,
        autoWidth: false,
    });
}

// Actualización del select dinámico según el filtro (cliente, producto o empleado)
document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("dynamicSelect");
    const radios = document.getElementsByName("filtro");
    
    const apiUrls = {
        producto: "/api/producto/getAll",
        cliente: "/api/cliente/getAll",
        empleado: "/api/empleado/getAll"
    };

    function updateSelect(value) {
        select.innerHTML = ""; // Limpiar el select antes de llenarlo
        const url = apiUrls[value];
        
        // Verificar que exista la URL correspondiente
        if (!url) return;
        
        // Solicitud a la API para obtener los datos correspondientes
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const items = data.data; // Datos de la respuesta de la API
                if (items && items.length > 0) {
                    // Según el filtro, se elige la propiedad a mostrar en cada opción
                    items.forEach(item => {
                        let option = document.createElement("option");
                        if (value === "producto") {
                            option.value = item.Producto_ID; // ID del producto
                            option.textContent = item.Descripcion; // Descripción
                        } else if (value === "cliente") {
                            option.value = item.Cliente_ID; // ID del cliente
                            option.textContent = item.Nombre; // Nombre del cliente
                        } else if (value === "empleado") {
                            option.value = item.Empleado_ID; // ID del empleado
                            option.textContent = item.NombreCompleto; // Nombre completo
                        }
                        select.appendChild(option);
                    });
                } else {
                    let option = document.createElement("option");
                    option.textContent = "No hay datos disponibles";
                    select.appendChild(option);
                }
            })
            .catch(error => {
                console.error("Error al obtener los datos:", error);
                let option = document.createElement("option");
                option.textContent = "Error al cargar los datos";
                select.appendChild(option);
            });
    }
    
    // Actualizar el select cuando se cambie el radio (si existen)
    radios.forEach(radio => {
        radio.addEventListener("change", function () {
            updateSelect(this.value);
        });
    });

    // Cargar por defecto los datos para "cliente"
    updateSelect("cliente");

    // Listener para el botón "Aplicar Filtros"
    document.getElementById("btnAplicarFiltros").addEventListener("click", function (e) {
        e.preventDefault();

        // Recopilar los valores de los filtros
        let checkTodo    = document.getElementById("checkTodo").checked;
        let fechaInicio  = document.getElementById("fechaInicio").value; // Formato "YYYY-MM-DD"
        let fechaFin     = document.getElementById("fechaFin").value;
        let checkBoleta  = document.getElementById("checkBoleta").checked;
        let checkFactura = document.getElementById("checkFactura").checked;
        
        // Obtener los IDs seleccionados del select (usando jQuery/Select2)
        let selectedIds  = $('#dynamicSelect').val() || [];
    
        // Obtener el filtro de tipo a partir de los radio buttons (si existen), o asignar 'cliente' por defecto
        let filtroTipo = $('input[name="filtro"]:checked').val() || 'cliente';
    
        // Construir el objeto con los filtros a enviar a la API
        let filters = {
            checkTodo: checkTodo,
            filtroTipo: filtroTipo,
            selectedIds: selectedIds,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            checkBoleta: checkBoleta,
            checkFactura: checkFactura
        };
    
        // Enviar la petición AJAX vía POST a la API de filtrado
        $.ajax({
            url: '/api/venta/getAllWithFilter', // Ruta del endpoint de filtrado
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(filters),
            success: function (response) {
                if (response.success) {
                    // Actualizar la tabla con los datos filtrados
                    tablaVentas.clear();
                    tablaVentas.rows.add(response.data);
                    tablaVentas.draw();
                } else {
                    alert("No se pudieron obtener los datos filtrados");
                }
            },
            error: function (err) {
                console.error("Error al filtrar ventas:", err);
                alert("Ocurrió un error al filtrar las ventas");
            }
        });
    });

    document.getElementById("btnDescargarPdf").addEventListener("click", function (e) {
        e.preventDefault();
    
        // Recopilar los valores de los filtros (igual que en "Aplicar Filtros")
        let checkTodo    = document.getElementById("checkTodo").checked;
        let fechaInicio  = document.getElementById("fechaInicio").value; // Formato "YYYY-MM-DD"
        let fechaFin     = document.getElementById("fechaFin").value;
        let checkBoleta  = document.getElementById("checkBoleta").checked;
        let checkFactura = document.getElementById("checkFactura").checked;
        
        // Obtener los IDs seleccionados del select (usando jQuery/Select2)
        let selectedIds  = $('#dynamicSelect').val() || [];
        
        // Obtener el filtro de tipo a partir de los radio buttons (si existen), o asignar 'cliente' por defecto
        let filtroTipo = $('input[name="filtro"]:checked').val() || 'cliente';
    
        // Construir el objeto con los filtros a enviar a la API
        let filters = {
            checkTodo: checkTodo,
            filtroTipo: filtroTipo,
            selectedIds: selectedIds,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            checkBoleta: checkBoleta,
            checkFactura: checkFactura
        };
    
        // Enviar la petición AJAX vía POST a la API que genera el PDF
        $.ajax({
            url: '/api/venta/printPdf', // Ruta del endpoint que genera el PDF
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(filters),
            xhrFields: {
                responseType: 'blob'  // Indicamos que la respuesta es un blob (PDF)
            },
            success: function (data, textStatus, jqXHR) {
                // Crear un objeto Blob a partir de la respuesta
                var blob = new Blob([data], { type: 'application/pdf' });
                // Crear una URL temporal para el Blob
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = "ventas_report.pdf";  // Nombre del archivo a descargar
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
            error: function (err) {
                console.error("Error al descargar PDF:", err);
                alert("Ocurrió un error al descargar el PDF");
            }
        });
    });
    
});

// Función principal para manejar la inicialización
async function main() {
    inicializarTablaVentas();
}

// Ejecutar la función principal cuando el documento esté listo
$(document).ready(main);
