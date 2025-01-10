from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision = 'f3b92399ca49'
down_revision = '1f449fb5d340'
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()
    inspector = Inspector.from_engine(connection)

    # Lấy danh sách các ràng buộc duy nhất trong bảng "holiday"
    constraints = inspector.get_unique_constraints('holiday')
    constraint_names = [constraint['name'] for constraint in constraints]

    # Kiểm tra sự tồn tại của 'holiday_h_name_key' trước khi xóa
    if 'holiday_h_name_key' in constraint_names:
        with op.batch_alter_table('holiday', schema=None) as batch_op:
            batch_op.drop_constraint('holiday_h_name_key', type_='unique')


def downgrade():
    with op.batch_alter_table('holiday', schema=None) as batch_op:
        # Tạo lại ràng buộc duy nhất trên cột 'h_name'
        batch_op.create_unique_constraint('holiday_h_name_key', ['h_name'])
