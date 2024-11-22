from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for, flash
from models.user import User
from models.booking_room import Booking
from cnnDatabase import db

user_bp = Blueprint('user', __name__, template_folder='templates')

def admin_required(f):
    """Decorator để kiểm tra quyền admin."""
    from functools import wraps

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session or session.get('role') != 'Administrator':
            flash('Access denied! Admins only.')
            return redirect(url_for('index'))
        return f(*args, **kwargs)

    return decorated_function

@user_bp.route('/admin_panel')
@admin_required
def admin_panel():
    """Hiển thị danh sách người dùng và booking với phân trang."""

    # Lấy số trang hiện tại từ query string
    user_page = request.args.get('user_page', 1, type=int)  # Phân trang người dùng
    booking_page = request.args.get('booking_page', 1, type=int)  # Phân trang đặt phòng

    # Phân trang người dùng
    user_pagination = User.query.order_by(User.user_id).paginate(page=user_page, per_page=5)
    users = user_pagination.items

    # Phân trang booking
    booking_pagination = Booking.query.order_by(Booking.booking_id).paginate(
        page=booking_page, per_page=10
    )
    bookings = booking_pagination.items

    # Truyền dữ liệu phân trang vào template
    return render_template(
        'admin_panel.html',
        users=users,
        user_pagination=user_pagination,
        bookings=bookings,
        booking_pagination=booking_pagination
    )


@user_bp.route('/update_user/<int:user_id>', methods=['POST'])
def update_user(user_id):
    # Lấy dữ liệu từ yêu cầu
    data = request.json

    # Tìm người dùng trong database
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    # Cập nhật thông tin người dùng
    user.firstname = data.get('firstname', user.firstname)
    user.lastname = data.get('lastname', user.lastname)
    user.email = data.get('email', user.email)
    user.role = data.get('role', user.role)
    user.password = data.get('password', user.password)  # Lưu ý: Hash mật khẩu trước khi lưu

    # Lưu thay đổi vào database
    try:
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@user_bp.route('/update_status/<int:user_id>', methods=['POST'])
def update_status(user_id):
    # Lấy dữ liệu từ yêu cầu
    data = request.json
    new_status = data.get('status')

    # Tìm người dùng trong database
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    # Cập nhật trạng thái
    user.user_status = new_status

    # Lưu thay đổi vào database
    try:
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('/add_user', methods=['POST'])
def add_user():
    # Lấy dữ liệu từ form
    username = request.form['username']
    password = request.form['password']
    confirm_password = request.form['confirm_password']
    email = request.form['email']
    role = request.form['role']
    firstname = request.form.get('firstname', '')
    lastname = request.form.get('lastname', '')

    # Kiểm tra mật khẩu trùng khớp
    if password != confirm_password:
        return jsonify({'success': False, 'error': 'Passwords do not match'}), 400

    # Kiểm tra username hoặc email đã tồn tại
    existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
    if existing_user:
        return jsonify({'success': False, 'error': 'Username or email already exists'}), 400

    # Thêm user vào database
    new_user = User(
        username=username,
        password=password,  # Lưu ý: Hash mật khẩu trước khi lưu
        email=email,
        role=role,
        firstname=firstname,
        lastname=lastname,
    )
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'success': True}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@user_bp.route('/update_booking_status/<int:booking_id>', methods=['POST'])
def update_booking_status(booking_id):
    """
    Cập nhật trạng thái isDeleted cho một booking.
    """
    try:
        data = request.json
        new_status = data.get('isDeleted')

        # Tìm booking trong database
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'success': False, 'error': 'Booking not found'}), 404

        # Cập nhật trạng thái
        booking.isDeleted = new_status
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500