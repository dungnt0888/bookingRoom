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
    num_user = User.query.count()  # Đếm số lượng user
    user = User.query.filter_by(username=username).first()  # Tìm user theo username

    if num_user == 0 and username == 'root' and password == 'root':
        # Cho phép đăng nhập root user với username và password mặc định nếu bảng rỗng
        return "Đăng nhập thành công! Chào mừng Admin (root user).", {'username': 'root', 'role': 'Administrator'}

    if user:  # Nếu user tồn tại
        if user.user_status != 'Active':  # Kiểm tra trạng thái user
            return "Tài khoản của bạn đã bị vô hiệu hóa.", None
        if user.password == password:  # Kiểm tra mật khẩu
            return f"Đăng nhập thành công! Chào mừng {user.firstname} {user.lastname}.", user

    # Nếu không khớp bất kỳ trường hợp nào, trả về lỗi
    return "Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.", None


@login_bp.route('/login', methods=['POST'])
def login():
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '').strip()

    if not username or not password:  # Kiểm tra đầu vào rỗng
        flash("Tên đăng nhập và mật khẩu không được để trống.", 'error')
        return redirect(url_for('index'))

    message, user = authenticate_user(username, password)

    if user:  # Nếu xác thực thành công
        session['username'] = user['username'] if isinstance(user, dict) else user.username
        session['role'] = user['role'] if isinstance(user, dict) else user.role
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