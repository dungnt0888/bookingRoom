from email.policy import default

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
    user_status = db.Column(db.String(20), default='Active')

    def __init__(self, username, firstname, lastname, email, password, role, user_status= 'Active'):
        self.username = username
        self.firstname = firstname
        self.lastname = lastname
        self.email = email
        self.password = password
        self.role = role
        self.user_status = user_status

    def __repr__(self):
        return f"<User {self.username}>"