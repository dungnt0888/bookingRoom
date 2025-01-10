"""Add holidays table

Revision ID: 1f449fb5d340
Revises: 98eeb68940c0
Create Date: 2025-01-10 09:11:48.639169

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision = '1f449fb5d340'
down_revision = '98eeb68940c0'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('holiday', schema=None) as batch_op:
        connection = batch_op.get_bind()
        inspector = Inspector.from_engine(connection)

        # Kiểm tra sự tồn tại của cột 'h_date'
        columns = [col['name'] for col in inspector.get_columns('holiday')]
        if 'h_date' not in columns:
            batch_op.add_column(sa.Column('h_date', sa.DATE(), nullable=False))


def downgrade():
    with op.batch_alter_table('holiday', schema=None) as batch_op:
        batch_op.drop_column('h_date')
