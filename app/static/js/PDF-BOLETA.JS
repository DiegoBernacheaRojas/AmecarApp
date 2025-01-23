document.getElementById("confirmarPago").addEventListener("click", function () {
    // 1. Capturar los datos generales
    const fechaActual = new Date();
    const fecha = fechaActual.toLocaleDateString();
    const hora = fechaActual.toLocaleTimeString();

    const metodoPagoSelect = document.getElementById("metodo_pago");
    const metodoPago = metodoPagoSelect.options[metodoPagoSelect.selectedIndex]?.text || "No especificado";

    const datosCliente = document.getElementById("datos_cliente").innerText || "Consumidor Final";
    const detalleVenta = Array.from(document.querySelectorAll("#detalle_venta tr"))
        .map(row => ({
            producto: row.cells[0].innerText,
            cantidad: row.cells[1].innerText,
            precio: row.cells[2].innerText,
            subtotal: row.cells[3].innerText
        }));
    const totalPagar = document.getElementById("total_boleta").innerText;

    // 2. Obtener el tipo de documento seleccionado del <select>
    const tipoDocumentoSeleccionado = document.getElementById("documento").value || "boleta"; // Por defecto, "boleta"
    
    // 3. Cambiar el título y el número de documento según el tipo
    function cambiarTituloDocumento(tipoDocumento) {
        const titulo = document.getElementById("titulo_boleta");
        const numeroDocumento = document.getElementById("numero_documento");
    
        if (tipoDocumento === "boleta") {
            titulo.innerText = "Boleta Electrónica";
            numeroDocumento.innerText = "B001-000001"; // Ejemplo de número de boleta
        } else if (tipoDocumento === "factura") {
            titulo.innerText = "Factura Electrónica";
            numeroDocumento.innerText = "F001-000001"; // Ejemplo de número de factura
        }
    }

    // Alternar entre boleta y factura según la selección del usuario
    cambiarTituloDocumento(tipoDocumentoSeleccionado);

    // Actualizar datos dinámicos en el PDF
    const tituloDocumento = document.getElementById("titulo_boleta").innerText;
    const numeroDocumento = document.getElementById("numero_documento").innerText;

    // 4. Crear un nuevo documento PDF (tamaño 75mm x longitud automática)
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [75, 300] // Ancho fijo de 75 mm, altura ajustable
    });

    // 5. Agregar contenido al PDF
    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(16);
    pdf.text("AMECAR", 5, 10);
    pdf.setFontSize(12);
    pdf.text("RUC: 20604706514", 5, 20);
    pdf.text("Inca 636, LIMA-LIMA-Surquillo", 5, 25);
    pdf.setFontSize(14);
    pdf.text(tituloDocumento, 5, 35);

    pdf.setFontSize(12);
    pdf.text(`${numeroDocumento}`, 5, 45);
    pdf.text(`Fecha: ${fecha}`, 5, 50);
    pdf.text(`Hora: ${hora}`, 5, 55);
    pdf.text(`Moneda: Soles`, 5, 60);
    pdf.text(`Forma de Pago: ${metodoPago}`, 5, 65);

    // Datos del cliente
    pdf.text("Datos del Cliente:", 5, 75);
    pdf.setFontSize(10);
    pdf.text(datosCliente, 5, 80);

    // Detalle de la venta
    pdf.setFontSize(12);
    pdf.text("Detalle de la Venta:", 5, 90);
    let yOffset = 100;
    detalleVenta.forEach(item => {
        pdf.text(
            `Producto: ${item.producto} | Cantidad: ${item.cantidad} | Precio: ${item.precio} | Subtotal: ${item.subtotal}`,
            5,
            yOffset
        );
        yOffset += 10; // Incrementar la posición vertical
    });

    // Total a pagar
    pdf.setFontSize(14);
    pdf.text(`Total a Pagar: ${totalPagar}`, 5, yOffset + 10);

    // 6. Guardar el PDF
    pdf.save(`${tituloDocumento.replace(" ", "_")}.pdf`);
});
