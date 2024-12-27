#save booking
from models.booking_room import Booking
from cnnDatabase import db
from datetime import datetime

def save_booking(booking_name, department, meeting_content, chairman, start_time, end_time, reservation_date, room_name, username):
    """
    Hàm lưu thông tin đặt phòng vào cơ sở dữ liệu và trả về booking_id.
    """
    try:

        #print(reservation_date)

        reservation_date_obj = (
            datetime.strptime(reservation_date, '%Y/%m/%d').date()
            if len(reservation_date.split('/')[0]) == 4
            else datetime.strptime(reservation_date, '%d/%m/%Y').date()
        )
        start_time_obj = datetime.strptime(start_time, '%H:%M').time()
        end_time_obj = datetime.strptime(end_time, '%H:%M').time()


        # Kiểm tra phòng đã được đặt chưa
        existing_booking = Booking.query.filter(
            Booking.room_name == room_name,
            Booking.reservation_date == reservation_date_obj,
            Booking.isDeleted != True  # Kiểm tra nếu booking chưa bị xóa
        ).filter(
            (Booking.start_time < end_time_obj) & (Booking.end_time > start_time_obj)  # Thời gian bị chồng lấn
        ).first()
        #print(existing_booking)

        if existing_booking:
            print("Room is already booked for the selected time slot.", "error")
            return {"success": False, "message": "Đã có phòng trong khoảng thời gian này."}

        # Tạo một đối tượng Booking mới
        new_booking = Booking(
            booking_name=booking_name,
            department=department,
            meeting_content=meeting_content,
            chairman=chairman,
            start_time=start_time_obj,
            end_time=end_time_obj,
            reservation_date=reservation_date_obj,
            room_name=room_name,
            username = username
        )

        # Thêm booking mới vào session và commit
        db.session.add(new_booking)
        db.session.commit()

        # Trả về booking_id sau khi lưu thành công
        return {"success": True, "booking_id": new_booking.booking_id}
    except Exception as e:
        db.session.rollback()  # Hoàn tác nếu có lỗi
        print(f"Failed to save booking: {e}")
        raise
