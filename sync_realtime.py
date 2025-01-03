# sync_realtime.py
from flask_socketio import SocketIO, emit
from flask import Blueprint


sync_realtime_bp = Blueprint('sync_realtime', __name__)

# Khởi tạo SocketIO (sẽ được kết nối với app chính)
socketio = SocketIO(cors_allowed_origins="*")


# Sự kiện để xử lý cập nhật sự kiện
@socketio.on('update_event')
def handle_update_event(data):
    """
    Nhận thông tin sự kiện được chỉnh sửa từ client
    và phát thông báo đến tất cả các client khác.
    """
    #print(f"Received event update: {data}")
    emit('refresh_events', data, broadcast=True)  # Phát thông báo tới tất cả client

