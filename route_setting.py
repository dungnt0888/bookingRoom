from flask import Blueprint, render_template, jsonify, request

setting_bp = Blueprint('setting', __name__)

@setting_bp.route('/')
def setting():
    return render_template(
        'setting.html',
        title='Trang quản lý'
    )