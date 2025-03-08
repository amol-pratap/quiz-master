from .database import db 
from .models import User, Role
from flask import current_app as app, jsonify, request,render_template
# from flask_security import hash_password, auth_required, roles_required, current_user
from flask_security import auth_required, roles_required, roles_accepted, current_user, login_user
from werkzeug.security import check_password_hash, generate_password_hash
from .utils import roles_list

from flask_security.utils import verify_password


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
    
    

@app.route('/api/login', methods=['POST'])
# @app.route('/login', methods=['POST'])
def user_login():
    # print("Headers:", request.headers)
    print("JSON Body:", request.get_json())
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
            print(user.password,  password ," Sucess login______________________________")
            print(user.get_auth_token())
            for role in user.roles:
                role_n = role.name
                print(role_n)
                
            # if current_user is not None:
            #     return jsonify({
            #     "message": "Already logged in!"
            # }), 400
            login_user(user)
            print(current_user, user.roles)
            return jsonify({
                "id": user.id,
                "username": user.username,
                "roles": roles_list(user.roles),
                # "role" : role_n,
                "auth-token": user.get_auth_token()
            })
        else:
            print("not ___Sucess login, password is incorrect______________________________")
            return jsonify({
                "message": "Incorrect Password"
            }), 400
    else:
       print("not Sucess login, user not found______________________________")
       return jsonify({
            "message": "User Not Found!"
        }), 404 


# from flask import jsonify, request
# from flask_login import login_user
# from flask_security.utils import verify_password
# from application.security import user_datastore  # make sure your user_datastore is correctly set up

# @app.route('/api/login', methods=['POST'])
# def user_login():
#     body = request.get_json()

#     email = body.get('email')
#     password = body.get('password')

#     if not email or not password:
#         return jsonify({"message": "Email and Password are required!"}), 400

#     user = user_datastore.find_user(email=email)

#     if user and verify_password(password, user.password):
#         login_user(user)
#         return jsonify({
#             "id": user.id,
#             "username": user.username,
#             "roles": [role.name for role in user.roles],
#             "message": "Login successful!"
#         }), 200

#     return jsonify({"message": "Invalid credentials"}), 401



@app.route('/api/register', methods=['POST'])
def create_user():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email = credentials["email"]):
        app.security.datastore.create_user(email = credentials["email"],
                                           username = credentials["username"],
                                           qulification = credentials["qulification"],
                                           password = generate_password_hash(credentials["password"]),
                                           roles = ['user'])
        db.session.commit()
        return jsonify({
            "message": "User created successfully"
        }), 201
    
    return jsonify({
        "message": "User already exists!"
    }), 400




@app.route('/api/user')
@auth_required('token')
@roles_required('user')
# @roles_accepted('user', 'admin')#and
# @roles_accepted(['user', 'admin']) #OR
def user_dashboard():
    user = current_user
    print("working-----",user)
    return jsonify({
        "username": user.username,
        "email": user.email,
        "roles": roles_list(user.roles)
    })