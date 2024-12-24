from datetime import datetime, timedelta
from cnnDatabase import db
from models.booking_room import Booking



# Hàm để xóa các bản ghi đã bị đánh dấu là xóa và quá thời gian lưu trữ
def delete_expired_bookings():
    try:
        # Khoảng thời gian kể từ khi bị xóa mà bản ghi sẽ bị xóa hoàn toàn (ví dụ: 30 ngày)
        expiration_time = datetime.now() - timedelta(days=1)

        # Lấy các bản ghi cần xóa, xử lý từng phần
        expired_bookings = Booking.query.filter(
            Booking.isDeleted == True,
            Booking.date_deleted <= expiration_time
        ).yield_per(100)  # Xử lý từng 100 bản ghi một

        count = 0
        for booking in expired_bookings:
            db.session.delete(booking)
            count += 1

        # Lưu thay đổi vào database
        db.session.commit()

        print(f"{len(expired_bookings)} expired bookings deleted successfully.")
    except Exception as e:
        db.session.rollback()
        print(f"Error occurred while deleting expired bookings: {e}")