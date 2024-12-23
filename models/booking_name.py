from cnnDatabase import db
from sqlalchemy.orm import relationship

class Booking_name(db.Model):
    __tablename__ = 'booking_name'

    name_id = db.Column(db.Integer, primary_key=True)
    booking_name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(100), nullable=True)
    isActive = db.Column(db.Boolean, default=True)

    bookings = relationship('Booking', back_populates='booking_name_rel', cascade='all, delete-orphan')

    def __init__(self, booking_name, description, isActive=True):
        self.booking_name = booking_name
        self.description = description
        self.isActive = isActive

    def __repr__(self):
        return f"<Booking name {self.booking_name}>"