from models.holiday import Holiday
from cnnDatabase import db
from calculate_holidays import calculated_holidays

def get_holiday_list():
    try:
        holidays = Holiday.query.all()  # Lấy tất cả ngày lễ từ cơ sở dữ liệu

        if not holidays:
            return []  # Trả về danh sách trống nếu không có ngày lễ

        # Chuyển đổi danh sách ngày lễ thành JSON
        holiday_data = [
            {
                'id': h.h_id,
                'title': h.h_name,
                'start': h.h_date.strftime('%Y-%m-%d'),
                'description': h.h_description,
                'allDay': True  # Ngày lễ là cả ngày
            }
            for h in holidays
        ]

        return holiday_data

    except Exception as e:
        #app.logger.error(f"Lỗi khi lấy danh sách ngày nghỉ lễ: {str(e)}")
        raise  # Ném lại lỗi để hàm gọi có thể xử lý tiếp