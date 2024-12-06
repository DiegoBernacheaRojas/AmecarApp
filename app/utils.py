from functools import wraps
from flask import session, redirect, url_for, jsonify

def login_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Verificar si el usuario está autenticado
            if 'user_id' not in session:
                return redirect(url_for('main.login'))  # Cambia 'main.login' por la ruta de tu login
            
            # Verificar el rol del usuario
            emp_rol = session.get('rol')  # Supongamos que el rol se guarda en la sesión
            if emp_rol not in roles:
                 return redirect(url_for('main.acceso_denegado'))  # Ruta a tu página de error
            return f(*args, **kwargs)
        return decorated_function
    return decorator

