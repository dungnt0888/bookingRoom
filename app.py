from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from datetime import datetime, timedelta
from flask_migrate import Migrate, upgrade
import os
from sqlalchemy.sql.functions import current_time

from calendar_view import calendar_bp
from log_in import authenticate_user
from save_booking import save_booking
from models.booking_room import Booking
from models.user import User
from cnnDatabase import init_db, db
from delete_booking import booking_delete_bp  # Import blueprint từ booking_delete.py
from user_logon import login_bp
from booking_api import booking_bp
from user_management import user_bp
from zoneinfo import ZoneInfo
from send_email import EmailHandler
from flask_mail import Mail
from models.booking_name import Booking_name
from auto_delete_schedule import delete_expired_bookings
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
from sqlalchemy import inspect
from view_logs import admin_bp
from models.department import Department
from dashboard import dashboard_bp
from calendar_view import calendar_bp
from pytz import timezone
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR

app = Flask(__name__)
app.secret_key = 'your_secret_key_asdw_23123'  # Thay 'your_secret_key' bằng một chuỗi ngẫu nhiên và bảo mật

init_db(app)

migrate = Migrate(app, db)


with app.app_context():
    # **Xóa bảng booking** nếu tồn tại
    #inspector = inspect(db.engine)
    #if 'booking' in inspector.get_table_names():
    #    Booking.__table__.drop(db.engine)
    #    print("Bảng 'booking' đã bị xóa.")

    # **Tạo lại bảng booking**
    db.create_all()
    #print("Bảng 'booking' đã được tạo lại.")




#with app.app_context():
    #db.drop_all(tables=[Booking.__table__])
    #db.create_all()
#def hello_world():  # put application's code here
#   return 'Hello World!'

# Cấu hình Flask
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'dungnt.0888@gmail.com'
app.config['MAIL_PASSWORD'] = 'skdb fukz ujec jvcn'
app.config['MAIL_DEFAULT_SENDER'] = 'dungnt.0888@gmail.com'

# Khởi tạo EmailHandler
email_handler = EmailHandler()
email_handler.init_app(app)
app.register_blueprint(login_bp)
app.register_blueprint(user_bp, url_prefix='/user')
app.register_blueprint(booking_bp, url_prefix='/api/booking')

app.register_blueprint(admin_bp, url_prefix='/admin')

app.register_blueprint(dashboard_bp)

app.register_blueprint(calendar_bp)

def job_listener(event):
    if event.exception:
        print(f"Job {event.job_id} failed: {event.exception}")
    else:
        print(f"Job {event.job_id} executed successfully.")

scheduler = BackgroundScheduler()
scheduler.configure(timezone=timezone('Asia/Ho_Chi_Minh'))  # Đặt múi giờ Việt Nam
scheduler.add_job(delete_expired_bookings, 'interval', days=1)
if not scheduler.running:
    scheduler.start()
# Thêm listener để theo dõi trạng thái job
scheduler.add_listener(job_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)
# Đảm bảo scheduler được tắt khi ứng dụng dừng
atexit.register(lambda: scheduler.shutdown())






app.register_blueprint(booking_delete_bp)

# Khởi tạo EmailHandler và cấu hình email

@app.route('/')
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




if __name__ == '__main__':
    app.run()


