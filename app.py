from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from datetime import datetime, timedelta
from flask_migrate import Migrate, upgrade
import os
from sqlalchemy.sql.functions import current_time
from log_in import authenticate_user
from save_booking import save_booking
from models.booking_room import Booking
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

app = Flask(__name__)
app.secret_key = 'your_secret_key_asdw_23123'  # Thay 'your_secret_key' bằng một chuỗi ngẫu nhiên và bảo mật

init_db(app)

migrate = Migrate(app, db)




with app.app_context():
    #db.drop_all(tables=[Booking.__table__])
    db.create_all()
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

scheduler = BackgroundScheduler()
scheduler.add_job(delete_expired_bookings, 'interval', days=1)
scheduler.start()

# Đảm bảo scheduler được tắt khi ứng dụng dừng
atexit.register(lambda: scheduler.shutdown())


@app.route('/get_bookings', methods=['GET'])
def get_bookings():
    """Lấy tất cả các booking chưa bị xóa từ cơ sở dữ liệu và trả về dưới dạng JSON."""
    try:
        # Lọc các booking chưa bị xóa
        bookings = Booking.query.filter_by(isDeleted=False).all()
        bookings_data = []

        for booking in bookings:
            bookings_data.append({
                "booking_id": booking.booking_id,
                "booking_name": booking.booking_name,
                "department": booking.department,
                "meeting_content": booking.meeting_content,
                "chairman": booking.chairman,
                "start_time": booking.start_time,
                "end_time": booking.end_time,
                "reservation_date": booking.reservation_date,
                "room_name": booking.room_name,
                "username": booking.username
            })
        #print("Dữ liệu bookings:", bookings_data)  # Ghi lại dữ liệu booking trước khi trả về
        return jsonify(bookings_data)
    except Exception as e:
        # Trả về chi tiết lỗi nếu có lỗi xảy ra
        print("Lỗi khi lấy dữ liệu bookings:", e)
        return jsonify({"message": f"Failed to load bookings: {str(e)}"}), 500


app.register_blueprint(booking_delete_bp)

# Khởi tạo EmailHandler và cấu hình email

@app.route('/')
def index():
    meetings = Booking_name.query.filter_by(isActive = True).all()
    # Dữ liệu giả lập cho các khung giờ
    time_slots = [
        "7:00-07:30", "7:30-8:00", "8:00-8:30", "8:30-9:00", "9:00-9:30", "9:30-10:00",
        "10:00-10:30", "10:30-11:00", "11:00-11:30", "11:30-12:00",
        "12:00-13:30",
        "13:30-14:00", "14:00-14:30", "14:30-15:00", "15:00-15:30",
        "15:30-16:00", "16:00-16:30", "16:30-17:00", "17:00-17:30",
        "17:30-18:00", "18:00-18:30", "18:30-19:00", "19:00-19:30", "19:30-20:00"
    ]
    # Lấy tuần hiện tại nếu không có tham số 'offset'
    offset = int(request.args.get('offset', 0))
    tz = ZoneInfo("Asia/Ho_Chi_Minh")
    # Năm và tuần hiện tại
    current_year = datetime.now(tz).year
    current_week_num = datetime.now(tz).isocalendar()[1]
    #current_week_num = int(datetime.now(tz).strftime('%W'))
    week_num = int(request.args.get('week', current_week_num))

    # Ngày đầu tuần hiện tại
    today = datetime.now(tz)
    start_of_week = today - timedelta(days=today.weekday()) + timedelta(weeks=offset)
    end_of_week = start_of_week + timedelta(days=6)

    # Thời gian hiện tại
    current_time_now = datetime.now(tz).strftime("%H:%M")
    current_time_obj = datetime.strptime(current_time_now, "%H:%M").time()

    # Ngày hiện tại
    current_date = datetime.now(tz).date()

    new_date = current_date + timedelta(weeks=offset)
    new_year = new_date.year
    new_week_num = new_date.isocalendar()[1]

    # Tạo danh sách ngày từ Thứ Hai đến Chủ Nhật
    week_days = [(start_of_week + timedelta(days=i)).date() for i in range(7)]

    # Format ngày thành chuỗi
    week_range = f"{start_of_week.strftime('%d-%m-%Y')} đến {end_of_week.strftime('%d-%m-%Y')}"

    # Kiểm tra xem tuần hiển thị có phải là tuần hiện tại không
    is_current_week = (offset == 0)
    week_label = "Tuần " + str(new_week_num) + " - Năm " + str(new_year)
    if is_current_week:
        week_label += "  ---  Lịch tuần này"
    else:
        week_label += "  ---  Lịch"

    # Tính toán các slot không khả dụng
    inactive_slots = {}
    for day_index, day in enumerate(week_days):
        inactive_slots[day_index] = []
        for time_slot in time_slots:
            end_time = time_slot.split('-')[1]  # Lấy giờ kết thúc
            end_time_obj = datetime.strptime(end_time, "%H:%M").time()
            if day < current_date or (day == current_date and end_time_obj <= current_time_obj):
                inactive_slots[day_index].append(time_slot)

    #current_date = datetime.now().strftime('%d-%m-%Y')  # Định dạng ngày để so sánh

    return render_template('index.html', time_slots=time_slots, week_range=week_range,
                           week_label=week_label, offset=offset, week_days=week_days, current_date=current_date, inactive_slots=inactive_slots,
                           current_time_now=current_time_now,
                           meetings = meetings)



if __name__ == '__main__':
    app.run()
