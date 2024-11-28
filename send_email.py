from flask_mail import Mail, Message
from flask import current_app
import threading

class EmailHandler:
    def __init__(self, app=None):
        """
        Khởi tạo EmailHandler với app Flask.
        Nếu app không được cung cấp, sử dụng current_app.
        """
        self.mail = None
        if app:
            self.init_app(app)

    def init_app(self, app):
        """
        Cấu hình Flask-Mail với ứng dụng Flask.
        """
        app.config['MAIL_SERVER'] = 'smtp.gmail.com'
        app.config['MAIL_PORT'] = 587
        app.config['MAIL_USE_TLS'] = True
        app.config['MAIL_USERNAME'] = 'dungnt.0888@gmail.com'
        app.config['MAIL_PASSWORD'] = 'skdb fukz ujec jvcn'
        app.config['MAIL_DEFAULT_SENDER'] = 'dungnt.0888@gmail.com'
        self.mail = Mail(app)

    def send_async_email(self, app, msg):
        """
        Hàm gửi email không đồng bộ.
        """
        with app.app_context():
            try:
                self.mail.send(msg)
                print("Email đã được gửi!")
            except Exception as e:
                print(f"Lỗi khi gửi email: {e}")

    def send_email(self, subject, recipients, body, sender=None):
        """
        Gửi email không đồng bộ.
        """
        try:
            if not self.mail:
                # Sử dụng current_app nếu self.mail chưa được khởi tạo
                self.init_app(current_app._get_current_object())
            msg = Message(
                subject=subject,
                recipients=recipients,
                body=body,
                sender=sender
            )
            app = current_app._get_current_object()
            thread = threading.Thread(target=self.send_async_email, args=(app, msg))
            thread.start()
            return "Email đang được gửi!"
        except Exception as e:
            print(f"Lỗi khi khởi tạo email: {e}")
            raise
