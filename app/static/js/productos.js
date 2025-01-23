// Función para inicializar la tabla
function inicializarTabla() {
    $('#tablaProductos').DataTable({
        ajax: {
            url: '/api/producto/getAll',
            dataSrc: 'data'
        },
        columns: [
            { data: 'Producto_ID' },
            { data: 'SubCategoria' },
            { data: 'CodigoBarras' },
            { data: 'Descripcion' },
            { data: 'Precio' },
            { data: 'Stock' },
            { data: 'FechaIngreso' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-primary btn-sm editarBtn" data-id="${row.Producto_ID}">Editar</button>
                        <button class="btn btn-danger btn-sm eliminarBtn" data-id="${row.Producto_ID}">Eliminar</button>
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
    $('#descripcionProducto').val('');
    $('#precioProducto').val('');
    $('#stockProducto').val('');
    $('#fechaIngresoProducto').val('');
    $('#codigoBarrasProducto').val('');
}

// Función principal para manejar eventos y lógica
async function main() {
    let productoId = null;

    // Inicializar la tabla
    inicializarTabla();

    // Llenar selects
    await llenarSelect("/api/subcategoria/getAll", "subcategoriaProducto", "Subcategoria_ID", "Nombre");

    // Evento para abrir el modal de registro
    $(document).on('click', '.nuevoBtn', function () {
        limpiarModal();
        $('#productoModalLabel').text('Registrar Producto');
        $('#guardarProducto').text('Registrar');
        $('#productoModal').modal('show');
    });

    // Evento para cerrar modales
    $(document).on('click', '.cerrarBtn', function () {
        limpiarModal();
        $('#productoModal').modal('hide');
        $('#confirmarEliminarModal').modal('hide');
        productoId = null;
    });

    // Evento para editar producto
    $(document).on('click', '.editarBtn', async function () {
        productoId = $(this).data('id');
        $('#productoModalLabel').text('Editar Producto');
        $('#guardarProducto').text('Actualizar');

        try {
            const response = await fetch(`/api/producto/getId/${productoId}`);
            if (!response.ok) throw new Error(`Error al obtener producto: ${response.statusText}`);

            const data = await response.json();
            if (data.success) {
                const producto = data.data;
                $('#subcategoriaProducto').val(producto.SubCategoria);
                $('#descripcionProducto').val(producto.Descripcion);
                $('#precioProducto').val(producto.Precio);
                $('#stockProducto').val(producto.Stock);
                $('#fechaIngresoProducto').val(producto.FechaIngreso);
                $('#codigoBarrasProducto').val(producto.CodigoBarras);

                $('#productoModal').modal('show');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al editar producto:", error);
        }
    });

    // Evento para eliminar cliente
    $(document).on('click', '.eliminarBtn', function () {
        productoId = $(this).data('id');
        $('#confirmarEliminarModal').modal('show');
    });

    // Confirmar eliminación
    $('#confirmarEliminar').click(async function () {
        try {
            const response = await fetch(`/api/producto/desactivar/${productoId}`, { method: 'POST' });
            if (response.ok) {
                $('#tablaProducto').DataTable().ajax.reload();
                $('#confirmarEliminarModal').modal('hide');
                productoId = null;
            } else {
                alert("Error al eliminar el producto.");
                productoId = null;
            }
        } catch (error) {
            console.error("Error al eliminar producto:", error);
        }
    });

    // Guardar producto
    $('#guardarProducto').click(async function () {
        const productoData = {
            Subcategoria_ID: $('#subcategoriaProducto').val(),
            CodigoBarras: $('#codigoBarrasProducto').val(),
            FechaIngreso: $('#fechaIngresoProducto').val(),
            Descripcion: $('#descripcionProducto').val(),
            Precio: $('#precioProducto').val(),
            Stock: $('#stockProducto').val()
        };

        if (!productoData.CodigoBarras || !productoData.Subcategoria_ID || !productoData.FechaIngreso || !productoData.Descripcion || !productoData.Precio || !productoData.Stock) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }

        const method = productoId ? 'PUT' : 'POST';
        const url = productoId ? `/api/producto/update/${productoId}` : '/api/producto/register';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            });

            const data = await response.json();
            if (data.success) {
                $('#tablaProductos').DataTable().ajax.reload();
                limpiarModal();
                $('#productoModal').modal('hide');
                productoId = null;
            } else {
                alert(`Error: ${data.message}`);
                productoId = null;
            }
        } catch (error) {
            console.error("Error al guardar producto:", error);
        }
    });
}

// Ejecutar la función principal cuando el documento esté listo
$(document).ready(main);