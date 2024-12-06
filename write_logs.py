from models.logs import Log
from flask import current_app  # Để ghi lỗi vào log của Flask (nếu cần)
from cnnDatabase import db

def log_operation(table_name, operation_type, user_name=None, record_id=None, old_data=None, new_data=None, additional_info=None):
    """
    Hàm ghi log các thao tác C, U, D.
    """
    if operation_type in ['CREATE', 'UPDATE', 'DELETE']:
        try:
            log_entry = Log(
                table_name=table_name,
                operation_type=operation_type,
                user_name=user_name,
                record_id=record_id,
                old_data=old_data,
                new_data=new_data,
                additional_info=additional_info
            )
            db.session.add(log_entry)
            db.session.commit()
        except Exception as e:
            # Rollback nếu gặp lỗi
            db.session.rollback()
            # Ghi log lỗi ra console hoặc file log của Flask
            current_app.logger.error(f"Error logging operation: {e}")
