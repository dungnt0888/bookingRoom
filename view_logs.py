from flask import Blueprint, render_template, request
from models.logs import Log

# Tạo Blueprint
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/view_logs')
def view_logs():
    """
    Route để hiển thị danh sách logs cho admin với phân trang.
    """
    try:
        # Lấy số trang hiện tại từ query parameter (mặc định là 1)
        page = request.args.get('page', 1, type=int)
        per_page = 20  # Số bản ghi mỗi trang

        # Lấy logs với phân trang
        pagination = Log.query.order_by(Log.operation_time.desc()).paginate(page=page, per_page=per_page)

        return render_template('view_logs.html', logs=pagination.items, pagination=pagination)
    except Exception as e:
        return f"Error loading logs: {e}", 500
