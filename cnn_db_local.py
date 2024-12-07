from flask_sqlalchemy import SQLAlchemy
import psycopg2
from psycopg2 import sql
from contextlib import contextmanager

# not used
# Cấu hình kết nối cơ sở dữ liệu
DB_CONFIG = {
    'host': 'localhost',
    'database': 'meeting_schedule',
    'user': 'postgres',
    'password': '1234'
}

# Khởi tạo đối tượng SQLAlchemy mà không gắn vào một Flask app cụ thể
db = SQLAlchemy()

def init_db(app):
    """Hàm để khởi tạo database với một Flask app."""
    app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}/{DB_CONFIG['database']}"
    db.init_app(app)

@contextmanager
def get_connection():
    """Hàm tạo kết nối với cơ sở dữ liệu bằng psycopg2."""
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
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
