from flask import Flask 
from application.database import db 
from application.models import User, Role 
from application.models import *
from application.resources import api
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from flask_security import hash_password
from werkzeug.security import generate_password_hash
from application.celery_init import celery_init_app


def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    return app

app = create_app()
celery = celery_init_app(app)

with app.app_context():
    db.create_all()
    
    app.security.datastore.find_or_create_role(name = "admin", description = "Super user of app")
    app.security.datastore.find_or_create_role(name = "user", description = "User of app")
    db.session.commit()
    
    if not app.security.datastore.find_user(email = "user0@admin.com"):
        app.security.datastore.create_user(email = "user0@admin.com", username = "admin01",password = generate_password_hash("12345"),roles = ['admin'])
        
    # if not app.security.datastore.find_user(email = "user0@user.com"):
    #     app.security.datastore.create_user(email = "user0@user.com", username = "user01", password = generate_password_hash("12345"), roles = ['user'])
    db.session.commit()  
    
    
from application.routes import *

if __name__ == "__main__":
    app.run()
     #bnm
    
