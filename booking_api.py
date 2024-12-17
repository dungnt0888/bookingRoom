from flask import Blueprint, request, jsonify
from models.booking_room import Booking
from cnnDatabase import db
from save_booking import save_booking
from send_email import EmailHandler
from models.booking_name import Booking_name
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import logging
from sqlalchemy import and_, or_

from flask import current_app

from write_logs import log_operation

email_handler = EmailHandler()



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

        # Lấy thông tin người nhận email
        user_email = 'trungtld@bcons.com.vn'  # Email người đặt phòng
        if not user_email:
            raise ValueError("Email không được cung cấp.")

        # Nội dung email
        subject = "Xác nhận đặt phòng thành công"
        recipients = [user_email]
        body = f"""
                Xin chào {data.get('username')},

                Phòng họp của bạn đã được đặt thành công!

                Thông tin chi tiết:
                - Mã đặt phòng: {booking_id}
                - Tên phòng: {data.get('room_name')}
                - Người chủ trì: {data.get('chairman')}
                - Nội dung cuộc họp: {data.get('meeting_content')}
                - Thời gian: {data.get('start_time')} - {data.get('end_time')}
                - Ngày: {data.get('reservation_date')}
                - Bộ phận: {data.get('department')}

                Trân trọng,
                Hệ thống đặt phòng.
                """
        # Ghi log cho thao tác CREATE
        log_operation(
            table_name="booking",
            operation_type="CREATE",
            user_name=data.get('username'),
            record_id=booking_id,
            new_data=data,
            additional_info="Booking created successfully"
        )
        # Gửi email
        #email_handler.send_email(subject, recipients, body)
        print("Email đã được gửi thành công!")
        #print("Received booking data:", data)
        #print("Username received:", data.get('username'))
        return jsonify({"message": "Booking saved successfully!", "booking_id": booking_id}), 201
    except Exception as e:
        log_operation(
            table_name="booking",
            operation_type="ERROR",
            user_name=data.get('username'),
            new_data=data,
            additional_info=f"Failed to save booking: {e}"
        )
        return jsonify({"message": f"Failed to save booking: {e}"}), 500

@booking_bp.route('/get_booking/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    """
    API để lấy thông tin một booking dựa trên booking_id.
    """
    booking = Booking.query.filter_by(booking_id=booking_id, isDeleted=False).first()

    if booking:
        # Kiểm tra thông tin booking
        logging.debug(f"Booking Data: {booking.__dict__}")

        start_time_str = booking.start_time.strftime('%H:%M') if booking.start_time else None
        end_time_str = booking.end_time.strftime('%H:%M') if booking.end_time else None
        date_booking_str = booking.date_booking.strftime("%Y-%m-%d") if booking.date_booking else None
        reservation_date_str = booking.reservation_date.strftime("%d/%m/%Y") if booking.reservation_date else None

        return jsonify({
            "booking_id": booking.booking_id,
            "booking_name": booking.booking_name,
            "department": booking.department,
            "meeting_content": booking.meeting_content,
            "chairman": booking.chairman,
            "start_time": start_time_str,
            "end_time": end_time_str,
            "reservation_date": reservation_date_str,
            "room_name": booking.room_name,
            "date_booking": date_booking_str,
            "username": booking.username,
        })
    else:
        return jsonify({"message": "Booking not found or deleted."}), 404


@booking_bp.route('/edit_booking/<int:booking_id>', methods=['PUT'])
def edit_booking(booking_id):
    """
        API để chỉnh sửa thông tin đặt phòng dựa trên booking_id.
        """
    # Lấy dữ liệu JSON từ request
    data = request.get_json()
    try:
        booking = Booking.query.filter_by(booking_id=booking_id, isDeleted=False).first()
        if not booking:
            return jsonify({"message": "Booking not found"}), 404

        # Chuyển đổi dữ liệu ngày và giờ thành object
        reservation_date_obj = datetime.strptime(data.get('reservation_date'), '%d/%m/%Y').date()
        start_time_obj = datetime.strptime(data.get('start_time'), '%H:%M').time()
        end_time_obj = datetime.strptime(data.get('end_time'), '%H:%M').time()

        existing_booking = Booking.query.filter_by(
            room_name=data.get('room_name'),
            reservation_date=reservation_date_obj
        ).filter(
            and_(
                or_(
                    (Booking.start_time <= start_time_obj) & (Booking.end_time > start_time_obj),
                    (Booking.start_time < end_time_obj) & (Booking.end_time >= end_time_obj)
                ),
                Booking.booking_id != booking_id,  # Loại trừ chính booking hiện tại
                Booking.isDeleted != True
            )
        ).first()

        if existing_booking:
            return jsonify({
                "message": "Không thể chỉnh sửa. Thời gian này đã có phòng được đặt."
            }), 400
            # Cập nhật thông tin booking

        booking.chairman = data.get('chairman', booking.chairman)
        booking.booking_name = data.get('booking_name', booking.booking_name)
        booking.department = data.get('department', booking.department)
        booking.meeting_content = data.get('meeting_content', booking.meeting_content)
        booking.start_time = data.get('start_time', booking.start_time)
        booking.end_time = data.get('end_time', booking.end_time)

        # Commit thay đổi
        db.session.commit()
        return jsonify({"message": "Booking updated successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to save booking: {e}"}), 500