from cnnDatabase import db

class Holiday(db.Model):
    __tablename__ = 'holiday'

    h_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    h_name = db.Column(db.String(200), nullable=False, unique=False)
    h_date = db.Column(db.Date, nullable=False)
    h_description = db.Column(db.String(200), nullable=True)

    def __init__(self, h_name, h_date, h_description):
        self.h_name = h_name
        self.h_date = h_date
        self.h_description = h_description

    def __repr__(self):
        return f"<Holiday(id={self.h_id}, name={self.h_name}, date={self.h_date})>"