from flask import session, redirect, url_for, flash
from functools import wraps

def login_required(f):
    """
    Decorator để yêu cầu người dùng đăng nhập trước khi truy cập route.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            flash("You need to log in to access this page.", "danger")
            return redirect(url_for('login.login'))  # Chuyển hướng đến trang login
        return f(*args, **kwargs)
    return decorated_function
