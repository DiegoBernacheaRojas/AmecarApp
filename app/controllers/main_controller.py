from flask import Blueprint, render_template, session
from ..utils import login_required

# Crear Blueprint para las vistas
main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def login():
    return render_template('login.html')  # Renderiza la vista principal

@main_bp.route('/index')
@login_required  # Asegúrate de que solo los usuarios autenticados puedan acceder a esta ruta
def index():
    permisos = session.get('permisos', 'guest')
    return render_template('index.html', permisos=permisos)

@main_bp.route('/ventas')
@login_required
def ventas():
    permisos = session.get('permisos', 'guest')
    return render_template('ventas.html', permisos=permisos)

@main_bp.route('/clientes')
@login_required
def clientes():
    permisos = session.get('permisos', 'guest')
    return render_template('clientes.html', permisos=permisos)

@main_bp.route('/productos')
@login_required
def productos():
    permisos = session.get('permisos', 'guest')
    return render_template('productos.html', permisos=permisos)

@main_bp.route('/detalleVentas')
@login_required
def detalleVentas():
    permisos = session.get('permisos', 'guest')
    return render_template('detalleVentas.html', permisos=permisos)

@main_bp.route('/empleados')
@login_required
def empleados():
    permisos = session.get('permisos', 'guest')
    return render_template('empleados.html', permisos=permisos)

@main_bp.route('/roles')
@login_required
def roles():
    permisos = session.get('permisos', 'guest')
    return render_template('roles.html', permisos=permisos)

@main_bp.route('/acceso_denegado')
def acceso_denegado():
    return render_template('acceso_denegado.html')