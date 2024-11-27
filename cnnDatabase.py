import os
from flask_sqlalchemy import SQLAlchemy
import psycopg2
from contextlib import contextmanager
from flask_migrate import Migrate

# Cấu hình mặc định cho kết nối cục bộ
LOCAL_DB_CONFIG = {
    'host': 'localhost',
    'database': 'meeting_schedule',
    'user': 'postgres',
    'password': '1234'
}

# Khởi tạo đối tượng SQLAlchemy mà không gắn vào một Flask app cụ thể
db = SQLAlchemy()
migrate = Migrate()



def init_db(app):
    """Hàm để khởi tạo database với một Flask app."""
    # Lấy URL từ biến môi trường hoặc sử dụng cấu hình local
    database_url = os.getenv(
        'DATABASE_URL',
        f"postgresql://{LOCAL_DB_CONFIG['user']}:{LOCAL_DB_CONFIG['password']}@{LOCAL_DB_CONFIG['host']}/{LOCAL_DB_CONFIG['database']}"
    )
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    migrate.init_app(app, db)

@contextmanager
def get_connection():
    """Hàm tạo kết nối với cơ sở dữ liệu bằng psycopg2."""
    conn = None
    try:
        # Lấy URL từ biến môi trường hoặc sử dụng cấu hình local
        database_url = os.getenv(
            'DATABASE_URL',
            f"postgresql://{LOCAL_DB_CONFIG['user']}:{LOCAL_DB_CONFIG['password']}@{LOCAL_DB_CONFIG['host']}/{LOCAL_DB_CONFIG['database']}"
        )
        conn = psycopg2.connect(database_url)
        yield conn
    except psycopg2.DatabaseError as error:
        print(f"Lỗi kết nối cơ sở dữ liệu: {error}")
    finally:
        if conn:
            conn.close()

def execute_query(query, params=None):
    """Hàm thực thi câu truy vấn mà không cần lấy dữ liệu (như INSERT, UPDATE, DELETE)."""
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            conn.commit()

def fetch_query(query, params=None):
    """Hàm thực thi câu truy vấn và trả về kết quả (như SELECT)."""
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()
