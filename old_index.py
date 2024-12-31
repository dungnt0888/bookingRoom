from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, Blueprint

from models.booking_name import Booking_name
from models.department import Department
from zoneinfo import ZoneInfo
from pytz import timezone
from datetime import datetime, timedelta

index_bp = Blueprint('index', __name__)

@index_bp.route('/index')
def index():
    meetings = Booking_name.query.filter_by(isActive=True).all()
    departments = Department.query.all()

    # Lấy ngày được chọn hoặc tính tuần dựa trên offset
    selected_date = request.args.get('selected_date')
    offset = int(request.args.get('offset', 0))
    tz = ZoneInfo("Asia/Ho_Chi_Minh")

    if selected_date:
        selected_date = datetime.strptime(selected_date, '%Y-%m-%d').date()
        start_of_week = selected_date - timedelta(days=selected_date.weekday())
    else:
        today = datetime.now(tz).date()
        start_of_week = today - timedelta(days=today.weekday()) + timedelta(weeks=offset)

    end_of_week = start_of_week + timedelta(days=6)
    current_date = datetime.now(tz).date()

    # Tạo danh sách ngày từ Thứ Hai đến Chủ Nhật
    week_days = [start_of_week + timedelta(days=i) for i in range(7)]
    week_range = f"{start_of_week.strftime('%d-%m-%Y')} đến {end_of_week.strftime('%d-%m-%Y')}"

    # Kiểm tra tuần hiện tại
    new_year = start_of_week.year
    new_week_num = start_of_week.isocalendar()[1]
    is_current_week = (offset == 0)
    week_label = f"Tuần {new_week_num} - Năm {new_year}  --- {'Lịch tuần này' if is_current_week else 'Lịch'}"

    # Dữ liệu giả lập khung giờ
    time_slots = [
        "7:00-07:30", "7:30-8:00", "8:00-8:30", "8:30-9:00", "9:00-9:30", "9:30-10:00",
        "10:00-10:30", "10:30-11:00", "11:00-11:30", "11:30-12:00",
        "12:00-13:30",
        "13:30-14:00", "14:00-14:30", "14:30-15:00", "15:00-15:30",
        "15:30-16:00", "16:00-16:30", "16:30-17:00", "17:00-17:30",
        "17:30-18:00", "18:00-18:30", "18:30-19:00", "19:00-19:30", "19:30-20:00"
    ]

    # Tính toán các slot không khả dụng
    current_time_obj = datetime.now(tz).time()
    inactive_slots = {
        day_index: [
            time_slot for time_slot in time_slots
            if week_days[day_index] < current_date or
               (week_days[day_index] == current_date and
                datetime.strptime(time_slot.split('-')[1], "%H:%M").time() <= current_time_obj)
        ]
        for day_index in range(7)
    }

    return render_template(
        'index.html',
        time_slots=time_slots,
        week_range=week_range,
        week_label=week_label,
        offset=offset,
        week_days=week_days,
        current_date=current_date,
        inactive_slots=inactive_slots,
        current_time_now=datetime.now(tz).strftime("%H:%M"),
        meetings=meetings,
        departments=departments
    )