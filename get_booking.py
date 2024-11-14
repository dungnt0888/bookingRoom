from cnnDatabase import db
from models.booking_room import Booking


def get_all_bookings():
    """Hàm lấy tất cả các booking từ bảng booking."""
    try:
        bookings = Booking.query.all()
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
                "room_name": booking.room_name
            })

        return bookings_data
    except Exception as e:
        print(f"Lỗi khi lấy dữ liệu booking: {e}")
        return []