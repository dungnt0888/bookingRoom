from flask import Blueprint, request, jsonify, render_template

from calculate_holidays import calculated_holidays
from models.holiday import Holiday
from cnnDatabase import db
from datetime import datetime, timedelta
from sqlalchemy import extract
from get_holiday import get_holiday_list


holiday_bp = Blueprint('holiday', __name__)

@holiday_bp.route('/holiday',  methods=['GET', 'POST'] )
def holiday_manage():
    insert_holidays_for_current_year()
    return render_template('holiday.html')

@holiday_bp.route('/holiday/list', methods=['GET'])
def holiday_list():
    try:


        # Chuyển đổi danh sách ngày lễ thành JSON
        holiday_data = get_holiday_list()
        # Nếu danh sách trống, trả về thông báo phù hợp
        if not holiday_data:
            return jsonify({'message': 'Không có ngày nghỉ lễ nào!'}), 200

        # Trả về dữ liệu JSON
        return jsonify(holiday_data), 200

    except Exception as e:
        # Ghi log lỗi (nếu có)
        #app.logger.error(f"Lỗi khi lấy danh sách ngày nghỉ lễ: {str(e)}")
        return jsonify({'error': 'Có lỗi xảy ra khi lấy danh sách ngày nghỉ lễ. ' + str(e) }), 500


@holiday_bp.route('/holiday/add', methods=['POST'])
def holiday_add():
    data = request.get_json()
    if not data.get('name') or not data.get('date') or not data.get('description'):
        return jsonify({'error': 'Dữ liệu không hợp lệ'}), 400
    try:
        # Kiểm tra xem ngày đã tồn tại chưa
        existing_holiday = Holiday.query.filter_by(h_date=datetime.strptime(data['date'], '%Y-%m-%d').date()).first()
        if existing_holiday:
            return jsonify({'error': 'Ngày nghỉ lễ đã tồn tại'}), 400

        new_holiday = Holiday(
            h_name=data['name'],
            h_date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            h_description=data['description']
        )
        db.session.add(new_holiday)
        db.session.commit()
        return jsonify({'message': 'Ngày nghỉ lễ đã được thêm thành công!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@holiday_bp.route('/holiday/update', methods=['POST'])
def holiday_update():
    data = request.get_json()
    try:
        holiday = Holiday.query.filter_by(h_date=datetime.strptime(data['date'], '%Y-%m-%d').date()).first()
        if not holiday:
            return jsonify({'error': 'Ngày nghỉ lễ không tồn tại'}), 404

        holiday.h_name = data['name']
        holiday.h_description = data['description']
        db.session.commit()
        return jsonify({'message': 'Ngày nghỉ lễ đã được cập nhật thành công!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@holiday_bp.route('/holiday/delete', methods=['POST'])
def holiday_delete():
    data = request.get_json()
    try:
        holiday = Holiday.query.filter_by(h_date=datetime.strptime(data['date'], '%Y-%m-%d').date()).first()
        if not holiday:
            return jsonify({'error': 'Ngày nghỉ lễ không tồn tại'}), 404

        db.session.delete(holiday)
        db.session.commit()
        return jsonify({'message': 'Ngày nghỉ lễ đã được xóa thành công!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


def insert_holidays_for_current_year():
    current_year = datetime.now().year

    # Lấy tất cả ngày lễ trong năm hiện tại
    existing_holidays = Holiday.query.filter(
        extract('year', Holiday.h_date) == current_year
    ).all()
    existing_dates = {holiday.h_date for holiday in existing_holidays}

    # Lấy danh sách ngày lễ mới (Dương lịch + Âm lịch)
    new_holidays = calculated_holidays(current_year)

    # Thêm ngày lễ mới chưa tồn tại
    holidays_to_add = []
    for holiday in new_holidays:
        holiday_date = holiday["date"]  # Ngày Dương lịch dạng datetime.date
        if holiday_date not in existing_dates:
            new_holiday = Holiday(
                h_name=holiday["title"],
                h_date=holiday_date,
                h_description=holiday.get("description", "Không có mô tả")  # Mô tả mặc định
            )
            holidays_to_add.append(new_holiday)

    if holidays_to_add:
        db.session.bulk_save_objects(holidays_to_add)  # Thêm tất cả ngày lễ mới vào DB
        db.session.commit()
