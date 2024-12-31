from werkzeug.security import check_password_hash, generate_password_hash
from models.user import User
from cnnDatabase import db
from flask import Blueprint, request, session, flash, redirect, url_for, jsonify, render_template

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


@login_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        # Render trang login
        return render_template('login.html')

    # Xử lý logic đăng nhập khi nhận POST request
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '').strip()

    if not username or not password:
        flash("Tên đăng nhập và mật khẩu không được để trống.", 'error')
        return redirect(url_for('login.login'))

    # Gọi hàm xác thực
    message, user = authenticate_user(username, password)

    if user:
        session['username'] = user['username'] if isinstance(user, dict) else user.username
        session['role'] = user['role'] if isinstance(user, dict) else user.role
        flash(message, 'success')
        return redirect(url_for('calendar.calendar'))
    else:
        flash(message, 'error')
        return redirect(url_for('login.login'))


@login_bp.route('/logout')
def logout():
    session.pop('username', None)  # Xóa username khỏi session
    session.pop('role', None)  # Xóa role khỏi session
    session.clear()
    flash("Bạn đã đăng xuất thành công.", 'success')
    return redirect(url_for('calendar.calendar'))


@login_bp.route('/session_info', methods=['GET'])
def session_info():
    """
    Endpoint to return session information.
    """
    return jsonify({
        'username': session.get('username', 'Guest'),
        'role': session.get('role', 'Guest')
    }), 200  # Trả về HTTP status code 200


@login_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        email = request.form['email']
        password = request.form['password']

        # Kiểm tra user tồn tại
        if User.query.filter_by(username=username).first():
            flash('Username already exists!', 'danger')
            return redirect(url_for('login.register'))
        if User.query.filter_by(email=email).first():
            flash('Email already in use!', 'danger')
            return redirect(url_for('login.register'))

        # Hash mật khẩu và tạo user
        #hashed_password = generate_password_hash(password, method='sha256')
        new_user = User(username=username, firstname=firstname, lastname=lastname,
                        email=email, password=password, role='user')
        db.session.add(new_user)
        db.session.commit()

        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login.login'))
    return render_template('register.html')

