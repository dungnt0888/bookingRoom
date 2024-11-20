from flask import Blueprint, request, jsonify
from models.booking_room import Booking
from cnnDatabase import db
from save_booking import save_booking

# Tạo Blueprint cho các API liên quan đến booking
booking_bp = Blueprint('booking', __name__)

@booking_bp.route('/submit_booking', methods=['POST'])
def submit_booking():
    """
    API để lưu thông tin booking và trả về booking_id.
    """
    data = request.json  # Nhận dữ liệu JSON từ yêu cầu

    try:
        # Lưu booking và lấy booking_id
        booking_id = save_booking(
            booking_name=data.get('booking_name'),
            department=data.get('department'),
            meeting_content=data.get('meeting_content'),
            chairman=data.get('chairman'),
            start_time=data.get('start_time'),
            end_time=data.get('end_time'),
            reservation_date=data.get('reservation_date'),
            room_name=data.get('room_name'),
            username = data.get('username')
        )
        # Trả về booking_id sau khi lưu
        print("Received booking data:", data)
        print("Username received:", data.get('username'))
        return jsonify({"message": "Booking saved successfully!", "booking_id": booking_id}), 201
    except Exception as e:
        return jsonify({"message": f"Failed to save booking: {e}"}), 500

@booking_bp.route('/get_booking/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    """
    API để lấy thông tin một booking dựa trên booking_id.
    """
    booking = Booking.query.filter_by(booking_id=booking_id, isDeleted=False).first()
    if booking:
        return jsonify({
            "booking_id": booking.booking_id,
            "booking_name": booking.booking_name,
            "department": booking.department,
            "meeting_content": booking.meeting_content,
            "chairman": booking.chairman,
            "start_time": booking.start_time,
            "end_time": booking.end_time,
            "reservation_date": booking.reservation_date,
            "room_name": booking.room_name,
            "date_booking": booking.date_booking.strftime("%Y-%m-%d"),
            "username": booking.username,
        })
    else:
        return jsonify({"message": "Booking not found or deleted."}), 404
