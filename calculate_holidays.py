from datetime import datetime
from lunarcalendar import Converter, Lunar

def get_tet_nguyen_dan(current_year):
    """
    Lấy ngày Tết Nguyên Đán của năm hiện tại, kiểm tra linh hoạt ngày hợp lệ.
    """
    for day in (30, 29):  # Thử lần lượt ngày 30, sau đó ngày 29
        solar_date = safe_lunar_to_solar(current_year - 1, 12, day)
        if solar_date:  # Nếu ngày hợp lệ, trả về ngay
            return solar_date

    # Nếu không thể tính toán, báo lỗi
    raise ValueError("Không thể xác định ngày Tết Nguyên Đán.")



def convert_to_datetime(solar_date):
    """
    Chuyển đổi đối tượng Solar sang datetime hoặc date.
    """
    if solar_date is None:
        raise ValueError("Ngày Solar không hợp lệ (None).")
    if not hasattr(solar_date, 'year') or not hasattr(solar_date, 'month') or not hasattr(solar_date, 'day'):
        raise TypeError("Đối tượng Solar không có các thuộc tính cần thiết (year, month, day).")

    # Trả về kiểu datetime
    return datetime(solar_date.year, solar_date.month, solar_date.day)

def calculated_holidays(current_year):
    """
    Tính toán các ngày lễ Dương lịch và Âm lịch.
    Trả về danh sách các ngày lễ với định dạng:
    {"title": ..., "date": datetime.date, "description": ...}
    """
    holidays = []

    # Ngày lễ Dương lịch
    holidays += [
        {"title": "Tết Dương Lịch", "date": datetime(current_year, 1, 1).date()},
        {"title": "Giải phóng miền Nam", "date": datetime(current_year, 4, 30).date()},
        {"title": "Quốc tế Lao động", "date": datetime(current_year, 5, 1).date()},
        {"title": "Quốc khánh", "date": datetime(current_year, 9, 2).date()},
    ]

    try:
        # Ngày lễ Âm lịch
        lunar_holidays = [
            {"title": "Tết Nguyên Đán", "lunar_date": [(current_year, 1, 1), (current_year, 1, 2), (current_year, 1, 3)]},
            {"title": "Giỗ Tổ Hùng Vương", "lunar_date": [(current_year, 3, 10)]},
            {"title": "Tết Đoan Ngọ", "lunar_date": [(current_year, 5, 5)]},
            {"title": "Tết Trung Thu", "lunar_date": [(current_year, 8, 15)]},
        ]

        for holiday in lunar_holidays:
            for lunar_date in holiday["lunar_date"]:
                solar_date = safe_lunar_to_solar(*lunar_date)
                if solar_date:
                    holidays.append({
                        "title": holiday["title"],
                        "date": solar_date.date(),  # Chuyển Solar thành date
                        "description": "Ngày lễ theo lịch Âm"
                    })

        # Ngày Giao Thừa
        tet_eve = get_tet_nguyen_dan(current_year)
        holidays.append({
            "title": "Giao Thừa",
            "date": tet_eve.date(),
            "description": "Đêm trước Tết Nguyên Đán"
        })

    except Exception as e:
        print(f"Lỗi khi tính toán ngày lễ Âm lịch: {str(e)}")

    return holidays


def safe_lunar_to_solar(year, month, day):
    """
    Chuyển ngày Âm lịch sang Dương lịch, trả về datetime nếu hợp lệ, None nếu không hợp lệ.
    """
    try:
        lunar_date = Lunar(year, month, day)
        solar_date = Converter.Lunar2Solar(lunar_date)
        return datetime(solar_date.year, solar_date.month, solar_date.day)
    except ValueError:
        return None


