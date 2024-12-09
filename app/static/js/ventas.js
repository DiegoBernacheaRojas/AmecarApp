document.addEventListener("DOMContentLoaded", () => {
    const inputCodigoBarras = document.getElementById("codigo_barras");
    const tablaVenta = document.getElementById("tablaVenta").querySelector("tbody");
    const totalVentaDisplay = document.getElementById("totalVenta"); // Contenedor del total general
    const mensajeDiv = document.createElement("div");
    inputCodigoBarras.parentNode.appendChild(mensajeDiv); // Mostrar mensajes cerca del input

    let buscarTimeout;

    inputCodigoBarras.addEventListener("input", () => {
        clearTimeout(buscarTimeout);
        const codigoBarras = inputCodigoBarras.value.trim();
        if (!codigoBarras) return;

        buscarTimeout = setTimeout(() => buscarYAgregarProducto(codigoBarras), 300);
    });

    async function buscarYAgregarProducto(codigoBarras) {
        try {
            // Verificar si el producto ya está en la tabla
            const filaExistente = Array.from(tablaVenta.querySelectorAll("tr")).find((row) => {
                return row.querySelector("td")?.textContent === codigoBarras;
            });

            if (filaExistente) {
                const cantidadInput = filaExistente.querySelector(".cantidad-input");
                cantidadInput.value = parseInt(cantidadInput.value) + 1;
                actualizarTotal({ target: cantidadInput }); // Actualiza el total individual
                calcularTotalGeneral(); // Recalcula el total general de la venta
                mostrarMensaje("Cantidad actualizada.", "success");
                inputCodigoBarras.value = "";
                return;
            }

            // Petición al servidor para buscar el producto
            const response = await fetch("/api/venta/buscar_producto", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ codigo_barras: codigoBarras }),
            });

            const data = await response.json();

            if (response.ok) {
                agregarProductoATabla(data);
                mostrarMensaje("Producto agregado correctamente.", "success");
                inputCodigoBarras.value = "";
                calcularTotalGeneral();
            } else {
                mostrarMensaje(data.error || "Error al buscar el producto.", "error");
            }
        } catch (error) {
            mostrarMensaje("Error al comunicarse con el servidor.", "error");
            console.error(error);
        }
    }

    function agregarProductoATabla(producto) {
        const fila = document.createElement("tr");
    
        // Crear columnas para cada campo de producto
        const codigoColumna = document.createElement("td");
        codigoColumna.textContent = producto.CodigoBarras;
    
        const descripcionColumna = document.createElement("td");
        descripcionColumna.textContent = producto.Descripcion;
    
        const precioColumna = document.createElement("td");
        precioColumna.textContent = parseFloat(producto.Precio).toFixed(2);
    
        const cantidadColumna = document.createElement("td");
        const cantidadInput = document.createElement("input");
        cantidadInput.type = "number";
        cantidadInput.value = producto.Cantidad || 1; // Valor predeterminado de cantidad
        cantidadInput.min = 1;
        cantidadInput.className = "cantidad-input";
        cantidadInput.dataset.precio = parseFloat(producto.Precio);
        cantidadColumna.appendChild(cantidadInput);
    
        const totalColumna = document.createElement("td");
        totalColumna.className = "total";
        const totalInicial = (producto.Cantidad || 1) * parseFloat(producto.Precio);
        totalColumna.textContent = totalInicial.toFixed(2);
    
        // Agregar las columnas a la fila
        fila.appendChild(codigoColumna);
        fila.appendChild(descripcionColumna);
        fila.appendChild(precioColumna);
        fila.appendChild(cantidadColumna);
        fila.appendChild(totalColumna);
    
        // Agregar la fila a la tabla
        tablaVenta.appendChild(fila);
    
        // Escuchar cambios en la cantidad para recalcular el total y el total general
        cantidadInput.addEventListener("input", (event) => {
            actualizarTotal(event);
            calcularTotalGeneral();
        });
    
        // Desplazarse automáticamente al final de la tabla
        scrollToBottom();
    }


    function mostrarMensaje(mensaje, tipo) {
        mensajeDiv.textContent = mensaje;
        mensajeDiv.style.color = tipo === "success" ? "green" : "red";
        mensajeDiv.style.marginTop = "10px";

        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            mensajeDiv.textContent = "";
        }, 3000);
    }

    function actualizarTotal(event) {
        const input = event.target;
        const precio = parseFloat(input.dataset.precio);
        const cantidad = parseInt(input.value) || 0;
        const totalCell = input.closest("tr").querySelector(".total");

        if (cantidad > 0) {
            const total = precio * cantidad;
            totalCell.textContent = total.toFixed(2);
        } else {
            totalCell.textContent = "0.00";
        }
    }

    function calcularTotalGeneral() {
        const total = Array.from(tablaVenta.querySelectorAll(".total"))
            .reduce((sum, cell) => sum + parseFloat(cell.textContent), 0);
    
        totalVentaDisplay.textContent = `S/. ${total.toFixed(2)}`;
    }
});

function scrollToBottom() {
    var tableBody = document.querySelector("#tablaVenta tbody");
    tableBody.scrollTop = tableBody.scrollHeight; // Mueve el scroll hasta el fondo
}

// Ejecutar cuando el contenido de la tabla se actualiza (se añaden productos, por ejemplo)
document.addEventListener("DOMContentLoaded", function() {
    // Llamamos a la función una vez que la página se haya cargado
    scrollToBottom();
});
document.addEventListener('DOMContentLoaded', () => {
    const metodoPagoSelect = document.getElementById('metodo_pago');
    const detallesPagoDiv = document.getElementById('detallesPago');
    const confirmarPagoButton = document.getElementById('confirmarPago');

    metodoPagoSelect.addEventListener('change', function() {
        const metodo = metodoPagoSelect.value;
        detallesPagoDiv.innerHTML = ''; // Limpiar contenido previo

        if (metodo === 'tarjeta') {
            detallesPagoDiv.innerHTML = `
                <label for="numero_transaccion">Número de Transacción:</label>
                <input type="text" id="numero_transaccion" name="numero_transaccion" placeholder="Ingrese el número de transacción" required>
            `;
        } else if (metodo === 'efectivo') {
            detallesPagoDiv.innerHTML = `
                <label for="monto_entregado">Monto Entregado:</label>
                <input type="number" id="monto_entregado" name="monto_entregado" placeholder="Ingrese el monto entregado" required>
                <label for="cambio">Cambio:</label>
                <input type="text" id="cambio" name="cambio" placeholder="El cambio aparecerá aquí" readonly>
            `;
        } else if (metodo === 'yape') {
                detallesPagoDiv.innerHTML = `
                    <label for="numero_telefono">Número de Teléfono:</label>
                    <input type="text" id="numero_telefono" name="numero_telefono" placeholder="Ingrese el número de teléfono" required>
            `;

        } else if (metodo === 'plin') {
            detallesPagoDiv.innerHTML = `
                <label for="numero_telefono">Número de Teléfono:</label>
                <input type="text" id="numero_telefono" name="numero_telefono" placeholder="Ingrese el número de teléfono" required>
            `;
        }

        // Mostrar el div si hay contenido
        detallesPagoDiv.style.display = detallesPagoDiv.innerHTML ? 'block' : 'none';
    });

    confirmarPagoButton.addEventListener('click', function(e) {
        e.preventDefault();
        // Implementar la lógica de procesamiento del pago aquí
        alert('Pago procesado exitosamente.');
    });
});
