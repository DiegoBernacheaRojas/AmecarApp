let tiempoEspera;
const inputCodigo = document.getElementById("codigoBarras");

inputCodigo.addEventListener("input", function () {
    clearTimeout(tiempoEspera);
    tiempoEspera = setTimeout(async () => {
        const codigoBarras = inputCodigo.value.trim();
        if (codigoBarras !== "") {
            await buscarProducto(codigoBarras);
            inputCodigo.value = ""; // Limpia el input después de procesarlo
        }
    }, 500); // Espera 500ms después de escribir para buscar automáticamente
});

async function buscarProducto(codigoBarras) {
    try {
        const response = await fetch("/api/producto/getCodBarras", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codigo_barras: codigoBarras }),
        });

        const data = await response.json();
        if (!data || !data.Estado) {
            toastr.info("El producto con ese código de barras no existe.");
            return;
        }

        agregarProductoATabla(data);
    } catch (error) {
        console.error("Error al buscar el producto:", error);
        toastr.error("Error al consultar el producto.");
    }
}

function agregarProductoATabla(producto) {
    const tabla = document.getElementById("tablaProductos").getElementsByTagName("tbody")[0];
    const filas = tabla.getElementsByTagName("tr");

    for (let fila of filas) {
        let celdaCodigo = fila.cells[1].textContent; // Ahora la columna del código de barras es la [1]
        if (celdaCodigo === producto.CodigoBarras) {
            let celdaCantidad = fila.cells[4].querySelector("input"); // Ahora la columna de cantidad es la [4]
            let cantidadActual = parseInt(celdaCantidad.value);
            let nuevaCantidad = cantidadActual + 1;
            celdaCantidad.value = nuevaCantidad;

            let celdaSubTotal = fila.cells[5]; // Ahora la columna de subtotal es la [5]
            celdaSubTotal.textContent = (nuevaCantidad * producto.Precio).toFixed(2);
            actualizarTotal();
            return;
        }
    }

    // Si el producto no está en la tabla, se agrega una nueva fila
    let fila = tabla.insertRow();
    fila.innerHTML = `
        <td class="text-center" style="display: none;">${producto.Producto_ID}</td>
        <td class="text-center">${producto.CodigoBarras}</td>
        <td style="max-width: 500px; word-wrap: break-word; white-space: normal;">${producto.Descripcion}</td>
        <td class="text-center">${producto.Precio.toFixed(2)}</td>
        <td class="text-center" style="display: flex; justify-content: center; align-items: center;">
            <input type="number" class="form-control text-center cantidadInput" value="1" min="1" style="width: 100px;">
        </td>
        <td class="text-center">${producto.Precio.toFixed(2)}</td>
        <td class="text-center">
            <button class="btn btn-danger btn-sm" onclick="eliminarFila(this)">
                <i>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
                        fill="currentColor" class="bi bi-bag-x-fill" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M10.5 3.5a2.5 2.5 0 0 0-5 0V4h5zm1 0V4H15v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4h3.5v-.5a3.5 3.5 0 1 1 7 0M6.854 8.146a.5.5 0 1 0-.708.708L7.293 10l-1.147 1.146a.5.5 0 0 0 .708.708L8 10.707l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 10l1.147-1.146a.5.5 0 0 0-.708-.708L8 9.293z" />
                    </svg>
                </i>
            </button>
        </td>
    `;

    actualizarTotal();
    agregarEventosCantidad();
}

function agregarEventosCantidad() {
    document.querySelectorAll(".cantidadInput").forEach(input => {
        input.addEventListener("change", function () {
            let cantidad = parseInt(this.value);
            if (isNaN(cantidad) || cantidad < 1) {
                this.value = 1;
                cantidad = 1;
            }

            let fila = this.closest("tr");
            let precioUnitario = parseFloat(fila.cells[3].textContent); // Ahora la columna de precio unitario es la [3]
            fila.cells[5].textContent = (cantidad * precioUnitario).toFixed(2); // Ahora la columna de subtotal es la [5]
            actualizarTotal();
        });
    });
}

function eliminarFila(boton) {
    let fila = boton.parentNode.parentNode;
    fila.remove();
    actualizarTotal();
}

function actualizarTotal() {
    let total = 0;
    document.querySelectorAll("#tablaProductos tbody tr").forEach(fila => {
        total += parseFloat(fila.cells[5].textContent); // Ahora la columna de subtotal es la [5]
    });
    document.getElementById("totalVenta").value = total.toFixed(2);
}

document.getElementById("btnAgregarProducto").addEventListener("click", function () {
    const select = document.getElementById("listaProductos");
    const codigoBarras = select.value;

    if (codigoBarras) {
        buscarProducto(codigoBarras);
    } else {
        toastr.info("Seleccione un producto antes de agregar.");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const selectProductos = document.getElementById("listaProductos");
    const inputBuscador = document.getElementById("buscadorProducto");
    let productos = [];

    // Función para cargar los productos desde la API
    async function cargarProductos() {
        try {
            const response = await fetch("/api/producto/getAll");
            const data = await response.json();
            if (data && data.data) {
                productos = data.data;
                renderizarProductos(productos);
            } else {
                selectProductos.innerHTML = '<option disabled>No hay productos disponibles</option>';
            }
        } catch (error) {
            console.error("Error al cargar productos:", error);
            selectProductos.innerHTML = '<option disabled>Error al cargar productos</option>';
        }
    }

    // Renderiza los productos en el select
    function renderizarProductos(lista) {
        selectProductos.innerHTML = lista.length
            ? lista.map(p => `<option value="${p.CodigoBarras}">${p.Descripcion} (${p.SubCategoria})</option>`).join("")
            : '<option disabled>No se encontraron productos</option>';
    }

    // Filtra la lista en tiempo real
    inputBuscador.addEventListener("input", function () {
        const filtro = this.value.toLowerCase();
        const productosFiltrados = productos.filter(p => 
            p.Descripcion.toLowerCase().includes(filtro) || 
            p.SubCategoria.toLowerCase().includes(filtro)  // Ahora también filtra por subcategoría
        );
        renderizarProductos(productosFiltrados);
    });

    cargarProductos();

    const codigoRadio = document.getElementById("option_codigo");
    const productoRadio = document.getElementById("option_producto");
    const codigoForm = document.getElementById("codigoForm");
    const productoForm = document.getElementById("productoForm");

    function toggleProductoForm() {
        if (codigoRadio.checked) {
            codigoForm.classList.remove("d-none");
            productoForm.classList.add("d-none");
        } else {
            codigoForm.classList.add("d-none");
            productoForm.classList.remove("d-none");
        }
    }

    // Asegurar que "Código" esté seleccionado por defecto
    codigoRadio.checked = true;
    toggleProductoForm();

    codigoRadio.addEventListener("change", toggleProductoForm);
    productoRadio.addEventListener("change", toggleProductoForm);

    // 2. Manejo de selección de documento (Boleta / Factura)
    const boletaRadio = document.getElementById("option_boleta");
    const facturaRadio = document.getElementById("option_factura");
    const boletaForm = document.getElementById("boletaForm");
    const facturaForm = document.getElementById("facturaForm");

    function toggleDocumentoForm() {
        if (boletaRadio.checked) {
            boletaForm.classList.remove("d-none");
            facturaForm.classList.add("d-none");
        } else {
            boletaForm.classList.add("d-none");
            facturaForm.classList.remove("d-none");
        }
    }

    // Asegurar que "Boleta" esté seleccionado por defecto
    boletaRadio.checked = true;
    toggleDocumentoForm();

    boletaRadio.addEventListener("change", toggleDocumentoForm);
    facturaRadio.addEventListener("change", toggleDocumentoForm);

    const efectivoRadio = document.getElementById("option_efectivo");
    const tarjetaRadio = document.getElementById("option_tarjeta");
    const yapeRadio = document.getElementById("option_yape");
    const plinRadio = document.getElementById("option_plin");

    // Obtener los formularios
    const efectivoForm = document.getElementById("efectivoForm");
    const tarjetaForm = document.getElementById("tarjetaForm");
    const yapeForm = document.getElementById("yapeForm");
    const plinForm = document.getElementById("plinForm");

    function togglePagoForm() {
        efectivoForm.classList.add("d-none");
        tarjetaForm.classList.add("d-none");
        yapeForm.classList.add("d-none");
        plinForm.classList.add("d-none");

        if (efectivoRadio.checked) {
            efectivoForm.classList.remove("d-none");
        } else if (tarjetaRadio.checked) {
            tarjetaForm.classList.remove("d-none");
        } else if (yapeRadio.checked) {
            yapeForm.classList.remove("d-none");
        } else if (plinRadio.checked) {
            plinForm.classList.remove("d-none");
        }
    }

    // Asegurar que "Efectivo" esté seleccionado por defecto
    efectivoRadio.checked = true;
    togglePagoForm();

    // Agregar eventos de cambio
    efectivoRadio.addEventListener("change", togglePagoForm);
    tarjetaRadio.addEventListener("change", togglePagoForm);
    yapeRadio.addEventListener("change", togglePagoForm);
    plinRadio.addEventListener("change", togglePagoForm);

    // Calcular vuelto automáticamente
    document.getElementById("montoEntregado").addEventListener("input", function () {
        let montoEntregado = parseFloat(this.value) || 0;
        let totalAPagar = document.getElementById("totalVenta").value
        let vuelto = montoEntregado - totalAPagar;
        document.getElementById("vuelto").value = vuelto >= 0 ? vuelto.toFixed(2) : 0;
    });

    const dniInput = document.getElementById("dni");
    const nombreInput = document.getElementById("nombre");
    const rucInput = document.getElementById("ruc");
    const razonSocialInput = document.getElementById("razonSocial");
    const direccionInput = document.getElementById("direccion");

    // Función para obtener datos de la API
    async function fetchData(tipo, numero) {
        try {
            const response = await fetch("/api/venta/getDataSunat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tipo, numero })
            });

            const data = await response.json();
            return data.success ? data : null;
        } catch (error) {
            console.error("Error al obtener datos:", error);
            return null;
        }
    }

    // Evento para el campo DNI
    dniInput.addEventListener("keydown", async function (event) {
        if (event.key === "Enter") {
            event.preventDefault();  // Evita que se envíe un formulario por accidente
            const dni = dniInput.value.trim();
            if (dni.length === 8) {  
                const data = await fetchData("dni", dni);
                if (data) {
                    nombreInput.value = data.nombre || "";
                }
            }
        }
    });
    
    rucInput.addEventListener("keydown", async function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const ruc = rucInput.value.trim();
            if (ruc.length === 11) {  
                const data = await fetchData("ruc", ruc);
                if (data) {
                    razonSocialInput.value = data.razonSocial || "";
                    direccionInput.value = data.direccion || "";
                }
            }
        }
    });
});

document.getElementById("btnConfirmarPago").addEventListener("click", async function () {
    // Obtener el ID del empleado (puedes cambiar esto según tu lógica)

    // Obtener tipo de venta
    const tipoVenta = document.querySelector('input[name="tipo_venta"]:checked')?.id === "option_boleta" ? "boleta" : "factura";
    console.log("Tipo de venta seleccionado:", tipoVenta);


    // Obtener datos del documento de venta
    let datosDocumentoVenta = {};
    if (tipoVenta === "boleta") {
        const dni = document.getElementById("dni").value.trim();
        const nombre = document.getElementById("nombre").value.trim();
        datosDocumentoVenta = {
            DNI: dni || null,
            Nombre: nombre || null
        };
    } else {
        const ruc = document.getElementById("ruc").value.trim();
        const razonSocial = document.getElementById("razonSocial").value.trim();
        const direccion = document.getElementById("direccion").value.trim();
        
        if (!ruc || !razonSocial || !direccion) {
            toastr.info("Todos los campos para factura son obligatorios.");
            return;
        }

        datosDocumentoVenta = {
            RUC: ruc,
            Razon_Social: razonSocial,
            Direccion: direccion
        };
    }

    // Obtener tipo de pago
    let tipoPago = "";
    let datosPago = {};
    if (document.getElementById("option_efectivo").checked) {
        tipoPago = "efectivo";
        const montoEntregado = parseFloat(document.getElementById("montoEntregado").value);
        const vuelto = parseFloat(document.getElementById("vuelto").value);
        datosPago = { MontoEntregado: montoEntregado, Vuelto: vuelto };
    } else if (document.getElementById("option_tarjeta").checked) {
        tipoPago = "tarjeta";
        const numeroTransferencia = document.getElementById("numeroTransferencia").value.trim();
        datosPago = { NumeroTransferencia: numeroTransferencia };
    } else if (document.getElementById("option_yape").checked) {
        tipoPago = "yape";
        const numeroYape = document.getElementById("numeroYape").value.trim();
        datosPago = { NumeroCelular: numeroYape };
    } else if (document.getElementById("option_plin").checked) {
        tipoPago = "plin";
        const numeroPlin = document.getElementById("numeroPlin").value.trim();
        datosPago = { NumeroCelular: numeroPlin };
    }

    if (!tipoPago || Object.keys(datosPago).length === 0) {
        toastr.info("Debe seleccionar y completar el método de pago.");
        return;
    }

    // Obtener productos de la tabla
    const tabla = document.getElementById("tablaProductos").getElementsByTagName("tbody")[0];
    const filas = tabla.getElementsByTagName("tr");
    const detalles = [];

    for (let fila of filas) {
        const productoID = parseInt(fila.cells[0].textContent);
        const cantidad = fila.querySelector(".cantidadInput").value;
        const precioUnitario = parseFloat(fila.cells[3].textContent);

        detalles.push({
            Producto_ID: parseInt(productoID),
            Cantidad: parseInt(cantidad),
            PrecioUnitario: precioUnitario
        });
    }

    if (detalles.length === 0) {
        toastr.info("Debe agregar al menos un producto.");
        return;
    }

    // Construir objeto de venta
    const ventaData = {
        TipoVenta: tipoVenta,
        DatosDocumentoVenta: datosDocumentoVenta,
        TipoPago: tipoPago,
        DatosPago: datosPago,
        Detalles: detalles
    };

    //console.log("Datos a enviar:", ventaData);

    try {
        const response = await fetch("/api/venta/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ventaData)
        });

        const result = await response.json();

        if (result.success) {
            toastr.success("Venta registrada exitosamente.");
            enviarVentaAlServidor(result.Venta_ID);
            limpiarFormulario();
        } else {
            toastr.error("Error al registrar la venta: " + result.message);
        }
    } catch (error) {
        toastr.error("Error en la conexión con el servidor.");
        console.error(error);
    }
});

function limpiarFormulario() {
    // Limpiar inputs
    document.getElementById("dni").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("ruc").value = "";
    document.getElementById("razonSocial").value = "";
    document.getElementById("direccion").value = "";
    document.getElementById("montoEntregado").value = "";
    document.getElementById("vuelto").value = "";
    document.getElementById("numeroTransferencia").value = "";
    document.getElementById("numeroYape").value = "";
    document.getElementById("numeroPlin").value = "";

    // Limpiar tabla de productos
    const tabla = document.getElementById("tablaProductos").getElementsByTagName("tbody")[0];
    tabla.innerHTML = "";

    // Reiniciar tipo de venta a boleta
    document.getElementById("option_boleta").checked = true;

    // Reiniciar método de pago a efectivo
    document.getElementById("option_efectivo").checked = true;

    // Reiniciar total de venta
    document.getElementById("totalVenta").value = "0.00";
}

async function enviarVentaAlServidor(ventaID) {
    try {
        const response = await fetch(`/api/venta/savePdf/${ventaID}`, {  // Cambié la petición a GET con el ID en la URL
            method: 'GET',  // Usamos GET en lugar de POST
            headers: { 'Content-Type': 'application/json' }  // Opcional, pero puedes dejarlo si es necesario
        });

        const data = await response.json();
        if (data.success) {
            window.open(data.pdf_url, '_blank'); // Abrir el PDF en una nueva pestaña
        } else {
            console.error("Error al generar el PDF:", data.message);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
}

// Agregar escucha de eventos para teclas F1, F2, F3, F4
// document.addEventListener('keydown', (event) => {
//     if (event.key === 'e' || event.key === 'E') {
//         metodoPagoSelect.value = 'efectivo';
//         metodoPagoSelect.dispatchEvent(new Event('change')); // Trigger the change event to update payment details
//     } else if (event.key === 't' || event.key === 'T') {
//         metodoPagoSelect.value = 'tarjeta';
//         metodoPagoSelect.dispatchEvent(new Event('change'));
//     } else if (event.key === 'y' || event.key === 'Y') {
//         metodoPagoSelect.value = 'yape';
//         metodoPagoSelect.dispatchEvent(new Event('change'));
//     } else if (event.key === 'p' || event.key === 'P') {
//         metodoPagoSelect.value = 'plin';
//         metodoPagoSelect.dispatchEvent(new Event('change'));
//     }
// });


