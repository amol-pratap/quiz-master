from celery import shared_task
from .models import *
from .utils import format_report
from .mail import send_email
import datetime
import csv
from sqlalchemy.sql import text
import requests #plural
import json


@shared_task(ignore_results = False, name = "download_csv_report")
def csv_report(quiz_id, user_id):
    
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





@shared_task(ignore_results = False, name = "monthly_report")
def monthly_report():
    users = User.query.all()
    for user in users[1:]:
        user_data = {}
        user_data['username'] = user.username
        user_data['email'] = user.email
        user_id = user.id

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
            
        user_data['all_quiz'] = summary_data
        message = format_report('templates/mail_details.html', user_data)
        send_email(user.email, subject = "Monthly Summary Report of Quizzes - QUIZ - Master", message = message)
    return "Monthly summary report sent"
        



@shared_task(ignore_results = False, name = "quiz_update")
def new_quiz_update(quiz_name, chapter_name, subject_name):
    text = f"Hi Student, New quiz {quiz_name} of Chapter {chapter_name} is added in Subject {subject_name} , you are recommed to attempt it. "
    url = "https://chat.googleapis.com/v1/spaces/AAQAwkUW5yM/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=3hISlUbc4TXUJ-tKtRXGTh0MstxYj_WlxcrlQwMNk7w"
    response = requests.post(url, json = {"text": text})
    return "Update sent to user"










#Helping function for use in task
from flask import current_app as app, jsonify
from .models import *


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