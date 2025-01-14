from flask import jsonify
from models.room_color import RoomColor
from sqlalchemy.exc import SQLAlchemyError
from cnnDatabase import db



def get_room_colour():
    """Lấy danh sách màu phòng từ database."""
    try:
        colors = RoomColor.query.all()
        if len(colors) == 0:  # Nếu không có bản ghi nào
            default_rooms = [
                RoomColor(c_color="#FF5733", c_room="Phòng họp nhỏ lầu 1"),
                RoomColor(c_color="#33FF57", c_room="Phòng họp dài lầu 1"),
                RoomColor(c_color="#e0f44f", c_room="Phòng họp lầu 2"),
                RoomColor(c_color="#4ce1f3", c_room="Phòng giải trí lầu 9"),
            ]
            db.session.add_all(default_rooms)
            db.session.commit()
            colors = RoomColor.query.all()  # Lấy lại danh sách sau khi thêm dữ liệu
        return colors  # Trả về danh sách rỗng nếu không có dữ liệu
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