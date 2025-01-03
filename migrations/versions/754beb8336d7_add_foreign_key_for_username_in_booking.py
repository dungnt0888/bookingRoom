"""Add foreign key for username in Booking

Revision ID: 754beb8336d7
Revises: 15a7478e9c9c
Create Date: 2024-12-18 15:28:46.368221

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '754beb8336d7'
down_revision = '15a7478e9c9c'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
            INSERT INTO user_table (username, firstname, lastname, email, password, role, user_status)
            SELECT 'root', 'System', 'Administrator', 'root@system.com', 'root', 'Administrator', 'Active'
            WHERE NOT EXISTS (
                SELECT 1 FROM user_table WHERE username = 'root'
            );
        """)

    op.execute("""
                INSERT INTO user_table (username, firstname, lastname, email, password, role, user_status)
                SELECT 'admin', 'System', 'Administrator', 'admin@system.com', 'admin1234', 'Administrator', 'Active'
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_table WHERE username = 'admin'
                );
            """)

    op.execute("""
                  INSERT INTO booking_name (booking_name, description)
                  SELECT 'Họp giao ban', 'Họp giao ban'
                  WHERE NOT EXISTS (
                      SELECT 1 FROM booking_name WHERE booking_name = 'Họp giao ban'
                  );
              """)

    op.execute("""
                      INSERT INTO booking_name (booking_name, description)
                      SELECT 'Họp nội bộ', 'Họp nội bộ'
                      WHERE NOT EXISTS (
                          SELECT 1 FROM booking_name WHERE booking_name = 'Họp nội bộ'
                      );
                  """)

    op.execute("""
                          INSERT INTO booking_name (booking_name, description)
                          SELECT 'Họp đối tác', 'Họp đối tác'
                          WHERE NOT EXISTS (
                              SELECT 1 FROM booking_name WHERE booking_name = 'Họp đối tác'
                          );
                      """)

    op.execute("""
                              INSERT INTO booking_name (booking_name, description)
                              SELECT 'Báo cáo thử việc', 'Báo cáo thử việc'
                              WHERE NOT EXISTS (
                                  SELECT 1 FROM booking_name WHERE booking_name = 'Báo cáo thử việc'
                              );
                          """)

    op.execute("""
                                  INSERT INTO department (name)
                                  SELECT 'HCNS'
                                  WHERE NOT EXISTS (
                                      SELECT 1 FROM department WHERE name = 'HCNS'
                                  );
                              """)

    op.execute("""
                                      INSERT INTO department (name)
                                      SELECT 'Kế toán'
                                      WHERE NOT EXISTS (
                                          SELECT 1 FROM department WHERE name = 'Kế toán'
                                      );
                                  """)

    op.execute("""
                                          INSERT INTO department (name)
                                          SELECT 'Thiết kế 1'
                                          WHERE NOT EXISTS (
                                              SELECT 1 FROM department WHERE name = 'Thiết kế 1'
                                          );
                                      """)

    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('booking', schema=None) as batch_op:
        batch_op.create_foreign_key(None, 'user_table', ['username'], ['username'], ondelete='CASCADE')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('booking', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')

    # Xóa user 'root' nếu tồn tại
    op.execute("DELETE FROM user_table WHERE username = 'root';")

    # ### end Alembic commands ###
