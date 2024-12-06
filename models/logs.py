from sqlalchemy import Index
from cnnDatabase import db
from datetime import datetime

import enum

class OperationType(enum.Enum):
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    ERROR = "ERROR"

class Log(db.Model):
    __tablename__ = 'logs'
    log_id = db.Column(db.Integer, primary_key=True)
    table_name = db.Column(db.String(255))
    operation_type = db.Column(db.Enum(OperationType))
    operation_time = db.Column(db.DateTime, default=datetime.utcnow)
    user_name = db.Column(db.String(50))  # ID người thực hiện (nếu có)
    record_id = db.Column(db.Integer)  # ID bản ghi được thao tác
    old_data = db.Column(db.JSON)  # Dữ liệu trước khi thao tác (nếu có)
    new_data = db.Column(db.JSON)  # Dữ liệu sau khi thao tác (nếu có)
    additional_info = db.Column(db.Text)  # Thông tin bổ sung

    __table_args__ = (
        Index('idx_logs_table_name', 'table_name'),
        Index('idx_logs_operation_type', 'operation_type'),
        Index('idx_logs_operation_time', 'operation_time'),
    )

    def __init__(self, table_name, operation_type, user_name=None, record_id=None, old_data=None, new_data=None,
                 additional_info=None):
        self.table_name = table_name
        self.operation_type = operation_type
        self.user_name = user_name
        self.record_id = record_id
        self.old_data = old_data
        self.new_data = new_data
        self.additional_info = additional_info

    def __repr__(self):
        return f"<Log(log_id={self.log_id}, table_name='{self.table_name}', operation_type='{self.operation_type}')>"