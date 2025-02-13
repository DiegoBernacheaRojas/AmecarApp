document.addEventListener("DOMContentLoaded", function () {
    obtenerProductosMasVendidos();
    obtenerMejorEmpleado();
    obtenerStockBajo();
    obtenerClientesFrecuentes();
    obtenerUltimasVentas();
    cargarGraficoVentas();
});

async function obtenerMejorEmpleado() {
    let response = await fetch("/api/empleado/mejor-empleado");
    let json = await response.json();
    if (json.success && json.data) {
        document.getElementById("mejor-empleado").innerText = json.data.nombre;
        document.getElementById("total-ventas-empleado").innerText = json.data.total_ventas;
    } else {
        document.getElementById("mejor-empleado").innerText = "No encontrado";
        document.getElementById("total-ventas-empleado").innerText = "0";
    }
}

async function obtenerStockBajo() {
    let response = await fetch("/api/producto/stock-bajo");
    let json = await response.json();
    let lista = document.getElementById("productos-stock-bajo");
    lista.innerHTML = "";
    // Verifica que json.success sea true y que json.data sea un arreglo.
    if(json.success && Array.isArray(json.data)) {
        json.data.forEach(producto => {
            lista.innerHTML += `<li class="list-group-item text-danger">${producto.nombre} - ${producto.stock} unidades</li>`;
        });
    } else {
        lista.innerHTML = "<li class='list-group-item'>No se encontraron productos con stock bajo.</li>";
    }
}

async function obtenerProductosMasVendidos() {
    let response = await fetch("/api/producto/productos-mas-vendidos");
    let json = await response.json();
    let lista = document.getElementById("top-productos");
    lista.innerHTML = "";
    if(json.success && Array.isArray(json.data)) {
        json.data.forEach(producto => {
            lista.innerHTML += `<li class="list-group-item">${producto.nombre} - ${producto.cantidad} vendidos</li>`;
        });
    } else {
        lista.innerHTML = "<li class='list-group-item'>No se encontraron datos.</li>";
    }
}

async function obtenerUltimasVentas() {
    let response = await fetch("/api/venta/ultimas-ventas");
    let json = await response.json();
    let tabla = document.getElementById("tabla-ultimas-ventas");
    tabla.innerHTML = "";
    if(json.success && Array.isArray(json.data)) {
        json.data.forEach(venta => {
            tabla.innerHTML += `<tr>
                <td>${venta.cliente}</td>
                <td>${venta.producto}</td>
                <td>${venta.total}</td>
                <td>${venta.fecha}</td>
            </tr>`;
        });
    } else {
        tabla.innerHTML = `<tr><td colspan="4">No se encontraron ventas recientes.</td></tr>`;
    }
}

async function obtenerClientesFrecuentes() {
    let response = await fetch("/api/cliente/clientes-frecuentes");
    let json = await response.json();
    let lista = document.getElementById("clientes-frecuentes");
    lista.innerHTML = "";
    if(json.success && Array.isArray(json.data)) {
        json.data.forEach(cliente => {
            lista.innerHTML += `<li class="list-group-item">${cliente.nombre} - ${cliente.compras} compras</li>`;
        });
    } else {
        lista.innerHTML = "<li class='list-group-item'>No se encontraron clientes frecuentes.</li>";
    }
}

function cargarGraficoVentas() {
    fetch("/api/venta/ventas-por-mes")
        .then(response => response.json())
        .then(json => {
            if(json.success && json.data) {
                let ctx = document.getElementById("graficoVentas").getContext("2d");
                // Si json.data es un objeto, extraemos las etiquetas y los datos
                let labels = Object.keys(json.data);
                let data = Object.values(json.data);
                new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Ventas",
                            data: data,
                            backgroundColor: "rgba(54, 162, 235, 0.6)"
                        }]
                    }
                });
            } else {
                console.error("No se pudo cargar la data para el gráfico de ventas.");
            }
        });
}
