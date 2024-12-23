from cnnDatabase import db
from sqlalchemy.orm import relationship


class Department(db.Model):
    __tablename__ = 'department'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, unique=True)


    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"<Department(id={self.id}, name={self.name})>"
