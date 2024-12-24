from cnnDatabase import db
from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy.schema import ForeignKey

class Booking(db.Model):
    __tablename__ = 'booking'

    booking_id = db.Column(db.Integer, primary_key=True)
    booking_name = db.Column(db.String(100),
        db.ForeignKey('booking_name.booking_name', ondelete='CASCADE'),
        nullable=False
    )
    department = db.Column(
        db.String(100),
        db.ForeignKey('department.name', onupdate='CASCADE'),
        nullable=True
    )
    meeting_content = db.Column(db.Text, nullable=True)
    chairman = db.Column(db.String(100), nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    reservation_date = db.Column(db.Date, nullable=False)
    date_booking = db.Column(db.Date, default=datetime.now)
    room_name = db.Column(db.String(100), nullable=False)
    isDeleted = db.Column(db.Boolean, default=False)
    date_deleted = db.Column(db.DateTime, nullable=True)

    username = db.Column(
        db.String(50),
        db.ForeignKey('user_table.username', ondelete='CASCADE'),
        nullable=False
    )

    status_logs = relationship(
        "StatusBooking",
        back_populates="booking",
        cascade="all, delete-orphan"
    )

    user = relationship('User', back_populates='bookings')
    booking_name_rel = relationship('Booking_name', back_populates='bookings')


    def __init__(self, booking_name, department, meeting_content, chairman, start_time, end_time, reservation_date, room_name, username, isDeleted=False):
        self.booking_name = booking_name
        self.department = department
        self.meeting_content = meeting_content
        self.chairman = chairman
        self.start_time = start_time
        self.end_time = end_time
        self.reservation_date = reservation_date
        self.room_name = room_name
        self.username = username
        self.isDeleted = isDeleted

    def mark_deleted(self):
        self.isDeleted = True
        self.date_deleted = datetime.now()

    def __repr__(self):
        return f"<Booking {self.booking_name} - {self.room_name}>"
