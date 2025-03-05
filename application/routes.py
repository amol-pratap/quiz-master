from .database import db 
from .models import User, Role
from flask import current_app as app, jsonify, request,render_template
from flask_security import hash_password, auth_required, roles_required, current_user
from flask_security import auth_required, roles_required, current_user, login_user
from werkzeug.security import check_password_hash, generate_password_hash



@app.route('/', methods = ['GET'])
def index():
    return render_template('index.html')

@app.route('/admin')
@auth_required('token') #Authorizarion
@roles_required('admin') #RBAC/ Authorization
def admin_home():
    return 'Welcome to the admin dashboard'


@app.route('/user')
@auth_required('token')
@roles_required('user')
def user_home():
    user = current_user
    return jsonify({
    "username": user.username,
    "email": user.email,
    "password": user.password
})
    #
    

@app.route('/api/login', methods=['POST'])
def user_login():
    body = request.get_json()
    email = body['email']
    password = body['password']

    if not email:
        return jsonify({
            "message": "Email is required!"
        }), 400
    
    user = app.security.datastore.find_user(email = email)

    if user:
        if check_password_hash(user.password, password):
            
            # if current_user is not None:
            #     return jsonify({
            #     "message": "Already logged in!"
            # }), 400
            login_user(user)
            print(current_user)
            return jsonify({
                "id": user.id,
                "username": user.username,
                "auth-token": user.get_auth_token()
            })
        else:
            return jsonify({
                "message": "Incorrect Password"
            }), 400
    else:
       return jsonify({
            "message": "User Not Found!"
        }), 404 