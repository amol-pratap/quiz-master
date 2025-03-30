from .database import db 
from .models import *
from flask import current_app as app, jsonify, request,render_template,  send_from_directory
from flask_security import auth_required, roles_required, roles_accepted, current_user, login_user
from werkzeug.security import check_password_hash, generate_password_hash
from .utils import roles_list

from celery.result import AsyncResult
from .tasks import csv_report, monthly_report, new_quiz_update

from sqlalchemy import text


from flask_security.utils import verify_password
from datetime import datetime


@app.route('/', methods = ['GET'])
def index():
    return render_template('index.html')

@app.route('/api/admin')
@auth_required('token') #Authorizarion
@roles_required('admin') #RBAC/ Authorization
def admin_home():
   
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
            
            for role in user.roles:
                role_n = role.name
              
         
            login_user(user)
          
            roles = roles_list(user.roles)
            role = 'admin' if 'admin' in roles else 'user'
            return jsonify({
                "id": user.id,
                "username": user.username,
                "roles": roles_list(user.roles),
                "role" : role,
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
# @roles_required('user')
# @roles_accepted('user', 'admin')#and
# @roles_accepted(['user', 'admin']) #OR
def user_dashboard():
    user = current_user
   
    return jsonify({
        "id": current_user.id,
        "username": user.username,
        "email": user.email,
        "roles": roles_list(user.roles),
        "role": "admin" if current_user.has_role('admin') else "user"
    })
    
    

#To create new subject
@app.route('/api/subject', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def add_subject():
    data = request.get_json()
    subject_name = data.get("name").strip() 
    subject_desc = data.get("description").strip()

    #  Check if subject already exists
    existing_subject = Subject.query.filter_by(name=subject_name).first()
    if existing_subject:
        return jsonify({"error": "Subject already exists!"}), 400  

    #  Create new subject
    new_subject = Subject(name=subject_name, description=subject_desc)
    db.session.add(new_subject)
    db.session.commit()

    return jsonify({"message": "Subject added successfully!"}), 201


    

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
@roles_accepted('user', 'admin')
# @roles_required('admin')
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
                    'quiz_count': Quiz.query.filter_by(chapter_id=chapter.id).count()  
                } for chapter in chapters
            ]
        })

    return jsonify(data), 200




# To get all quiz of paricular chapter
@app.route('/api/quizzes', methods=['GET'])
@auth_required('token')
@roles_accepted('user', 'admin')
def get_quizzes():
    chapter_id = request.args.get('chapter_id')
    chapter = Chapter.query.get(chapter_id)
    subject = chapter.subject

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
        "subject_name": subject.name,
        "quizzes": quiz_data
    }), 200





# Route to Add Quiz with Questions
@app.route('/api/quizzes', methods=['POST'])
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
    db.session.flush()
    
 
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
        
    quiz_name = new_quiz.title
    chapter_name =  Chapter.query.filter_by(id=chapter_id).first().title
    subject_name =  Subject.query.filter_by(id=subject_id).first().name
    result = new_quiz_update.delay(quiz_name, chapter_name, subject_name )
        
            
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



@app.route('/api/admin_search', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_search():
    search_type = request.args.get("searchType")
    query = request.args.get("query", "").strip()

    if not query:
        return jsonify({"error": "Search query required"}), 400

    response = []

    if search_type == "user":
        search_query = """
            SELECT 
                u.id, u.username, u.email, u.qulification,
                COUNT(DISTINCT a.quiz_id) AS quiz_attempts,
                COUNT(DISTINCT c.id) AS chapter_attempts,
                COUNT(DISTINCT s.id) AS subject_attempts
            FROM user u
            LEFT JOIN attemptscores a ON u.id = a.user_id
            LEFT JOIN quiz q ON a.quiz_id = q.id
            LEFT JOIN chapter c ON q.chapter_id = c.id
            LEFT JOIN subject s ON c.subject_id = s.id
            WHERE u.username LIKE :query OR u.email LIKE :query
            GROUP BY u.id
        """
        result = db.session.execute(text(search_query), {"query": f"%{query}%"}).fetchall()
        response = [dict(row._asdict()) for row in result]

    elif search_type == "subject":
        search_query = """
            SELECT 
                s.id, s.name AS subject_name, 
                COUNT(DISTINCT c.id) AS chapters_count, 
                COUNT(DISTINCT q.id) AS quizzes_count, 
                COUNT(DISTINCT a.user_id) AS unique_users_attempted
            FROM subject s
            LEFT JOIN chapter c ON s.id = c.subject_id
            LEFT JOIN quiz q ON c.id = q.chapter_id
            LEFT JOIN attemptscores a ON q.id = a.quiz_id
            WHERE s.name LIKE :query
            GROUP BY s.id
        """
        result = db.session.execute(text(search_query), {"query": f"%{query}%"}).fetchall()
        response = [dict(row._asdict()) for row in result]

    elif search_type == "chapter":
        search_query = """
            SELECT 
                c.id, c.title AS chapter_title, 
                COUNT(DISTINCT q.id) AS quizzes_count, 
                COUNT(DISTINCT a.user_id) AS unique_users_attempted
            FROM chapter c
            LEFT JOIN quiz q ON c.id = q.chapter_id
            LEFT JOIN attemptscores a ON q.id = a.quiz_id
            WHERE c.title LIKE :query
            GROUP BY c.id
        """
        result = db.session.execute(text(search_query), {"query": f"%{query}%"}).fetchall()
        response = [dict(row._asdict()) for row in result]

    elif search_type == "quiz":
        search_query = """
            SELECT 
                q.id, q.title AS quiz_title, q.description AS quiz_description,
                COUNT(DISTINCT a.user_id) AS unique_users_attempted
            FROM quiz q
            LEFT JOIN attemptscores a ON q.id = a.quiz_id
            WHERE q.title LIKE :query
            GROUP BY q.id
        """
        result = db.session.execute(text(search_query), {"query": f"%{query}%"}).fetchall()
        response = [dict(row._asdict()) for row in result]

    else:
        return jsonify({"error": "Invalid search type"}), 400

    return jsonify({"results": response}), 200





@app.route('/api/admin_summary', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_summary():
    summary_query = """
        SELECT 
            (SELECT COUNT(*) FROM user) AS total_users,
            (SELECT COUNT(*) FROM subject) AS total_subjects,
            (SELECT COUNT(*) FROM chapter) AS total_chapters,
            (SELECT COUNT(*) FROM quiz) AS total_quizzes,
            (SELECT COUNT(*) FROM attemptscores) AS total_attempts,
            (SELECT COUNT(DISTINCT user_id) FROM attemptscores) AS unique_users_attempted
    """
    
    quiz_summary_query = """
        SELECT 
            q.id AS quiz_id,
            q.title AS quiz_title,
            c.title AS chapter_title,
            s.name AS subject_name,
            COUNT(a.id) AS total_attempts,
            COUNT(DISTINCT a.user_id) AS unique_users_attempted,
            MAX(a.score) AS best_score,
            ROUND(SUM(a.score) * 1.0 / COUNT(a.id), 2) AS average_score,
            (SELECT COUNT(*) FROM question WHERE question.quiz_id = q.id) AS total_questions,
            COALESCE(SUM(a.score), 0) AS total_score_sum
        FROM quiz q
        JOIN chapter c ON q.chapter_id = c.id
        JOIN subject s ON c.subject_id = s.id
        LEFT JOIN attemptscores a ON q.id = a.quiz_id
        GROUP BY q.id, q.title, c.title, s.name
        ORDER BY total_attempts DESC;
    """
    
    result = db.session.execute(text(summary_query)).fetchone()
    quiz_results = db.session.execute(text(quiz_summary_query)).fetchall()
    
    # Construct summary response
    response = {
        "total_users": result.total_users - 1,
        "total_subjects": result.total_subjects,
        "total_chapters": result.total_chapters,
        "total_quizzes": result.total_quizzes,
        "total_attempts": result.total_attempts,
        "unique_users_attempted": result.unique_users_attempted,
        "quiz_summary": [
            {
                "quiz_id": row.quiz_id,
                "quiz_title": row.quiz_title,
                "chapter_title": row.chapter_title,
                "subject_name": row.subject_name,
                "total_attempts": row.total_attempts,
                "unique_users_attempted": row.unique_users_attempted,
                "best_score": row.best_score if row.best_score is not None else 0,
                "average_score": row.average_score if row.average_score is not None else 0,
                "total_questions": row.total_questions,
                "total_score_sum": row.total_score_sum
            } 
            for row in quiz_results
        ]
    }

    return jsonify(response), 200


@app.route('/api/delete_user/<int:user_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User deleted successfully'}), 200





















####USER
#To display a quiz to give user for Test
@app.route('/api/take_quiz/<int:quiz_id>', methods=['GET'])
@auth_required('token')
@roles_required('user')
def get_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404
    
    subject_name = quiz.chapter.subject.name     #backref
    chapter_name = quiz.chapter.title    #backref
    


    questions = [
        {
            "id": q.id,
            "text": q.q_text,
            "options": [{"id": opt.id, "text": opt.opt_text} for opt in q.options]
        } for q in quiz.questions
    ]

    return jsonify({"title": quiz.title,
                    "subject_name": subject_name,  
                    "chapter_name": chapter_name, 
                    "questions": questions})


# #To submit a quiz attempt
@app.route('/api/submit_quiz/<int:quiz_id>', methods=['POST'])
@auth_required('token')
@roles_required('user')
def submit_quiz(quiz_id):
    data = request.get_json()
    user_answers = data.get('answers', {})  
    time_taken = data.get('time_taken', 0)  #  Fetch time taken from frontend

    user_id = current_user.id
    quiz = Quiz.query.get(quiz_id)

    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    if not quiz.questions:
        return jsonify({"error": "No questions found in quiz"}), 400

    total_questions = len(quiz.questions)
    correct_count = 0
    incorrect_count = 0
    unattempted_count = 0

    #  Save new attempt with time_taken
    new_attempt = Attemptscores(user_id=user_id, quiz_id=quiz_id, score=0, time_taken=time_taken)
    db.session.add(new_attempt)
    db.session.flush()  

    for question in quiz.questions:
        selected_option_id = user_answers.get(str(question.id))

        if selected_option_id is None:
            unattempted_count += 1
            is_correct = False
        else:
            is_correct = (selected_option_id == question.correct_option_id)
            correct_count += int(is_correct)
            incorrect_count += int(not is_correct)

        response = AttemptResponse(
            attempt_id=new_attempt.id,
            question_id=question.id,
            selected_option_id=selected_option_id if selected_option_id else None,
            correct=is_correct
        )
        db.session.add(response)

    obtained_marks = correct_count * 4
    new_attempt.score = obtained_marks
    db.session.commit()

    return jsonify({
        "message": "Quiz submitted successfully",
        "attempt_id": new_attempt.id,
        "total_questions": total_questions,
        "correct": correct_count,
        "incorrect": incorrect_count,
        "unattempted": unattempted_count,
        "total_marks": total_questions * 4,
        "obtained_marks": obtained_marks,
        "percentage": round((obtained_marks / (total_questions * 4)) * 100, 2),
        "time_taken": time_taken  #  Return time taken
    }), 200





@app.route('/api/quiz_summary/<int:quiz_id>', methods=['GET'])  #summay of all atrtempts of on quiz
@auth_required('token')
@roles_required('user')
def quiz_summary(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    attempts = Attemptscores.query.filter_by(user_id=current_user.id, quiz_id=quiz_id).all()
    
    # If no attempts found
    if not attempts:
        return jsonify({"error": "No attempts found for this quiz"}), 404

    subject_name = quiz.chapter.subject.name     #backref
    chapter_name = quiz.chapter.title    #backref
    
    attempt_data = []
    for attempt in attempts:
        responses = AttemptResponse.query.filter_by(attempt_id=attempt.id).all()

        total_questions = len(quiz.questions)
        correct = sum(1 for r in responses if r.correct)
        incorrect = sum(1 for r in responses if not r.correct and r.selected_option_id is not None)
        unattempted = total_questions - (correct + incorrect)
        total_marks = total_questions * 4
        obtained_marks = correct * 4
        percentage = round((obtained_marks / total_marks) * 100, 2) if total_marks > 0 else 0

        time_taken = attempt.time_taken
        minutes = time_taken // 60
        seconds = time_taken % 60
        formatted_time = f"{minutes} min {seconds} sec" if minutes else f"{seconds} sec"


        attempt_data.append({
            "attempt_id": attempt.id,
            "time_taken": formatted_time,
            "total_questions": total_questions,
            "correct": correct,
            "incorrect": incorrect,
            "unattempted": unattempted,
            "total_marks": total_marks,
            "obtained_marks": obtained_marks,
            "percentage": percentage
        })

    return jsonify({
        "quiz_title": quiz.title,
        "subject_name": subject_name,  
        "chapter_name": chapter_name,
        "attempts": attempt_data
    }), 200




@app.route('/api/attempt_responses/<int:attempt_id>', methods=['GET'])
@auth_required('token')
@roles_required('user')
def get_attempt_responses(attempt_id):
    attempt = Attemptscores.query.get(attempt_id)
    
    if not attempt:
        return jsonify({"error": "Attempt not found"}), 404

    responses = AttemptResponse.query.filter_by(attempt_id=attempt_id).all()
    
    if not responses:
        return jsonify({"error": "No responses found for this attempt"}), 404  
    
    response_data = []
    for response in responses:
        question = Question.query.get(response.question_id)
        correct_option = Option.query.get(question.correct_option_id) if question else None
        selected_option = Option.query.get(response.selected_option_id) if response.selected_option_id else None

        response_data.append({
            "question_id": response.question_id,
            "question_text": question.q_text if question else "Unknown Question",
            "correct_option": correct_option.opt_text if correct_option else "Unknown",
            "selected_option": selected_option.opt_text if selected_option else "Unattempted"
        })

    return jsonify({"responses": response_data}), 200



@app.route('/api/search_quiz', methods=['GET'])
@auth_required('token')
@roles_required('user')
def search_quiz():
    query = request.args.get('query', '').strip()
    search_type = request.args.get('type', 'quiz')  

    if not query:
        return jsonify({"error": "Search query is required"}), 400

    results = []

    if search_type == 'subject':
        subjects = Subject.query.filter(Subject.name.ilike(f"%{query}%")).all()
        for subject in subjects:
            for chapter in subject.chapters:
                for quiz in chapter.quizzes:
                    results.append({
                        "quiz_id": quiz.id,
                        "quiz_title": quiz.title,
                        "description": quiz.description,
                        "chapter_title": chapter.title,  
                        "subject_name": subject.name
                    })

    elif search_type == 'chapter':
        chapters = Chapter.query.filter(Chapter.title.ilike(f"%{query}%")).all() 
        for chapter in chapters:
            for quiz in chapter.quizzes:
                results.append({
                    "quiz_id": quiz.id,
                    "quiz_title": quiz.title,
                    "description": quiz.description,
                    "chapter_title": chapter.title,  
                    "subject_name": chapter.subject.name
                })

    elif search_type == 'quiz':
        quizzes = Quiz.query.filter(Quiz.title.ilike(f"%{query}%")).all()
        for quiz in quizzes:
            results.append({
                "quiz_id": quiz.id,
                "quiz_title": quiz.title,
                "description": quiz.description,
                "chapter_title": quiz.chapter.title, 
                "subject_name": quiz.chapter.subject.name
            })

    return jsonify({"quizzes": results})







# Summary of all quiz given by a user
@app.route('/api/user_summary', methods=['GET'])  
@auth_required('token')
@roles_required('user')
def user_summary():
    user_id = current_user.id  


    summary_query = """
        SELECT 
            q.id AS quiz_id, 
            q.title AS quiz_title,
            c.title AS chapter_title,
            s.name AS subject_name,
            COUNT(a.id) AS attempts_count,
            MAX(a.score) AS best_score,
            SUM(a.score) AS total_score,
            (SELECT COUNT(id) FROM question WHERE quiz_id = q.id) AS total_questions
        FROM attemptscores a
        JOIN quiz q ON a.quiz_id = q.id
        JOIN chapter c ON q.chapter_id = c.id
        JOIN subject s ON c.subject_id = s.id
        WHERE a.user_id = :user_id
        GROUP BY q.id, q.title, c.title, s.name;
    """

    result = db.session.execute(text(summary_query), {"user_id": user_id}).fetchall()

    summary_data = []
    
    for row in result:
        summary_data.append({
            "quiz_id": row.quiz_id,
            "quiz_title": row.quiz_title,
            "chapter_title": row.chapter_title,
            "subject_name": row.subject_name,
            "attempts": row.attempts_count,   # Total attempts for this quiz
            "best_score": row.best_score,     # Best score in all attempts
            "total_score": row.total_score,   # Sum of scores in all attempts
            "total_questions": row.total_questions  # Total questions in that quiz
        })

    return jsonify({"summary": summary_data}), 200

    
    
    
    
#exports things
@app.route('/api/export/<int:quiz_id>') # this manually triggers the job
def export_csv(quiz_id):
    user_id = current_user.id
    result = csv_report.delay(quiz_id, user_id) # async object

    return jsonify({
        "id": result.id,
        "result": result.result,

    })
    

@app.route('/api/csv_result/<id>') # just create to test the status of result
def csv_result(id):
    res = AsyncResult(id)

    if res:  
        return send_from_directory('static', res.result)
    return jsonify({"message": "result not found"}), 404



@app.route('/api/user/quiz_attempts', methods=['GET'])
@auth_required('token')
def get_user_quiz_attempts():
    user_id = current_user.id  # Get logged-in user ID

    query = """
        SELECT s.name AS subject_name, COUNT(DISTINCT a.quiz_id) AS attempts
        FROM attemptscores a
        JOIN quiz q ON a.quiz_id = q.id
        JOIN chapter c ON q.chapter_id = c.id
        JOIN subject s ON c.subject_id = s.id
        WHERE a.user_id = :user_id
        GROUP BY s.name
        ORDER BY attempts DESC
    """

    result = db.session.execute(text(query), {"user_id": user_id}).fetchall()
    response = [{"subject": row.subject_name, "attempts": row.attempts} for row in result]

    return jsonify(response), 200






# @app.route('/api/user_profile', methods=['GET'])
# @auth_required('token')
# def user_profile():
#     try:
#         print(f"Fetching profile for user: {current_user.id}")  # Debugging

#         query = text("""
#             SELECT q.id AS quiz_id, s.subject_name, c.chapter_title, q.quiz_title,
#                    COUNT(a.id) AS total_attempts,
#                    COALESCE(MAX(a.score), 0) AS best_score,
#                    COALESCE(AVG(a.score), 0) AS average_score,
#                    q.total_questions
#             FROM quiz q
#             JOIN chapter c ON q.chapter_id = c.id
#             JOIN subject s ON c.subject_id = s.id
#             LEFT JOIN attemptscores a ON q.id = a.quiz_id AND a.user_id = :user_id
#             GROUP BY q.id, s.subject_name, c.chapter_title, q.title, q.total_questions
#         """)

#         quiz_summary = db.session.execute(query, {"user_id": current_user.id}).mappings().all()

#         print("✅ Query executed successfully")  # Debugging

#         return jsonify({
#             "name": current_user.name,
#             "email": current_user.email,
#             "qualification": current_user.qualification,
#             "quiz_summary": [dict(row) for row in quiz_summary]
#         })

#     except Exception as e:
#         print("❌ ERROR in user_profile:", str(e))  # Print full error
#         return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


@app.route('/api/user_profile', methods=['GET'])
@auth_required('token')
@roles_required('user')
def get_user_profile():
    """Fetch logged-in user's profile details"""
    user = current_user
    
    
    
    return jsonify({
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "qualification": user.qulification,
        "active": user.active
    
    })
