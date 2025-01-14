from flask import jsonify
from models.room_color import RoomColor
from sqlalchemy.exc import SQLAlchemyError
from cnnDatabase import db



def get_room_colour():
    """Lấy danh sách màu phòng từ database."""
    try:
        colors = RoomColor.query.all()
        return colors or []  # Trả về danh sách rỗng nếu không có dữ liệu
    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        return []  # Trả về danh sách rỗng khi có lỗi

def edit_color(room, color):
    try:
        # Tìm phòng theo tên
        room_color = RoomColor.query.filter_by(c_room=room).first()
        if room_color:
            # Cập nhật màu mới
            room_color.c_color = color
            db.session.commit()
            return {"success": True}
        else:
            return {"success": False, "error": "Phòng không tồn tại"}
    except Exception as e:
        print(f"Lỗi khi cập nhật màu: {e}")
        return {"success": False, "error": "Lỗi hệ thống khi cập nhật màu"}