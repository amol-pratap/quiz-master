from celery import shared_task
from .models import *
from .utils import format_report
# from .mail import send_email
import datetime
import csv
# import requests #plural
import json
# from .routes import quiz_summary


@shared_task(ignore_results = False, name = "download_csv_report")
def csv_report(quiz_id, user_id):
    
    # from .routes import quiz_summary
    
    summary = quiz_summary(quiz_id, user_id)
    summary_dict = summary
    attempts = summary_dict[0]['attempts']
    attempts = attempts[::-1]
    length = len(attempts)

    csv_file_name = f"summary_{datetime.datetime.now().strftime("%f")}.csv" #summary_123456.csv
    with open(f'static/{csv_file_name}', 'w', newline = "") as csvfile:
    # csvfile = open(f'static/{csv_file_name}', 'w', newline = "")
        sr_no = 0
        summary_csv = csv.writer(csvfile, delimiter = ',')
        summary_csv.writerow(['Attempt No.', 'Total Qs', 'Correct', 'Incorrect', 'Unattempted', 'Total Marks', 'Obtained', '% Score', 'Time'])
        for a in attempts:
            this_attempt = [length - sr_no, a['total_questions'], a['correct'], a['incorrect'], a['unattempted'], a['total_marks'], a['obtained_marks'], a['percentage'], a['time_taken']]
            summary_csv.writerow(this_attempt)
            
            sr_no += 1

    return csv_file_name

# @shared_task(ignore_results = False, name = "monthly_report")
# def monthly_report():
#     users = User.query.all()
#     for user in users[1:]:
#         user_data = {}
#         user_data['username'] = user.username
#         user_data['email'] = user.email
#         user_trans = []
#         for transaction in user.trans:
#             this_trans = {}
#             this_trans["id"] = transaction.id
#             this_trans["name"] = transaction.name
#             this_trans["type"] = transaction.type
#             this_trans["source"] = transaction.source
#             this_trans["destination"] = transaction.destination
#             this_trans["delivery"] = transaction.delivery
#             this_trans["amount"] = transaction.amount
#             this_trans["user"] = transaction.bearer.username #/current_user.id 
#             user_trans.append(this_trans)
#         user_data['transactions'] = user_trans
#         message = format_report('templates/mail_details.html', user_data)
#         send_email(user.email, subject = "Monthly transaction Report - Fast Logistics", message = message)
#     return "Monthly reports sent"

# @shared_task(ignore_results = False, name = "delivery_update")
# def delivery_report(username):
#     text = f"Hi {username}, your delivery status has been updated. Please check the app at http://127.0.0.1:5000"
#     response = requests.post("https://chat.googleapis.com/v1/spaces/AAAAGfF3foI/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=gpn4rKlqCta9pKqgherO4fwknc0i4YMj06UkaRJW4CU", json = {"text": text})
#     print(response.status_code)
#     return "The delivery is sent to user"

    
#     # https://chat.googleapis.com/v1/spaces/AAAAGfF3foI/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=gpn4rKlqCta9pKqgherO4fwknc0i4YMj06UkaRJW4CU




#     # |||||||||||||||||||||||||||||||||||||||||| ---> 10 mins 
#     # |\\\\\\\\\\\\\\\\\\\|\\\\\\\\\\\\\\\\\\\\\ ---> with cache  














from flask import current_app as app, jsonify
from .models import *

# @app.route('/api/quiz_summary/<int:quiz_id>', methods=['GET'])
# # @auth_required('token')
# # @roles_required('user')
def quiz_summary(quiz_id, user_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    attempts = Attemptscores.query.filter_by(user_id=user_id, quiz_id=quiz_id).all()
    
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
            # "timestamp": attempt.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "time_taken": formatted_time,
            "total_questions": total_questions,
            "correct": correct,
            "incorrect": incorrect,
            "unattempted": unattempted,
            "total_marks": total_marks,
            "obtained_marks": obtained_marks,
            "percentage": percentage
        })

    return [{
        "quiz_title": quiz.title,
        "subject_name": subject_name,  
        "chapter_name": chapter_name,
        "attempts": attempt_data
    }]