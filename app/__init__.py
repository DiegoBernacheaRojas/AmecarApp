from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

load_dotenv()
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_SERVER = os.getenv("DB_SERVER")
DB_NAME = os.getenv("DB_NAME")

db = SQLAlchemy()
migrate = None

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mssql+pyodbc://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
    db.init_app(app)

    # Inicializa Flask-Migrate después de inicializar la aplicación y la base de datos
    global migrate
    migrate = Migrate(app, db)

    # Registrar Blueprints
    from app.controllers.main_controller import main_bp
    from app.controllers.login_controller import login
    from app.controllers.cliente_controller import cliente
    from app.controllers.empleado_controller import empleado
    from app.controllers.producto_controller import producto
    from app.controllers.venta_controller import venta
    from app.controllers.sexo_controller import sexo
    from app.controllers.distrito_controller import distrito
    from app.controllers.tipo_documento_controller import tipo_documento
    from app.controllers.subcategoria_controller import subcategoria
    from app.controllers.rol_controller import rol

    app.register_blueprint(main_bp)
    app.register_blueprint(login, url_prefix='/api/login')
    app.register_blueprint(cliente, url_prefix='/api/cliente')
    app.register_blueprint(empleado, url_prefix='/api/empleado')
    app.register_blueprint(producto, url_prefix='/api/producto')
    app.register_blueprint(venta, url_prefix='/api/venta')
    app.register_blueprint(sexo, url_prefix='/api/sexo')
    app.register_blueprint(distrito, url_prefix='/api/distrito')
    app.register_blueprint(tipo_documento, url_prefix='/api/tipodocumento')
    app.register_blueprint(subcategoria, url_prefix='/api/subcategoria')
    app.register_blueprint(rol, url_prefix='/api/rol')

    return app
