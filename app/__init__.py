from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = None

def create_app():
    app = Flask(__name__)
    app.secret_key = 'tu_clave_secreta_super_segura'
                                            #"mssql+pyodbc://USER:CONTRASEÑA@SERVIDOR/BASEDEDATOS?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
    app.config['SQLALCHEMY_DATABASE_URI'] = "mssql+pyodbc://sa:123@DESKTOP-TJK9H4B/Amecar?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # Inicializa Flask-Migrate después de inicializar la aplicación y la base de datos
    global migrate
    migrate = Migrate(app, db)

    # Registrar Blueprints
    from app.controllers.main_controller import main_bp
    from app.controllers.login_controller import login
    from app.controllers.cliente_controller import cliente
    from app.controllers.producto_controller import producto
    from app.controllers.venta_controller import venta
    from app.controllers.sexo_controller import sexo
    from app.controllers.distrito_controller import distrito
    from app.controllers.tipo_documento_controller import tipo_documento

    app.register_blueprint(main_bp)
    app.register_blueprint(login, url_prefix='/api/login')
    app.register_blueprint(cliente, url_prefix='/api/cliente')
    app.register_blueprint(producto, url_prefix='/api/producto')
    app.register_blueprint(venta, url_prefix='/api/venta')
    app.register_blueprint(sexo, url_prefix='/api/sexo')
    app.register_blueprint(distrito, url_prefix='/api/distrito')
    app.register_blueprint(tipo_documento, url_prefix='/api/tipodocumento')

    return app
