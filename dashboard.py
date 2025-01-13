from collections import defaultdict

from flask import Blueprint, render_template, jsonify, request
from models.booking_room import Booking
from models.department import Department
from models.booking_name import Booking_name
from cnnDatabase import db
from sqlalchemy import func
from datetime import datetime, timedelta
from user_management import admin_required

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard')
@admin_required
def dashboard():
    title = 'Dashboard'
    bookings = Booking.query.all()
    total_bookings = len(bookings)
    departments = Department.query.all()
    total_department = len(departments)
    booking_names = Booking_name.query.all()
    total_b_name = len(booking_names)
    #total_rooms = 4  # Giả sử có 4 phòng
    # Truy vấn số lượng đặt phòng theo tên phòng
    room_department_data = (
        db.session.query(
            Booking.room_name,  # Lấy tên phòng
            Booking.department,  # Lấy bộ phận
            func.count(Booking.booking_id).label('booking_count')  # Đếm số booking
        )
        .filter(Booking.isDeleted == False)  # Bỏ qua các booking đã xóa
        .group_by(Booking.room_name, Booking.department)  # Nhóm theo phòng và bộ phận
        .all()
    )

    # Tạo labels và data từ kết quả truy vấn
    labels_rooms = list(set([entry[0] for entry in room_department_data]))  # Tên phòng (loại bỏ trùng lặp)
    labels_departments = list(
        set([entry[1] or "Unknown" for entry in room_department_data]))  # Bộ phận (nếu None -> Unknown)

    # Chuẩn bị dữ liệu dạng ma trận: mỗi hàng là phòng, mỗi cột là department
    data_matrix = {room: [0] * len(labels_departments) for room in labels_rooms}
    for room_name, department, count in room_department_data:
        dep_index = labels_departments.index(department or "Unknown")
        data_matrix[room_name][dep_index] = count

    return render_template(
        'dashboard.html',
        total_bookings=total_bookings,
        total_department=total_department,
        total_b_name=total_b_name,
        labels_rooms=labels_rooms,
        labels_departments=labels_departments,
        data_matrix=data_matrix,
        title = title
    )



def filter_by_time(query, time_filter):
    """
    Lọc dữ liệu theo khoảng thời gian: ngày, tuần, tháng hoặc năm.
    """
    today = datetime.now()
    start_date = None
    end_date = None

    # Xác định start_date và end_date
    if time_filter == "day":
        start_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
    elif time_filter == "week":
        start_date = today - timedelta(days=today.weekday())  # Đầu tuần (Thứ Hai)
        end_date = start_date + timedelta(days=6)  # Cuối tuần (Chủ Nhật)
    elif time_filter == "month":
        start_date = today.replace(day=1)  # Đầu tháng
        next_month = start_date.replace(day=28) + timedelta(days=4)  # Đầu tháng tiếp theo
        end_date = next_month.replace(day=1) - timedelta(seconds=1)  # Cuối tháng
    elif time_filter == "year":
        start_date = today.replace(month=1, day=1)  # Đầu năm
        end_date = start_date.replace(year=start_date.year + 1) - timedelta(seconds=1)  # Cuối năm
    else:
        raise ValueError(f"Invalid time_filter: {time_filter}")

    # Áp dụng filter vào query
    if time_filter == "day":
        query = query.filter(Booking.reservation_date == start_date.date())
    elif start_date and end_date:
        query = query.filter(
            Booking.reservation_date >= start_date.date(),
            Booking.reservation_date <= end_date.date()
        )

    return query

@dashboard_bp.route('/dashboard/filter')
def dashboard_filter():
    time_filter = request.args.get('time', 'day')

    # Truy vấn cơ sở dữ liệu
    query = db.session.query(
        Booking.room_name,
        Booking.department,
        func.count(Booking.booking_id).label('booking_count')
    ).filter(Booking.isDeleted == False).group_by(Booking.room_name, Booking.department)

    # Áp dụng bộ lọc thời gian
    query = filter_by_time(query, time_filter)
    data = query.all()

    # Xử lý nếu không có dữ liệu
    if not data:
        return jsonify({"labels": [], "datasets": []})

    # Tạo labels và ma trận dữ liệu
    labels_rooms = list(set([entry[0] for entry in data]))
    labels_departments = list(set([entry[1] if entry[1] else "Unknown" for entry in data]))

    data_matrix = defaultdict(lambda: [0] * len(labels_departments))
    for room_name, department, count in data:
        dep_index = labels_departments.index(department or "Unknown")
        data_matrix[room_name][dep_index] = count

    # Danh sách màu sắc
    COLORS = [
        "rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)",
        "rgba(255, 206, 86, 0.6)", "rgba(75, 192, 192, 0.6)",
        "rgba(153, 102, 255, 0.6)", "rgba(255, 159, 64, 0.6)"
    ]

    # Tạo datasets
    datasets = [
        {
            "label": department,
            "data": [data_matrix[room][i] for room in labels_rooms],
            "backgroundColor": COLORS[i % len(COLORS)],
            "borderColor": COLORS[i % len(COLORS)].replace("0.6", "1"),
            "borderWidth": 1
        }
        for i, department in enumerate(labels_departments)
    ]

    # Trả về JSON
    return jsonify({"labels": labels_rooms, "datasets": datasets})