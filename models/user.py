from cnnDatabase import db


class User(db.Model):
    __tablename__ = 'user_table'  # Tên bảng trong cơ sở dữ liệu
    user_id = db.Column(db.Integer, primary_key=True)  # ID người dùng, khóa chính
    username = db.Column(db.String(50), nullable=False, unique=True)  # Tên đăng nhập
    firstname = db.Column(db.String(50), nullable=False)  # Tên
    lastname = db.Column(db.String(50), nullable=False)  # Họ
    email = db.Column(db.String(100), nullable=False, unique=True)  # Email
    password = db.Column(db.String(255), nullable=False)  # Mật khẩu (hashed)
    role = db.Column(db.String(50), nullable=False)  # Vai trò (admin, user, etc.)

    def __repr__(self):
        return f"<User {self.username}>"