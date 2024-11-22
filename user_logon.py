from werkzeug.security import check_password_hash
from models.user import User
from cnnDatabase import db
from flask import Blueprint, request, session, flash, redirect, url_for, jsonify

# Tạo Blueprint cho chức năng đăng nhập
login_bp = Blueprint('login', __name__)

def authenticate_user(username, password):
    """
    Hàm xác thực người dùng dựa trên username và password.
    :param username: Tên người dùng
    :param password: Mật khẩu của người dùng
    :return: Thông báo xác thực thành công hoặc lỗi
    """
    # Truy vấn người dùng từ database
    user = User.query.filter_by(username=username).first()

    if user and user.password == password:
        if user.user_status != 'Active':
            return f"Tài khoản của bạn đã bị vô hiệu", None
        return f"Đăng nhập thành công! Chào mừng {user.firstname} {user.lastname}.", user
    return "Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.", None


@login_bp.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    message, user = authenticate_user(username, password)

    if user:  # Nếu xác thực thành công
        session['username'] = user.username  # Lưu tên người dùng vào session
        session['role'] = user.role  # Lưu vai trò vào session
        flash(message, 'success')
        return redirect(url_for('index'))
    else:  # Nếu xác thực thất bại
        flash(message, 'error')
        return redirect(url_for('index'))

@login_bp.route('/logout')
def logout():
    session.pop('username', None)  # Xóa username khỏi session
    session.pop('role', None)  # Xóa role khỏi session
    flash("Bạn đã đăng xuất thành công.", 'success')
    return redirect(url_for('index'))


@login_bp.route('/session_info')
def session_info():
    return jsonify({
        'username': session.get('username', 'Guest'),
        'role': session.get('role', 'Guest')
    })