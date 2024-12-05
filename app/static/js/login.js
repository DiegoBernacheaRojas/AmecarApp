document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('loginForm');
    
    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        // Obtener los valores del formulario
        const usuario = document.getElementById('usuario').value;
        const clave = document.getElementById('clave').value;

        // Crear el objeto de datos que se enviará a la API
        const data = {
            usuario : usuario,
            clave: clave
        };

        // Realizar la solicitud POST al API
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())  
        .then(data => {
            if (data.success) {

                window.location.href = '/index';  

            } else {
                
                alert('Login fallido. Verifica tus credenciales.');
            }
        })
        .catch(error => {

            console.error('Error:', error);
            alert('Hubo un error en la solicitud.');
        });
    });
});
