// Cerrar sesión
document.getElementById('logout-button').addEventListener('click', async function () {
    try {
        const response = await fetch('/api/login/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('No se pudo procesar la solicitud');
        }

        const result = await response.json();

        if (result.success) {
            //alert(result.message);
            window.location.href = '/';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Ocurrió un error inesperado.');
    }
});

