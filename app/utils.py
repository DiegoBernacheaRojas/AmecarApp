from functools import wraps
from flask import session, request, redirect, url_for
from app.config import API_PERMISSIONS

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Verificar si el usuario está autenticado
        if 'user_id' not in session:
            return redirect(url_for('main.login'))  # Redirigir a login si no está autenticado
        
        # Obtener el rol del usuario
        user_role = session.get('rol')  # El rol almacenado en la sesión
        if not user_role:
            return redirect(url_for('main.acceso_denegado'))  # Si no tiene rol, acceso denegado

        # Obtener la ruta de la API que se está solicitando
        requested_path = request.path  # Ejemplo: "/api/cliente/getId/5"
        
        # Buscar una coincidencia exacta o parcial en API_PERMISSIONS
        allowed_modules = None
        for api_route in API_PERMISSIONS.keys():
            if requested_path.startswith(api_route):  # Verifica rutas con ID dinámico
                allowed_modules = API_PERMISSIONS[api_route]
                break  # Encontramos la primera coincidencia válida

        # Si la API no está registrada en API_PERMISSIONS
        if allowed_modules is None:
            return redirect(url_for('main.acceso_denegado'))  # Redirigir si la API es restringida
        
        # Verificar si el usuario tiene permisos para la ruta solicitada
        if not any(permission in session['permisos'] for permission in allowed_modules):
            return redirect(url_for('main.acceso_denegado'))  # Redirigir si no tiene permisos

        return f(*args, **kwargs)
    return decorated_function
