#booking api
from flask import Blueprint, request, jsonify
from models.booking_room import Booking
from models.booking_name import Booking_name
from models.department import Department
from cnnDatabase import db
from save_booking import save_booking
from send_email import EmailHandler
from models.booking_name import Booking_name
from models.user import User
from datetime import datetime, timedelta
import pytz
from zoneinfo import ZoneInfo
import logging
from sqlalchemy import and_, or_
from calculate_holidays import calculated_holidays
from get_holiday import get_holiday_list


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
        if not data.get('booking_name') or not data.get('start_time') or not data.get('end_time') or not data.get(
                'reservation_date'):
            return jsonify({'success': False, 'error': 'Required fields are missing'}), 400

        # Lưu booking và lấy booking_id
        result  = save_booking(
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

        # Kiểm tra nếu phòng đã được đặt
        if not result ["success"]:
            return jsonify({"success": False, "message": result ["message"]}), 409
        # Trả về booking_id sau khi lưu
        booking_id = result["booking_id"]
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
        #print("Email đã được gửi thành công!")
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
            "role": booking.user.role,
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

        # Lấy múi giờ GMT+7
        gmt7 = pytz.timezone('Asia/Bangkok')

        # Kiểm tra và chuyển đổi dữ liệu ngày, giờ
        # Kiểm tra và xử lý dữ liệu ngày, giờ
        reservation_date = data.get('reservation_date')
        if reservation_date is None and booking.reservation_date:
            reservation_date = booking.reservation_date.strftime('%d/%m/%Y')

        start_time = data.get('start_time')
        if start_time is None and booking.start_time:
            start_time = booking.start_time.strftime('%H:%M')

        end_time = data.get('end_time')
        if end_time is None and booking.end_time:
            end_time = booking.end_time.strftime('%H:%M')

        if reservation_date is None or start_time is None or end_time is None:
            return jsonify({"message": "Dữ liệu không đầy đủ. Vui lòng kiểm tra ngày, giờ."}), 400

        reservation_date_obj = datetime.strptime(reservation_date, '%d/%m/%Y').date()
        start_time_obj = datetime.strptime(start_time, '%H:%M').time()
        end_time_obj = datetime.strptime(end_time, '%H:%M').time()

        # Kết hợp ngày và giờ để kiểm tra thời gian đã qua
        combined_start_datetime = gmt7.localize(datetime.combine(reservation_date_obj, start_time_obj))
        current_datetime = datetime.now(gmt7)

        if combined_start_datetime < current_datetime:
            return jsonify({"message": "Không thể chỉnh sửa vào khoảng thời gian đã qua."}), 400

        # Kiểm tra xung đột phòng
        existing_booking = Booking.query.filter(
            Booking.room_name == data.get('room_name', booking.room_name),
            Booking.reservation_date == reservation_date_obj,
            Booking.isDeleted != True,  # Bỏ qua các bản ghi đã xóa
            Booking.booking_id != booking_id  # Bỏ qua bản ghi hiện tại (nếu đang cập nhật)
        ).filter(
            or_(
                (Booking.start_time <= start_time_obj) & (Booking.end_time > start_time_obj),
                # Thời gian bắt đầu chồng lấn
                (Booking.start_time < end_time_obj) & (Booking.end_time >= end_time_obj)  # Thời gian kết thúc chồng lấn
            )
        ).first()

        if existing_booking:
            return jsonify({
                "message": "Không thể chỉnh sửa. Thời gian này đã có phòng được đặt."
            }), 400

        # Lưu dữ liệu cũ
        old_data = {
            "booking_id": booking_id,
            "booking_name": booking.booking_name,
            "department": booking.department,
            "chairman": booking.chairman,
            "start_time": booking.start_time.strftime('%H:%M'),
            "end_time": booking.end_time.strftime('%H:%M'),
            "reservation_date": booking.reservation_date.strftime('%d/%m/%Y'),
            "meeting_content": booking.meeting_content,
            "room_name": booking.room_name,
            "username": booking.username,
            "role": booking.user.role
        }
        #print(old_data)
        # Cập nhật thông tin booking
        booking.chairman = data.get('chairman', booking.chairman)
        booking.booking_name = data.get('booking_name', booking.booking_name)
        booking.room_name = data.get('room_name') or booking.room_name
        booking.department = data.get('department', booking.department)
        booking.meeting_content = data.get('meeting_content', booking.meeting_content)
        booking.start_time = start_time_obj
        booking.end_time = end_time_obj
        booking.reservation_date = reservation_date_obj

        # Lưu dữ liệu mới
        new_data = {
            "booking_id": booking.booking_id,
            "booking_name": booking.booking_name,
            "department": booking.department,
            "chairman": booking.chairman,
            "start_time": booking.start_time.strftime('%H:%M'),
            "end_time": booking.end_time.strftime('%H:%M'),
            "reservation_date": booking.reservation_date.strftime('%d/%m/%Y'),
            "meeting_content": booking.meeting_content,
            "room_name": booking.room_name,
            "username": booking.username,
            "role": booking.user.role,
        }
        #print(new_data)
        # Ghi log
        log_operation(
            table_name="booking",
            operation_type="EDIT",
            user_name=data.get('username'),
            record_id=booking_id,
            old_data=old_data,
            new_data=new_data,
            additional_info="Booking edited successfully"
        )

        # Commit thay đổi
        db.session.commit()
        return jsonify({"message": "Booking updated successfully"}), 200

    except Exception as e:
        log_operation(
            table_name="booking",
            operation_type="EDIT",
            user_name=data.get('username'),
            record_id=booking_id,
            additional_info=f"Booking edit failed: {str(e)}"
        )
        print(e)
        return jsonify({"message": f"Failed to save booking: {e}"}), 500



@booking_bp.route('/get_bookings', methods=['GET'])
def get_bookings():
    """Lấy tất cả các booking chưa bị xóa từ cơ sở dữ liệu và trả về dưới dạng JSON."""
    try:
        # Lọc các booking chưa bị xóa
        bookings = Booking.query.filter_by(isDeleted=False).join(User, Booking.username == User.username).all()
        bookings_data = []

        for booking in bookings:
            bookings_data.append({
                "booking_id": booking.booking_id,
                "booking_name": booking.booking_name,
                "department": booking.department,
                "meeting_content": booking.meeting_content,
                "chairman": booking.chairman,
                "start_time": booking.start_time.strftime('%H:%M') if booking.start_time else None,
                "end_time": booking.end_time.strftime('%H:%M') if booking.end_time else None,
                "reservation_date": booking.reservation_date.strftime("%d/%m/%Y") if booking.reservation_date else None,
                "room_name": booking.room_name,
                "username": booking.username,
                "role": booking.user.role
            })

        # Thêm ngày nghỉ lễ
        holidays = get_holiday_list()

        all_events = bookings_data + holidays

        # Ghi log số lượng bookings và holidays
        print(f"Số lượng bookings: {len(bookings_data)}, Số lượng holidays: {len(holidays)}")
        #print(holidays)
        return jsonify(all_events)
    except Exception as e:
        # Trả về chi tiết lỗi nếu có lỗi xảy ra
        print("Lỗi khi lấy dữ liệu bookings:", e)
        return jsonify({"message": f"Failed to load bookings: {str(e)}"}), 500


@booking_bp.route('/get_departments', methods=['GET'])
def get_departments():
    try:
        departments = Department.query.all()
        department_data = []
        for department in departments:
            department_data.append({
                "department_id": department.id,
                "department_name": department.name
            })
        return jsonify({"departments": department_data}), 200
    except Exception as e:
        print("Lỗi khi lấy dữ liệu department:", e)
        return jsonify({"message": f"Failed to load department: {str(e)}"}), 500


@booking_bp.route('/get_meetings', methods=['GET'])
def get_meetings():
    try:
        meetings = Booking_name.query.all()
        meetings_data = []
        for meeting in meetings:
            meetings_data.append({
                "name_id": meeting.name_id,
                "booking_name": meeting.booking_name,
                "description": meeting.description
            })
        #print(meetings)
        #print(meetings_data)
        return jsonify({"meetings": meetings_data}), 200
    except Exception as e:
        print("Lỗi khi lấy dữ liệu meetings:", e)
        return jsonify({"message": f"Failed to load meetings: {str(e)}"}), 500


@booking_bp.route('/get_holidays', methods=['GET'])
def get_holidays():
    """
    API trả về danh sách các ngày nghỉ lễ.
    """
    try:
        holidays = get_holiday_list()
        return jsonify(holidays), 200
    except Exception as e:
        print("Lỗi khi tạo danh sách ngày nghỉ lễ:", e)
        return jsonify({"message": "Không thể tải danh sách ngày lễ."}), 500
