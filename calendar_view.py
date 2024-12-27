from flask import Blueprint, render_template, jsonify, request
from models.department import Department
from models.booking_name import Booking_name
calendar_bp = Blueprint('calendar', __name__)

@calendar_bp.route('/calendar')
def calendar():
    meetings = Booking_name.query.filter_by(isActive=True).all()
    departments = Department.query.all()
    return render_template(
        'calendar.html',
        meetings=meetings,
        departments=departments
    )