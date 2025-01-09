from cnnDatabase import db


class Holiday(db.Model):
    __tablename__ = 'holiday'

    holiday_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    holiday_name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.String(200), nullable=True)

    def __init__(self, holiday_name, description):
        self.holiday_name = holiday_name
        self.description = description

    def __repr__(self):
        return f"<Holiday(id={self.holiday_id}, name={self.holiday_name})>"