# log_in.py

from cnnDatabase import fetch_query

def authenticate_user(username, password):
    """
    Hàm xác thực người dùng dựa trên username và password.
    :param username: Tên người dùng
    :param password: Mật khẩu của người dùng
    :return: Thông báo xác thực thành công hoặc lỗi
    """
    # Truy vấn kiểm tra username và password trong bảng user_table
    query = """
    SELECT * FROM user_table
    WHERE username = %s AND password = %s;
    """
    params = (username, password)
    result = fetch_query(query, params)

    if result:
        return f"Đăng nhập thành công! Chào mừng {username}."
    else:
        return "Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại."
