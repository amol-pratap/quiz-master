from .database import db 
from .models import *
from flask import current_app as app, jsonify, request,render_template
# from flask_security import hash_password, auth_required, roles_required, current_user
from flask_security import auth_required, roles_required, roles_accepted, current_user, login_user
from werkzeug.security import check_password_hash, generate_password_hash
from .utils import roles_list

from flask_security.utils import verify_password


@app.route('/', methods = ['GET'])
def index():
    return render_template('index.html')

@app.route('/api/admin')
@auth_required('token') #Authorizarion
@roles_required('admin') #RBAC/ Authorization
def admin_home():
    print("WOrking---------------------",)
    subjects_data = []  # List to store subject details
    subjects = Subject.query.all()
    
    for sub in subjects:
        subjects_data.append({
            'id': sub.id,
            'name': sub.name,
            'description': sub.description
        })
        
    chapters_data = []  # List to store subject details
    chapters = Chapter.query.all()  
    print("WOrking chapters---------------------",chapters)
    for chap in chapters:
       chapters_data.append({
            'id': chap.id,
            'name': chap.title
        })

    return jsonify({'chapters': chapters_data, 'subjects': subjects_data, })


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
    
    
#To login user and admin
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



#To Register New user
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



#To go on user dashboard
@app.route('/api/user')
@auth_required('token')
@roles_required('user')
# @roles_accepted('user', 'admin')#and
# @roles_accepted(['user', 'admin']) #OR
def user_dashboard():
    user = current_user
    return jsonify({
        "username": user.username,
        "email": user.email,
        "roles": roles_list(user.roles)
    })
    
    
    
#To create new subject
@app.route('/api/subject', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def create_subject():
    body = request.get_json()
    
    new_subject = Subject(name = body['name'],
                description = body['description'])
    db.session.add(new_subject)
    db.session.commit()

    return jsonify({
        "message": "Subject created Successfully!"
    }),201
    

#To Create new chapter
@app.route('/api/chapter', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def create_chapter():
    body = request.get_json()
    
    new_chapter = Chapter(title = body['name'],
                subject_id = body['subject_id'])
    db.session.add(new_chapter)
    db.session.commit()

    return jsonify({
        "message": "Chapter created Successfully!"
    }),201
    
#To get all chapters of all subjects
@app.route('/api/subjects', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_subjects_with_chapters():
    subjects = Subject.query.all()

    data = []
    for subject in subjects:
        chapters = Chapter.query.filter_by(subject_id=subject.id).all()

        data.append({
            'id': subject.id,
            'name': subject.name,
            'description': subject.description,
            'chapters': [
                {
                    'id': chapter.id,
                    'title': chapter.title,
                    'quiz_count': Quiz.query.filter_by(chapter_id=chapter.id).count()  # ✅ Quiz count logic
                } for chapter in chapters
            ]
        })

    return jsonify(data), 200




# To get all quiz of paricular chapter
@app.route('/api/quizzes', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_quizzes():
    chapter_id = request.args.get('chapter_id')
    chapter = Chapter.query.get(chapter_id)

    if not chapter:
        return jsonify({"error": "Chapter not found!"}), 404

    quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()

    quiz_data = [
        {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "questions": [
                {"id": q.id, "text": q.q_text}
                for q in quiz.questions
            ]
        }
        for quiz in quizzes
    ]

    return jsonify({
        "chapter_title": chapter.title,
        "quizzes": quiz_data
    }), 200





# Route to Add Quiz with Questions
@app.route('/api/quiz', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def add_quiz():
    data = request.get_json()

    chapter_id = data.get('chapter_id')
    subject_id = Chapter.query.filter_by(id = chapter_id).first().subject_id
    chapter = Chapter.query.get(chapter_id)

    if not chapter:
        return jsonify({"error": "Chapter not found!"}), 404

    # Create Quiz
    new_quiz = Quiz(
        title=data['title'],
        description=data['description'],
        chapter_id=chapter_id,
        subject_id=subject_id
    )

    db.session.add(new_quiz)


    # Add Questions
    for question_data in data['questions']:
        new_question = Question(
            q_text=question_data['text'],
            quiz_id=new_quiz.id,
            correct_option_id=question_data['correct_answer']
            )
        db.session.add(new_question)
        db.session.flush()
         
        # Add options
        options = []
        for opt in question_data["options"]:
            option = Option(question_id=new_question.id, opt_text=opt)
            db.session.add(option)
            options.append(option)

        db.session.flush()  # Get options IDs

        # Set the correct answer
        new_question.correct_option_id = options[question_data['correct_answer']].id
        db.session.commit() 
            
    return jsonify({"message": "Quiz created successfully!"}), 201




#To add Question to existing quiz
@app.route('/api/add_question/<int:quiz_id>', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def add_question(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"success": False, "message": "Quiz not found"}), 404

    body = request.get_json()
    new_question = Question(
        quiz_id=quiz_id,
        q_text=body["text"]
    )
    db.session.add(new_question)
    db.session.flush()  # Get the new question ID before committing

    # Add options
    options = []
    for opt in body["options"]:
        option = Option(question_id=new_question.id, opt_text=opt["text"])
        db.session.add(option)
        options.append(option)

    db.session.flush()  # Get options IDs

    # Set the correct answer
    new_question.correct_option_id = options[body["correct_option"]].id
    db.session.commit()

    return jsonify({"success": True, "message": "Question added successfully"}), 201
