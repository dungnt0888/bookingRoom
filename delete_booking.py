from models.booking_room import Booking
from cnnDatabase import db
from flask import Blueprint, request, jsonify
from write_logs import log_operation
from datetime import datetime, timezone, timedelta

# Tạo blueprint để quản lý route cho việc xóa booking
booking_delete_bp = Blueprint('delete_booking', __name__)

@booking_delete_bp.route('/delete_booking', methods=['POST'])
def delete_booking():
    """API thực hiện soft delete một booking."""
    booking_id = None
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

        # Lưu dữ liệu trước khi xóa (old_data)
        old_data = {
            "booking_id": booking.booking_id,
            "booking_name": booking.booking_name,
            "department": booking.department,
            "chairman": booking.chairman,
            "start_time": booking.start_time,
            "end_time": booking.end_time,
            "reservation_date": booking.reservation_date,
            "room_name": booking.room_name,
            "username": booking.username
        }

        # Cập nhật isDeleted thành True (soft delete)
        booking.isDeleted = True
        if booking.isDeleted:
            gmt_plus_7 = timezone(timedelta(hours=7))  # Tạo múi giờ GMT+7
            booking.date_deleted = datetime.now(gmt_plus_7)  # Cập nhật ngày xóa nếu isDeleted = True
        else:
            booking.date_deleted = None  # Xóa giá trị date_deleted nếu isDeleted = False

        db.session.commit()

        # Ghi log cho thao tác DELETE
        log_operation(
            table_name="booking",
            operation_type="DELETE",
            user_name=booking.username,
            record_id=booking_id,
            old_data=old_data,
            additional_info="Booking soft deleted successfully"
        )

        return jsonify({"success": True, "message": f"Booking ID {booking_id} has been soft deleted."})
    except Exception as e:
        log_operation(
            table_name="booking",
            operation_type="ERROR",
            user_name=None,
            record_id=booking_id,
            additional_info=f"Failed to soft delete booking: {e}"
        )
        return jsonify({"success": False, "error": str(e)}), 500
