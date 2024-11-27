from cnnDatabase import db
from models.user import User


def seed_default_user():
    """Thêm user mặc định vào database."""
    if not User.query.filter_by(username='admin').first():
        default_user = User(
            username='admin',
            firstname='Administrator',
            lastname='',
            email='admin@admin.default',
            password='admin1234',  # Hash mật khẩu
            role='Administrator',
            user_status='Active'
        )
        db.session.add(default_user)
        db.session.commit()
        print("Default admin user created.")

if __name__ == "__main__":
    from app import app
    with app.app_context():
        seed_default_user()
