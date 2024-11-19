from models.booking_room import Booking
from cnnDatabase import db
from flask import Blueprint, request, jsonify

# Tạo blueprint để quản lý route cho việc xóa booking
booking_delete_bp = Blueprint('delete_booking', __name__)

@booking_delete_bp.route('/delete_booking', methods=['POST'])
def delete_booking():
    """API thực hiện soft delete một booking."""
    try:
        # Lấy dữ liệu từ yêu cầu
        data = request.json
        booking_id = data.get('booking_id')

        # Kiểm tra booking_id có tồn tại không
        if not booking_id:
            return jsonify({"success": False, "error": "Missing booking_id"}), 400

        # Tìm booking trong database
        booking = Booking.query.filter_by(booking_id=booking_id, isDeleted=False).first()
        if not booking:
            return jsonify({"success": False, "error": "Booking not found or already deleted"}), 404

        # Cập nhật isDeleted thành True (soft delete)
        booking.isDeleted = True
        db.session.commit()

        return jsonify({"success": True, "message": f"Booking ID {booking_id} has been soft deleted."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
