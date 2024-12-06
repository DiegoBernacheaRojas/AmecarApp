from flask import Blueprint, render_template, session
from ..utils import login_required
from ..config import ROLES_PERMISOS

# Crear Blueprint para las vistas
main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def login():
    return render_template('login.html')  # Renderiza la vista principal

@main_bp.route('/index')
@login_required('Gerente','Empleado')  # Asegúrate de que solo los usuarios autenticados puedan acceder a esta ruta
def index():
    rol = session.get('rol', 'guest')
    permisos = ROLES_PERMISOS.get(rol, [])
    return render_template('index.html', permisos=permisos)

@main_bp.route('/ventas')
@login_required('Gerente','Empleado')
def ventas():
    rol = session.get('rol', 'guest')
    permisos = ROLES_PERMISOS.get(rol, [])
    return render_template('ventas.html', permisos=permisos)

@main_bp.route('/clientes')
@login_required('Gerente')
def clientes():
    rol = session.get('rol', 'guest')
    permisos = ROLES_PERMISOS.get(rol, [])
    return render_template('clientes.html', permisos=permisos)

@main_bp.route('/productos')
@login_required('Gerente')
def productos():
    rol = session.get('rol', 'guest')
    permisos = ROLES_PERMISOS.get(rol, [])
    return render_template('productos.html', permisos=permisos)

@main_bp.route('/acceso_denegado')
@login_required('Empleado')
def acceso_denegado():
    return render_template('acceso_denegado.html')