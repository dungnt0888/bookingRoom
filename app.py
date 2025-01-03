import eventlet
eventlet.monkey_patch()  # Phải ở dòng đầu tiên
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from datetime import datetime, timedelta

from flask_cors import CORS
from flask_migrate import Migrate, upgrade
import os
from sqlalchemy.sql.functions import current_time
#from chat_api import chat_api, socketio
from calendar_view import calendar_bp
from log_in import authenticate_user
from save_booking import save_booking
from models.booking_room import Booking
from models.user import User
from cnnDatabase import init_db, db
from delete_booking import booking_delete_bp  # Import blueprint từ booking_delete.py
from sync_realtime import sync_realtime_bp, socketio
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
from old_index import index_bp

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

app.register_blueprint(index_bp)

#app.register_blueprint(chat_api)

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



socketio.init_app(app, cors_allowed_origins="*")

app.register_blueprint(sync_realtime_bp)

if __name__ == '__main__':
    # Phát hiện môi trường (Render hoặc Localhost)
    is_render = os.environ.get('RENDER', False)
    host = '0.0.0.0' if is_render else '127.0.0.1'
    port = int(os.environ.get('PORT', 5000))  # Render cung cấp PORT qua biến môi trường

    # Chạy server
    socketio.run(app, host=host, port=port, debug=not is_render)


