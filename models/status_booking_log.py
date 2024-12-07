from cnnDatabase import db
from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import relationship
from enum import Enum

class BookingStatus(Enum):
    APPROVE = "Approve"
    DENIED = "Denied"
    PENDING = "Pending"


class StatusBooking(db.Model):
    __tablename__ = 'status_booking_log'

    log_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    booking_id = db.Column(db.Integer, ForeignKey("booking.booking_id", ondelete="CASCADE"), nullable=False, index=True)
    status = db.Column(db.Enum(BookingStatus), nullable=False,  default="Pending")
    changed_by = db.Column(db.String(50), nullable=False, default="System")
    changed_at = db.Column(db.DateTime, default=func.now())  # Ngày giờ thay đổi

    # Quan hệ với bảng `Booking`
    booking = relationship("Booking", back_populates="status_logs")

    def __init__(self, booking_id, status, changed_by=None):
        """
        Constructor cho model StatusBooking
        :param booking_id: ID của booking
        :param status: Trạng thái (e.g., "Approve", "Denied")
        :param changed_by: Người thay đổi trạng thái (có thể là None)
        """
        self.booking_id = booking_id
        self.status = status
        self.changed_by = changed_by

    def __repr__(self):
        return (f"<StatusBooking(log_id={self.log_id}, booking_id={self.booking_id}, "
                f"status='{self.status}', changed_by='{self.changed_by}', changed_at={self.changed_at})>")
