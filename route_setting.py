from flask import Blueprint, render_template, jsonify, request
from color_manage import get_room_colour, edit_color



setting_bp = Blueprint('setting', __name__)

@setting_bp.route('/')
def setting():
    colors = get_room_colour()

    return render_template(
        'setting.html',
        title='Trang quản lý',
        colors = colors
    )


@setting_bp.route('/update_color', methods=['POST'])
def update_color():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Lỗi không lấy được data"}), 400

        room = data.get("room")
        color = data.get("color")

        if not room or not color:
            return jsonify({"success": False, "error": "Thiếu thông tin phòng hoặc màu sắc"}), 400

        # Gọi hàm cập nhật
        result = edit_color(room, color)

        if result["success"]:
            return jsonify({"success": True}), 200
        else:
            return jsonify({"success": False, "error": result["error"]}), 404

    except Exception as e:
        # Ghi log lỗi và trả phản hồi lỗi
        print(f"Lỗi: {e}")
        return jsonify({"success": False, "error": "Đã xảy ra lỗi không mong muốn"}), 500


@setting_bp.route('/get_color', methods=['GET'])
def get_color():
    colors = get_room_colour()
    if len(colors) > 0:
        # Chuyển danh sách các đối tượng RoomColor thành JSON
        result = [
            {
                "c_id": color.c_id,
                "c_color": color.c_color,
                "c_room": color.c_room,
            }
            for color in colors
        ]
        return jsonify(result), 200
    else:
        return jsonify({"message": "Không tìm thấy record."}), 404
