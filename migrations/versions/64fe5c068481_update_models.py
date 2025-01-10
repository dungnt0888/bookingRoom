"""update models

Revision ID: 64fe5c068481
Revises: 754beb8336d7
Create Date: 2024-12-20 10:43:42.669682

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '64fe5c068481'
down_revision = '754beb8336d7'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()  # Lấy kết nối database
    inspector = sa.inspect(conn)  # Dùng SQLAlchemy để kiểm tra schema

    # Kiểm tra các ràng buộc UNIQUE trong bảng 'booking_name'
    constraints = inspector.get_unique_constraints("booking_name")
    constraint_names = [c['name'] for c in constraints]

    # Nếu ràng buộc 'unique_booking_name' chưa tồn tại, thì tạo
    if "unique_booking_name" not in constraint_names:
        with op.batch_alter_table('booking_name') as batch_op:
            batch_op.create_unique_constraint('unique_booking_name', ['booking_name'])

    # Tiếp tục các lệnh auto-generated
    with op.batch_alter_table('booking', schema=None) as batch_op:
        batch_op.alter_column('department',
               existing_type=sa.VARCHAR(length=100),
               nullable=True)
        batch_op.create_foreign_key(None, 'booking_name', ['booking_name'], ['booking_name'], ondelete='CASCADE')



def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('booking', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.alter_column('department',
               existing_type=sa.VARCHAR(length=100),
               nullable=False)

    # ### end Alembic commands ###
