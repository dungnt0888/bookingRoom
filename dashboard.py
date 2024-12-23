from flask import Blueprint, render_template, jsonify, request
from models.booking_room import Booking
from models.department import Department
from models.booking_name import Booking_name
from cnnDatabase import db
from sqlalchemy import func
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard')
def dashboard():
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
        data_matrix=data_matrix
    )



def filter_by_time(query, time_filter):
    today = datetime.now()
    if time_filter == "day":
        start_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
    elif time_filter == "week":
        start_date = today - timedelta(days=today.weekday())  # Đầu tuần
    elif time_filter == "month":
        start_date = today.replace(day=1)  # Đầu tháng
    elif time_filter == "year":
        start_date = today.replace(month=1, day=1)  # Đầu năm
    else:
        start_date = None

    if start_date:
        query = query.filter(Booking.reservation_date >= start_date.date())
    return query

@dashboard_bp.route('/dashboard/filter')
def dashboard_filter():
    time_filter = request.args.get('time', 'day')
    query = db.session.query(
        Booking.room_name,
        Booking.department,
        func.count(Booking.booking_id).label('booking_count')
    ).filter(Booking.isDeleted == False).group_by(Booking.room_name, Booking.department)

    query = filter_by_time(query, time_filter)
    data = query.all()

    # Chuẩn bị labels và datasets
    labels_rooms = list(set([entry[0] for entry in data]))
    labels_departments = list(set([entry[1] or "Unknown" for entry in data]))

    data_matrix = {room: [0] * len(labels_departments) for room in labels_rooms}
    for room_name, department, count in data:
        dep_index = labels_departments.index(department or "Unknown")
        data_matrix[room_name][dep_index] = count

    datasets = [
        {
            "label": department,
            "data": [data_matrix[room][i] for room in labels_rooms],
            "backgroundColor": f"rgba({i*50 % 255}, {i*80 % 255}, {i*100 % 255}, 0.6)",
            "borderColor": f"rgba({i*50 % 255}, {i*80 % 255}, {i*100 % 255}, 1)",
            "borderWidth": 1
        }
        for i, department in enumerate(labels_departments)
    ]

    return jsonify({"labels": labels_rooms, "datasets": datasets})