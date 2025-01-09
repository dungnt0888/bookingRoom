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

def safe_lunar_to_solar(year, month, day):
    """
    Chuyển đổi ngày Âm lịch sang Dương lịch một cách an toàn.
    Kiểm tra ngày Âm lịch có hợp lệ trước khi chuyển đổi.
    """
    try:
        # Tạo đối tượng Lunar và chuyển sang Solar
        lunar_date = Lunar(year, month, day)
        solar_date = Converter.Lunar2Solar(lunar_date)
        return solar_date
    except ValueError:
        # Trả về None nếu ngày không hợp lệ
        return None

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

def calculated_holidays():
    """
    Tính toán danh sách các ngày nghỉ lễ theo lịch Dương và lịch Âm trong năm hiện tại.
    """
    current_year = datetime.now().year
    holidays = []

    # Các ngày nghỉ lễ theo lịch Dương
    holidays += [
        {"title": "Tết Dương Lịch", "date": f"{current_year}-01-01"},
        {"title": "Giải phóng miền Nam", "date": f"{current_year}-04-30"},
        {"title": "Quốc tế Lao động", "date": f"{current_year}-05-01"},
        {"title": "Quốc khánh", "date": f"{current_year}-09-02"},
    ]

    try:
        # Các ngày nghỉ lễ theo lịch Âm
        lunar_holidays = [
            {"title": "Tết Nguyên Đán", "lunar_date": [(current_year, 1, 1), (current_year, 1, 2), (current_year, 1, 3)]},
            {"title": "Giỗ Tổ Hùng Vương", "lunar_date": [(current_year, 3, 10)]},
            {"title": "Tết Đoan Ngọ", "lunar_date": [(current_year, 5, 5)]},
            {"title": "Tết Trung Thu", "lunar_date": [(current_year, 8, 15)]},
        ]

        for holiday in lunar_holidays:
            for lunar_date in holiday["lunar_date"]:
                solar_date = safe_lunar_to_solar(*lunar_date)
                if solar_date:  # Chỉ thêm nếu ngày hợp lệ
                    solar_datetime = convert_to_datetime(solar_date)
                    holidays.append({"title": holiday["title"], "date": solar_datetime.strftime("%Y-%m-%d")})

        # Tính ngày Giao Thừa
        tet_eve = get_tet_nguyen_dan(current_year)
        tet_eve_datetime = convert_to_datetime(tet_eve)
        holidays.append({"title": "Giao Thừa", "date": tet_eve_datetime.strftime("%Y-%m-%d")})

    except Exception as e:
        print("Lỗi tổng quát khi tính toán ngày nghỉ lễ:", e)

    # Chuyển đổi danh sách các ngày nghỉ lễ thành JSON
    holidays_json = [
        {"title": holiday["title"], "start": holiday["date"], "allDay": True}
        for holiday in holidays
    ]

    return holidays_json