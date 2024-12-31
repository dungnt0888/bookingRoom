from cnnDatabase import db
from datetime import datetime


class Message(db.Model):
    """
    Model to represent a chat message.
    """
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(200), nullable=False)
    sender_role = db.Column(db.String(50), nullable=True, default='Guest')
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)

    def __init__(self, sender, content, sender_role = None):
        self.sender = sender
        self.content = content
        self.sender_role = sender_role or 'Guest'

    def __repr__(self):
        return f"<Message id={self.id} sender={self.sender} timestamp={self.timestamp}>"