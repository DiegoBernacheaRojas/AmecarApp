from app import db
from sqlalchemy import text

class Categoria(db.Model):
    __tablename__ = 'Categoria'

    Categoria_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Nombre = db.Column(db.String(50), nullable=False)
    Estado = db.Column(db.Boolean, nullable=False)

    subcategorias = db.relationship('SubCategoria', backref='categoria', lazy=True)


class SubCategoria(db.Model):
    __tablename__ = 'SubCategoria'

    Subcategoria_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Categoria_ID = db.Column(db.Integer, db.ForeignKey('Categoria.Categoria_ID'), nullable=False)
    Nombre = db.Column(db.String(50), nullable=False)
    Estado = db.Column(db.Boolean, nullable=False)

    productos = db.relationship('Producto', backref='subcategoria', lazy=True)


class Producto(db.Model):
    __tablename__ = 'Producto'

    Producto_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Subcategoria_ID = db.Column(db.Integer, db.ForeignKey('SubCategoria.Subcategoria_ID'), nullable=False)
    CodigoBarras = db.Column(db.String(30), unique=True, nullable=False)  # Nuevo campo
    Descripcion = db.Column(db.String(100))
    Precio = db.Column(db.Numeric(10, 2), nullable=False)
    Stock = db.Column(db.Integer, nullable=False)
    FechaIngreso = db.Column(db.Date, nullable=False)
    Estado = db.Column(db.Boolean, nullable=False)

    # Relación con DetalleVenta
    detalles = db.relationship('DetalleVenta', backref='producto', lazy=True)


class Sexo(db.Model):
    __tablename__ = 'Sexo'

    Sexo_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Nombre = db.Column(db.String(100), nullable=False)
    Estado = db.Column(db.Boolean, nullable=False)

    # Relación con Cliente y Empleado
    clientes = db.relationship('Cliente', backref='sexo', lazy=True)
    empleados = db.relationship('Empleado', backref='sexo', lazy=True)


class Distrito(db.Model):
    __tablename__ = 'Distrito'

    Distrito_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Codigo = db.Column(db.Integer, nullable=False, unique=True)
    Nombre = db.Column(db.String(100), nullable=False)
    Estado = db.Column(db.Boolean, nullable=False)

    # Relación con Cliente y Empleado
    clientes = db.relationship('Cliente', backref='distrito', lazy=True)
    empleados = db.relationship('Empleado', backref='distrito', lazy=True)


class TipoDocumento(db.Model):
    __tablename__ = 'TipoDocumento'

    TipoDoc_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Nombre = db.Column(db.String(50), nullable=False)
    Estado = db.Column(db.Boolean, nullable=False)

    # Relación con Cliente y Empleado
    clientes = db.relationship('Cliente', backref='tipo_documento', lazy=True)
    empleados = db.relationship('Empleado', backref='tipo_documento', lazy=True)


class Cliente(db.Model):
    __tablename__ = 'Cliente'

    Cliente_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Sexo_ID = db.Column(db.Integer, db.ForeignKey('Sexo.Sexo_ID'))
    Distrito_Codigo = db.Column(db.Integer, db.ForeignKey('Distrito.Codigo'))
    Nombre = db.Column(db.String(100), nullable=False)
    TipoCliente = db.Column(db.String(50))
    TipoDoc_ID = db.Column(db.Integer, db.ForeignKey('TipoDocumento.TipoDoc_ID'), nullable=False)
    NumDoc = db.Column(db.String(15), nullable=False)
    Telefono = db.Column(db.String(15))
    Correo = db.Column(db.String(100))
    Direccion = db.Column(db.String(150))
    FechaCreacion = db.Column(db.Date, default=db.func.current_date())
    FechaNacimiento = db.Column(db.Date)
    Estado = db.Column(db.Boolean, nullable=False)

    # Relación con Venta
    ventas = db.relationship('Venta', backref='cliente', lazy=True)


class Rol(db.Model):
    __tablename__ = 'Rol'

    Rol_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Nombre = db.Column(db.String(50), nullable=False)
    Estado = db.Column(db.Boolean, nullable=False)

    # Relación con Empleado
    empleados = db.relationship('Empleado', backref='rol', lazy=True)


class Empleado(db.Model):
    __tablename__ = 'Empleado'

    Empleado_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Rol_ID = db.Column(db.Integer, db.ForeignKey('Rol.Rol_ID'), nullable=False)
    Sexo_ID = db.Column(db.Integer, db.ForeignKey('Sexo.Sexo_ID'))
    TipoDoc_ID = db.Column(db.Integer, db.ForeignKey('TipoDocumento.TipoDoc_ID'), nullable=False)
    Distrito_Codigo = db.Column(db.Integer, db.ForeignKey('Distrito.Codigo'), nullable=False)
    Nombres = db.Column(db.String(100), nullable=False)
    Apellidos = db.Column(db.String(100), nullable=False)
    Edad = db.Column(db.String(3), nullable=False)
    NumeroDoc = db.Column(db.String(15), nullable=False)
    FechaNacimiento = db.Column(db.Date, nullable=False)
    Telefono = db.Column(db.String(15))
    Correo = db.Column(db.String(100))
    Usuario = db.Column(db.String(50))
    Clave = db.Column(db.String(256), nullable=False)
    Estado = db.Column(db.Boolean, nullable=False)

    # Relación con Venta
    ventas = db.relationship('Venta', backref='empleado', lazy=True)


class Venta(db.Model):
    __tablename__ = 'Venta'

    Venta_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Cliente_ID = db.Column(db.Integer, db.ForeignKey('Cliente.Cliente_ID'), nullable=False)
    Empleado_ID = db.Column(db.Integer, db.ForeignKey('Empleado.Empleado_ID'), nullable=False)
    FechaVenta = db.Column(db.Date, nullable=False)
    Total = db.Column(db.Numeric(10, 2), nullable=False, server_default=text("0.00"))
    Estado = db.Column(db.Boolean, nullable=False)

    # Relación con DetalleVenta
    detalles = db.relationship('DetalleVenta', backref='venta', lazy=True)


class DetalleVenta(db.Model):
    __tablename__ = 'DetalleVenta'

    DetalleVenta_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Venta_ID = db.Column(db.Integer, db.ForeignKey('Venta.Venta_ID'), nullable=False)
    Producto_ID = db.Column(db.Integer, db.ForeignKey('Producto.Producto_ID'), nullable=False)
    Cantidad = db.Column(db.Integer, nullable=False)
    PrecioUnitario = db.Column(db.Numeric(10, 2), nullable=False)
    SubTotal = db.Column(db.Numeric(10, 2), nullable=False, server_default=text("0.00"))
    Estado = db.Column(db.Boolean, nullable=False)
