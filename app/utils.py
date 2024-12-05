from functools import wraps
from flask import session, redirect, url_for

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Verificar si el 'user_id' está en la sesión
        if 'user_id' not in session:
            # Redirigir al login si no está autenticado
            return redirect(url_for('main.login'))  # Cambia 'login' por la ruta de tu login
        return f(*args, **kwargs)
    return decorated_function