from cnnDatabase import execute_query
from datetime import datetime

def save_booking(booking_name, department, meeting_content, chairman, start_time, end_time, reservation_date, room_name):
    """
    Hàm lưu thông tin đặt phòng vào cơ sở dữ liệu.
    """
    query = """
    INSERT INTO booking (booking_name, department, meeting_content, chairman, start_time, end_time, reservation_date, date_booking, room_name)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    date_booking = datetime.now().date()  # Lấy ngày hiện tại

    params = (booking_name, department, meeting_content, chairman, start_time, end_time, reservation_date, date_booking, room_name)

    try:
        execute_query(query, params)
        print("Booking saved successfully!")
    except Exception as e:
        print(f"Failed to save booking: {e}")