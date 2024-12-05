from flask import Blueprint, render_template
from ..utils import login_required

# Crear Blueprint para las vistas
main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def login():
    return render_template('login.html')  # Renderiza la vista principal

@main_bp.route('/index')
@login_required  # Asegúrate de que solo los usuarios autenticados puedan acceder a esta ruta
def index():
    return render_template('index.html')  

@main_bp.route('/ventas')
@login_required  
def ventas():
    return render_template('ventas.html')

@main_bp.route('/clientes')
@login_required  
def clientes():
    return render_template('clientes.html')

@main_bp.route('/productos')
@login_required  
def productos():
    return render_template('productos.html')