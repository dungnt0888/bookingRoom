from cnnDatabase import db

class RoomColor(db.Model):
    __tablename__ = 'room_color'
    c_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    c_color = db.Column(db.String(50), nullable=False, unique=False)
    c_room = db.Column(db.String(100), nullable=False)

    def __init__(self, c_color, c_room):
        self.c_color = c_color
        self.c_room = c_room

    def __repr__(self):
        return f"<Color_ID(id={self.c_id}, color={self.c_color}, room={self.c_room})>"