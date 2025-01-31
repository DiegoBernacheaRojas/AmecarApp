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
                inputCodigoBarras.value = "";
                return;
            }
    
            // Petición al servidor para buscar el producto
            const response = await fetch("/api/producto/getCodBarras", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ codigo_barras: codigoBarras }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                agregarProductoATabla(data);
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
        
            // Añadir el evento para calcular el cambio automáticamente
            const montoEntregadoInput = document.getElementById("monto_entregado");
            montoEntregadoInput.addEventListener("input", function() {
                calcularCambio(montoEntregadoInput.value);
            });
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

document.getElementById('tipo_documento').addEventListener('change', function () {
    var tipoDocumento = this.value;
    var detalles = document.getElementById('detallesPago'); // Mantener el acceso al div de detalles de pago
    var detallesDocumentoDiv = document.getElementById('detallesDocumento'); // Para detalles de documentos

    // Limpiar los campos del documento si existen
    detallesDocumentoDiv.innerHTML = '';

    if (tipoDocumento === 'boleta' || tipoDocumento === 'factura') {
        // Agregar campos específicos para boleta o factura si es necesario
    } else if (tipoDocumento === 'consumo_interno') {
        // Agregar campos para consumo interno
    }

    // Detalles para el formulario de documentos
    if (tipoDocumento === 'boleta') {
        detallesDocumentoDiv.innerHTML = `
            <label for="nombre_cliente">Nombre del Cliente:</label>
            <input type="text" id="nombre_cliente" name="nombre_cliente" placeholder="Ingrese el nombre de cliente" required>
            <label for="DNI">DNI del cliente:</label>
            <input type="text" id="DNI" name="DNI" placeholder="Ingrese el DNI" required>
        `;
    } else if (tipoDocumento === 'factura') {
        detallesDocumentoDiv.innerHTML = `
            <label for="ruc">RUC del Cliente:</label>
            <input type="text" id="ruc" name="ruc" placeholder="Ingrese el RUC del cliente" required>
            <label for="razon_social">Razón Social:</label>
            <input type="text" id="razon_social" name="razon_social" placeholder="Razón Social" readonly>
            <label for="direccion">Dirección:</label>
            <input type="text" id="direccion" name="direccion" placeholder="Dirección" readonly>
        `;
    } else if (tipoDocumento === 'consumo_interno') {
        detallesDocumentoDiv.innerHTML = `
            <label for="detalle_consumo">Detalle de Consumo Interno:</label>
            <input type="text" id="detalle_consumo" name="detalle_consumo" placeholder="Ingrese el detalle de consumo interno" required>
        `;
    }

    // Mostrar el div si hay contenido
    detallesDocumentoDiv.style.display = detallesDocumentoDiv.innerHTML ? 'block' : 'none';
});

// Función para calcular el cambio
function calcularCambio(montoEntregado) {
    const total = Array.from(tablaVenta.querySelectorAll(".total"))
        .reduce((sum, cell) => sum + parseFloat(cell.textContent), 0);

    if (parseFloat(montoEntregado) >= total) {
        const cambio = parseFloat(montoEntregado) - total;
        document.getElementById("cambio").value = cambio.toFixed(2);
    } else {
        document.getElementById("cambio").value = "";
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const metodoPagoSelect = document.getElementById("metodo_pago");
    const tipoDocumentoSelect = document.getElementById("tipo_documento");
    const confirmarPagoButton = document.getElementById("confirmarPago");

    async function guardarDatosRUC() {
        const ruc = document.getElementById("ruc").value.trim();
        const razonSocial = document.getElementById("razon_social").value.trim();
        const direccion = document.getElementById("direccion").value.trim();

        if (!ruc || !razonSocial || !direccion) {
            return false;
        }

        try {
            const response = await fetch("/api/ruc/guardar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ruc: ruc,
                    razon_social: razonSocial,
                    direccion: direccion,
                }),
            });

            return response.ok;
        } catch (error) {
            console.error("Error al guardar el RUC:", error);
            return false;
        }
    }

    async function registrarVenta() {
        const tipoDocumentoSelect = document.getElementById("tipoDocumento");
        const metodoPagoSelect = document.getElementById("metodoPago");
   
        const tipoDocumento = tipoDocumentoSelect.value;
        const metodoPago = metodoPagoSelect.value;
        const totalVenta = calcularTotalVenta();
   
        // Ejecutar la obtención del empleado y la validación en paralelo
        const empleadoPromise = obtenerEmpleadoID();
        const rucGuardadoPromise = tipoDocumento === "factura" ? guardarDatosRUC() : Promise.resolve(true);
   
        // Esperar a que ambas promesas se resuelvan
        const [empleadoID, rucGuardado] = await Promise.all([empleadoPromise, rucGuardadoPromise]);
   
        // Verificar si el RUC fue guardado correctamente
        if (tipoDocumento === "factura" && !rucGuardado) {
            alert("No se pudo guardar los datos del RUC.");
            return false;
        }
   
        const ventaData = {
            Cliente_ID: "3", // Cliente_ID es fijo por ahora, puedes hacerlo dinámico
            Empleado_ID: empleadoID,
            FechaVenta: new Date().toISOString(),
            Estado: 1,  // Estado de la venta (puede cambiar dependiendo de tu lógica)
            TipoDocumento: tipoDocumento,
            MetodoPago: metodoPago,
            TotalVenta: totalVenta,
        };
   
        try {
            const response = await fetch("/api/venta/registrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(ventaData),
            });
   
            if (response.ok) {
                alert("Venta registrada correctamente.");
                return true;
            } else {
                const errorData = await response.json();
                alert(`Hubo un problema: ${errorData.error || "error desconocido"}`);
                return false;
            }
        } catch (error) {
            console.error("Error al registrar la venta:", error);
            alert("Error al registrar la venta.");
            return false;
        }
    }
});
async function obtenerEmpleadoID() {
    try {
        const response = await fetch("/api/empleado/obtener");
        const data = await response.json();
        return data.Empleado_ID || 1;  // 1 por defecto si no está autenticado
    } catch (error) {
        console.error("Error obteniendo empleado:", error);
        return 1;
    }
}
// Asumimos que el botón es el siguiente
const confirmarPagoButton = document.getElementById("confirmarPago");

confirmarPagoButton.addEventListener("click", async function (e) {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario

    // Obtener los datos de los campos
    const totalVenta = parseFloat(document.getElementById("totalVenta").textContent);  // Total de la venta
    const metodoPago = document.getElementById("metodo_pago").value;  // Método de pago
    const tipoDocumento = document.getElementById("tipo_documento").value;  // Tipo de documento

    const estado = 1;  // Estado siempre es 1
    const clienteID = 3;  // Cliente fijo como mencionaste
    const fechaVenta = new Date().toISOString();  // Fecha actual en formato ISO

    // Obtener el empleado autenticado
    const empleadoID = await obtenerEmpleadoID();  // Esta función obtiene el ID del empleado que está autenticado

    // Verificar que los campos esenciales están completos
    if (!metodoPago || !tipoDocumento || totalVenta <= 0) {
        alert("Por favor, complete todos los campos requeridos antes de continuar.");
        return;
    }

    // Crear los datos de la venta
    const ventaData = {
        Cliente_ID: clienteID,
        Empleado_ID: empleadoID,
        FechaVenta: fechaVenta,
        Estado: estado,
        TipoDocumento: tipoDocumento,
        MetodoPago: metodoPago,
        TotalVenta: totalVenta,
    };

    // Registrar la venta a través de la API
    const ventaGuardada = await registrarVenta(ventaData);
    if (ventaGuardada) {
        alert("Venta registrada exitosamente.");
    }
});

// Función para obtener el ID del empleado (asumimos que hay una API para esto)
async function obtenerEmpleadoID() {
    try {
        const response = await fetch("/api/empleado/obtener");
        const data = await response.json();
        return data.Empleado_ID || 1;  // Si no hay empleado autenticado, se devuelve 1 como valor predeterminado
    } catch (error) {
        console.error("Error obteniendo empleado:", error);
        return 1;  // Si no se puede obtener el empleado, se devuelve un valor por defecto
    }
}

// Función para registrar la venta (enviando los datos al servidor)
async function registrarVenta(ventaData) {
    try {
        const response = await fetch("/api/venta/registrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ventaData),
        });

        if (response.ok) {
            return true;  // Venta registrada exitosamente
        } else {
            const errorData = await response.json();
            alert(`Hubo un problema: ${errorData.error || "error desconocido"}`);
            return false;
        }
    } catch (error) {
        console.error("Error al registrar la venta:", error);
        alert("Error al registrar la venta.");
        return false;
    }
}
