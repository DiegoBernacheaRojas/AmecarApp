document.addEventListener("DOMContentLoaded", () => {
    const metodoPagoSelect = document.getElementById('metodo_pago');
    const detallesPagoDiv = document.getElementById('detallesPago');
    const confirmarPagoButton = document.getElementById('confirmarPago');
    const tablaVenta = document.querySelector('#tablaVenta tbody'); // Tabla de productos
    const totalVentaDisplay = document.getElementById('totalVenta'); // Donde se muestra el total
    const inputCodigoBarras = document.getElementById("codigo_barras");
    const mensajeDiv = document.createElement("div");
    inputCodigoBarras.parentNode.appendChild(mensajeDiv); // Mostrar mensajes cerca del input
    let montoEntregadoInput, cambioInput, montoTotalInput;
    let buscarTimeout;

    // Función para calcular el total de productos en la tabla
    function calcularTotalDeProductos() {
        const totalVenta = Array.from(tablaVenta.querySelectorAll('.total')) // Busca celdas con clase "total"
            .reduce((sum, cell) => sum + parseFloat(cell.textContent || 0), 0);

        totalVentaDisplay.textContent = `S/. ${totalVenta.toFixed(2)}`; // Actualiza el total en pantalla
        return totalVenta;
    }

    // Escuchar cambios en el código de barras para buscar y agregar producto
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
                //mostrarMensaje("Cantidad actualizada.", "success");
                inputCodigoBarras.value = ""; // Limpiar el código de barras
                inputCodigoBarras.focus(); // Volver a enfocar el campo
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
                //mostrarMensaje("Producto agregado correctamente.", "success");
                inputCodigoBarras.value = ""; // Limpiar el código de barras
                inputCodigoBarras.focus(); // Volver a enfocar el campo
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

        // Columna de eliminación
        const eliminarColumna = document.createElement("td");
        const eliminarButton = document.createElement("button");
        eliminarButton.textContent = "X";
        eliminarButton.className = "eliminar-producto";
        eliminarButton.addEventListener("click", () => eliminarProducto(fila, producto.Precio));
        eliminarColumna.appendChild(eliminarButton);

        // Agregar las columnas a la fila
        fila.appendChild(codigoColumna);
        fila.appendChild(descripcionColumna);
        fila.appendChild(precioColumna);
        fila.appendChild(cantidadColumna);
        fila.appendChild(totalColumna);
        fila.appendChild(eliminarColumna);

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

    function eliminarProducto(fila, precioProducto) {
        tablaVenta.removeChild(fila); // Eliminar la fila
        calcularTotalGeneral(); // Recalcular el total de la venta después de eliminar el producto
        //mostrarMensaje(`Producto eliminado.`, "success");
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
            .reduce((sum, cell) => sum + parseFloat(cell.textContent || 0), 0);

        totalVentaDisplay.textContent = `S/. ${total.toFixed(2)}`;
    }
    // Función para actualizar el total de productos al seleccionar el método de pago
    metodoPagoSelect.addEventListener('change', function() {
        const metodo = metodoPagoSelect.value;
        detallesPagoDiv.innerHTML = ''; // Limpiar contenido previo

        if (metodo === 'efectivo') {
            detallesPagoDiv.innerHTML = `
                <label for="monto_entregado">Monto Entregado:</label>
                <input type="number" id="monto_entregado" name="monto_entregado" class="metodo-pago-input" placeholder="monto entregado">
                <label for="monto_total" hidden>Monto Total:</label>
                <input type="number" id="monto_total" name="monto_total" readonly hidden>
                <label for="cambio">Cambio:</label>
                <input type="text" id="cambio" name="cambio" placeholder="Vuelto" readonly>
            `;

            // Asignar referencias a los elementos recién creados
            montoEntregadoInput = document.getElementById('monto_entregado');
            cambioInput = document.getElementById('cambio');
            montoTotalInput = document.getElementById('monto_total');

            // Calcular el total de productos al seleccionar el método de pago
            const totalVenta = calcularTotalDeProductos();
            montoTotalInput.value = totalVenta.toFixed(2);

            // Agregar evento para calcular el cambio
            montoEntregadoInput.addEventListener('input', function() {
                const montoEntregado = parseFloat(montoEntregadoInput.value || '0'); // Valor ingresado
                const montoTotal = parseFloat(montoTotalInput.value || '0'); // Total calculado

                if (!isNaN(montoEntregado) && montoEntregado > 0) {
                    const cambio = montoEntregado - montoTotal;
                    cambioInput.value = cambio >= 0 ? cambio.toFixed(2) : '0.00'; // Cambio si es suficiente
                } else {
                    cambioInput.value = '0.00'; // No hay cambio si no se ingresó suficiente
                }
            });
        } else if (metodo === 'tarjeta') {
            detallesPagoDiv.innerHTML = `
                <label for="numero_transaccion">Número de Transacción:</label>
                <input type="text" id="numero_transaccion" name="numero_transaccion" placeholder="Ingrese el número de transacción" required>
            `;
        } else if (metodo === 'yape' || metodo === 'plin') {
            detallesPagoDiv.innerHTML = `
                <label for="numero_telefono">Número de Teléfono:</label>
                <input type="text" id="numero_telefono" name="numero_telefono" placeholder="Ingrese el número de teléfono" required pattern="^[0-9]{9}$" title="El número de teléfono debe tener 9 dígitos.">
            `;
        }

        detallesPagoDiv.style.display = detallesPagoDiv.innerHTML ? 'block' : 'none';
    });

    confirmarPagoButton.addEventListener('click', function(e) {
        e.preventDefault();

        const metodo = metodoPagoSelect.value;

        if (metodo === 'efectivo') {
            const montoEntregado = parseFloat(montoEntregadoInput.value || '0');
            const montoTotal = parseFloat(montoTotalInput.value || '0');
            const cambio = parseFloat(cambioInput.value || '0');

            if (montoEntregado >= montoTotal || montoEntregado == 0) {
                alert(`Pago confirmado. El cambio es: S/. ${cambio.toFixed(2)}`);
            } else {
                alert('Monto entregado insuficiente.');
            }
        } else if (metodo === 'tarjeta') {
            alert('Pago confirmado con tarjeta.');
        } else if (metodo === 'yape' || metodo === 'plin') {
            alert('Pago confirmado por Yape o Plin.');
        } else {
            alert('Seleccione un método de pago válido.');
        }
    });

    
});

// Función para hacer scroll hacia abajo en la tabla
function scrollToBottom() {
    tablaVenta.scrollTop = tablaVenta.scrollHeight;
}

// Agregar escucha de eventos para teclas F1, F2, F3, F4
document.addEventListener('keydown', (event) => {
    if (event.key === 'e' || event.key === 'E') {
        metodoPagoSelect.value = 'efectivo';
        metodoPagoSelect.dispatchEvent(new Event('change')); // Trigger the change event to update payment details
    } else if (event.key === 't' || event.key === 'T') {
        metodoPagoSelect.value = 'tarjeta';
        metodoPagoSelect.dispatchEvent(new Event('change'));
    } else if (event.key === 'y' || event.key === 'Y') {
        metodoPagoSelect.value = 'yape';
        metodoPagoSelect.dispatchEvent(new Event('change'));
    } else if (event.key === 'p' || event.key === 'P') {
        metodoPagoSelect.value = 'plin';
        metodoPagoSelect.dispatchEvent(new Event('change'));
    }
});
document.getElementById('documento').addEventListener('change', function() {
    var documentoSelect = this.value;
    var detallesDocumento = document.getElementById('detallesDocumento');

    detallesDocumento.innerHTML = '';  // Limpiar campos existentes

    if (documentoSelect === 'boleta') {
        // Mostrar campos para boleta (no obligatorios)
        detallesDocumento.innerHTML = `
            <label for="nombre">Nombre (Opcional):</label>
            <input type="text" id="nombre" name="nombre">

            <label for="dni">DNI (Opcional):</label>
            <input type="text" id="dni" name="dni">
        `;
    } else if (documentoSelect === 'factura') {
        // Mostrar campos para factura (obligatorios)
        detallesDocumento.innerHTML = `
            <label for="rucInput">RUC</label>
            <input type="text" id="rucInput" name="ruc" placeholder="Ingrese el RUC" />

            <label for="razonSocialInput">Razón Social</label>
            <input type="text" id="razonSocialInput" name="razonSocial" placeholder="Razón Social" readonly />

            <label for="direccionInput">Dirección</label>
            <input type="text" id="direccionInput" name="direccion" placeholder="Dirección" readonly />
        `;
    }
});
document.getElementById('guardarDocumento').addEventListener('click', function() {
    var documentoSelect = document.getElementById('documento').value;
    var formData = {};

    if (documentoSelect === 'boleta') {
        formData = {
            tipoDocumento: 'boleta',
            dni: document.getElementById('dni').value,
            nombre: document.getElementById('nombre').value
        };
    } else if (documentoSelect === 'factura') {
        formData = {
            tipoDocumento: 'factura',
            ruc: document.getElementById('ruc').value,
            razonSocial: document.getElementById('razon_social').value,
            direccion: document.getElementById('direccion').value
        };
    }

    // Enviar datos al servidor usando fetch
    fetch('/guardar_documento', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        // Manejar la respuesta del servidor
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
function procesarVenta() {
    // Validar el método de pago
    const metodoPago = document.getElementById('metodo_pago').value;
    if (!metodoPago) {
        alert('Por favor, seleccione un método de pago.');
        return;
    }

    // Validar el tipo de documento
    const tipoDocumento = document.getElementById('tipo_documento').value;
    if (!tipoDocumento) {
        alert('Por favor, seleccione el tipo de documento: Boleta o Factura.');
        return;
    }

    // Validar los campos según el tipo de documento
    if (tipoDocumento === 'factura') {
        const ruc = document.getElementById('ruc').value;
        const razonSocial = document.getElementById('razon_social').value;
        const direccion = document.getElementById('direccion').value;
        if (!ruc || !razonSocial || !direccion) {
            alert('Por favor, complete todos los campos de la factura: RUC, Razón Social y Dirección.');
            return;
        }
    }

    // Generar la boleta o factura
    generarBoleta();

    // Opcional: Limpia los formularios después de confirmar
    document.getElementById('ventaForm').reset();
    document.getElementById('metodoPagoForm').reset();
}
function generarBoleta() {
    const fecha = new Date().toLocaleDateString();
    document.getElementById('fecha_boleta').innerText = fecha;

    // Obtener datos del cliente según el tipo de documento
    const tipoDocumento = document.getElementById('tipo_documento').value;
    let datosCliente = '';
    if (tipoDocumento === 'boleta') {
        const nombre = document.getElementById('nombre').value || 'No especificado';
        const dni = document.getElementById('dni').value || 'No especificado';
        datosCliente = `<strong>Nombre:</strong> ${nombre}<br><strong>DNI:</strong> ${dni}`;
    } else if (tipoDocumento === 'factura') {
        const ruc = document.getElementById('ruc').value;
        const razonSocial = document.getElementById('razon_social').value;
        const direccion = document.getElementById('direccion').value;
        datosCliente = `<strong>RUC:</strong> ${ruc}<br><strong>Razón Social:</strong> ${razonSocial}<br><strong>Dirección:</strong> ${direccion}`;
    }
    document.getElementById('datos_cliente').innerHTML = datosCliente;

    // Obtener detalles de la venta
    const tablaVenta = document.querySelector('#tablaVenta tbody');
    const detalleVenta = document.getElementById('detalle_venta');
    detalleVenta.innerHTML = ''; // Limpiar contenido previo
    let total = 0;

    tablaVenta.querySelectorAll('tr').forEach((row) => {
        const celdas = row.querySelectorAll('td');
        const descripcion = celdas[1]?.innerText;
        const cantidad = celdas[3]?.innerText;
        const precioUnitario = celdas[2]?.innerText;
        const subtotal = celdas[4]?.innerText;
        total += parseFloat(subtotal);

        detalleVenta.innerHTML += `
            <tr>
                <td>${descripcion}</td>
                <td>${cantidad}</td>
                <td>${precioUnitario}</td>
                <td>${subtotal}</td>
            </tr>
        `;
    });

    document.getElementById('total_boleta').innerText = total.toFixed(2);

    // Llamar a la función de impresión
    imprimirBoleta();
}
document.getElementById("rucInput").addEventListener('blur', function() {
    const ruc = this.value.trim();

    if (ruc.length > 0) {
        fetch('/guardar_documento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tipoDocumento: 'factura',
                ruc: ruc
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'RUC encontrado') {
                // Autocompletar los campos con los datos obtenidos
                document.getElementById('razonSocialInput').value = data.razonSocial;
                document.getElementById('direccionInput').value = data.direccion;
            } else {
                // Mostrar un mensaje si el RUC no está registrado
                alert('El RUC no está registrado en la base de datos.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});

