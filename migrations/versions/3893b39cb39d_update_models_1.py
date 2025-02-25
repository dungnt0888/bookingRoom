"""update models 1

Revision ID: 3893b39cb39d
Revises: 64fe5c068481
Create Date: 2024-12-23 10:19:04.236825

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3893b39cb39d'
down_revision = '64fe5c068481'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('booking_name', schema=None) as batch_op:
        batch_op.alter_column('booking_name',
               existing_type=sa.VARCHAR(length=50),
               type_=sa.String(length=100),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('booking_name', schema=None) as batch_op:
        batch_op.alter_column('booking_name',
               existing_type=sa.String(length=100),
               type_=sa.VARCHAR(length=50),
               existing_nullable=False)

    # ### end Alembic commands ###
