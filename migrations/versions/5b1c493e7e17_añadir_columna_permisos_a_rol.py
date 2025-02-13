"""Añadir columna permisos a Rol

Revision ID: 5b1c493e7e17
Revises: d5c24728b55c
Create Date: 2025-02-08 13:54:58.858740

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mssql

# revision identifiers, used by Alembic.
revision = '5b1c493e7e17'
down_revision = 'd5c24728b55c'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Eliminar los registros existentes en la tabla Empleado
    op.execute("DELETE FROM Empleado")
    
    # 2. Eliminar los registros existentes en la tabla Rol
    op.execute("DELETE FROM Rol")
    # 3. Reiniciar la semilla de identidad en la tabla Rol para que el siguiente ID sea 1.
    op.execute("DBCC CHECKIDENT ('Rol', RESEED, 0)")
    
    # 4. Añadir la columna "Permisos" a la tabla Rol
    with op.batch_alter_table('Rol', schema=None) as batch_op:
        batch_op.add_column(sa.Column('Permisos', sa.Text(), nullable=False))
    
    # 5. Definir una tabla auxiliar para la inserción masiva en Rol, incluyendo la columna Estado
    rol_table = sa.table(
        'Rol',
        sa.column('Nombre', sa.String),
        sa.column('Permisos', sa.Text),
        sa.column('Estado', sa.Integer)  # O sa.Boolean() si ese es el tipo definido en tu modelo
    )
    
    # 6. Insertar 2 nuevos registros en la tabla Rol
    op.bulk_insert(
        rol_table,
        [
            {
                'Nombre': 'Gerente',
                'Permisos': '["roles", "ventas", "productos", "detalleVentas", "clientes", "empleados", "home"]',
                'Estado': 1
            },
            {
                'Nombre': 'Empleado',
                'Permisos': '["ventas", "home"]',
                'Estado': 1
            }
        ]
    )
    
    # 7. Insertar los registros en la tabla Empleado usando los nuevos roles (asumiendo que Gerente tendrá Rol_ID = 1 y Empleado Rol_ID = 2)
    op.execute(
        """
        INSERT INTO Empleado (Rol_ID, Sexo_ID, TipoDoc_ID, Distrito_Codigo, Nombres, Apellidos, Edad, NumeroDoc, FechaNacimiento, Telefono, Correo, Usuario, Clave, Estado)
        VALUES
        (2, 1, 1, 12, 'Enzo Fabian', 'Cruz Tamariz', '25', '76287211', '1999-12-01', '931274022', 'hehnzo1473@gmail.com', 'ECRUZ', '123456', 1),
        (1, 2, 1, 15, 'Luis Alberto', 'Martinez Rojas', '30', '85623948', '1993-05-20', '912345678', 'luis.martinez@email.com', 'LMARTINEZ', 'abcdef', 1);
        """
    )

def downgrade():
    # En el downgrade, se elimina la columna "Permisos" de la tabla Rol.
    with op.batch_alter_table('Rol', schema=None) as batch_op:
        batch_op.drop_column('Permisos')