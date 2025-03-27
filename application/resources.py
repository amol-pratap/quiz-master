from flask_restful import Api, Resource, reqparse 
from flask import jsonify, request
from .models import *
from flask_security import auth_required, roles_required, roles_accepted, current_user
import datetime
from .utils import roles_list

api = Api()

# def roles_list(roles):
#     role_list = []
#     for role in roles:
#         role_list.append(role.name)
#     return role_list


class SubjectResource(Resource):
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self, subject_id):

        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404

        subject = {
                "id": subject.id,
                "name": subject.name,
                "description": subject.description
            }
        return jsonify(subject)

    @auth_required('token')
    @roles_required('admin')
    def post(self):

        body = request.get_json()
        new_subject = Subject(
            name=body["name"],
            description=body["description"],
        )
        db.session.add(new_subject)
        db.session.commit()
        return {"message": "Subject created successfully"}, 201

    @auth_required('token')
    @roles_required('admin')
    def put(self, subject_id):
    
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"error": "Subject not found"}, 404

        body = request.get_json()
        subject.name = body["name"]
        subject.description = body["description"]
        db.session.commit()
        return {"message": "Subject updated successfully"}, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self, subject_id):

        subject = Subject.query.get(subject_id)
        if not subject:
            return {"error": "Subject not found"}, 404

        db.session.delete(subject)
        db.session.commit()
        return {"message": "Subject deleted successfully"}, 200




class ChapterResource(Resource):
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self, chapter_id):
 
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter does not exist"}, 404

        chapter = {
                "id": chapter.id,
                "title": chapter.title,
                "quiz_count": Quiz.query.filter_by(chapter_id=chapter.id).count(),
                }
        
        return jsonify(chapter)

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        
        body = request.get_json()
        new_chapter = Chapter(
            title=body["title"],
            subject_id=body["subject_id"],
        )
        db.session.add(new_chapter)
        db.session.commit()
        return {"message": "Chapter created successfully"}, 201

    @auth_required('token')
    @roles_required('admin')
    def put(self, chapter_id):
  
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"error": "Chapter not found"}, 404

        body = request.get_json()
        chapter.title = body["title"]
        db.session.commit()
        return {"message": "Chapter updated successfully"}, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self, chapter_id):

        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"error": "Chapter not found"}, 404

        db.session.delete(chapter)
        db.session.commit()
        return {"message": "Chapter deleted successfully"}, 200




class QuizResource(Resource):
    @auth_required('token')
    # @roles_required('admin')
    @roles_accepted('user','admin')
    def get(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}, 404
        return jsonify({"id": quiz.id, "title": quiz.title, "description": quiz.description, "chapter_id": quiz.chapter_id})

    
    @auth_required('token')
    @roles_required('admin')
    def put(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}, 404

        body = request.get_json()
        quiz.title = body.get("title", quiz.title)

        db.session.commit()
        return {"message": "Quiz updated successfully"}, 200
    
    
    @auth_required('token')
    @roles_required('admin')
    def delete(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}, 404
        
        #Delete its related question
        # Question.query.filter_by(quiz_idid=quiz_id).delete()
        db.session.delete(quiz)
        db.session.commit()
        return {"message": "Quiz deleted successfully"}, 200


class QuestionResource(Resource):
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self, question_id):
        quest = Question.query.get(question_id)
        if quest:
            question_data = {'id': quest.id,
                              'text':quest.q_text,
                              'correct_option_id': quest.correct_option_id,
                              'options': [{'id': option.id, 'text': option.opt_text} for option in quest.options]
                            }
            return jsonify(question_data)
        else:
            return {'error': 'Question not found'}, 404
    
    
    @auth_required('token')
    @roles_required('admin')
    def put(self, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {"error": "Question not found"}, 404

        body = request.get_json()
        print("To upade-------------------- ",body)
        
        question.q_text = body["text"]
        question.correct_option_id = body["correct_option_id"]

        for opt in body["options"]:
            option = Option.query.get(opt["id"])
            if option:
                option.opt_text = opt["text"]

        db.session.commit()

        return {"message": "Question updated successfully"}, 200

    
    @auth_required('token')
    @roles_required('admin')  # Only admins can delete questions
    def delete(self, question_id):
        question = Question.query.get(question_id)

        if not question:
            return {"error": "Question not found"}, 404

        # Delete related options first (to maintain referential integrity)
        Option.query.filter_by(question_id=question.id).delete()

        # Delete the question itself
        db.session.delete(question)
        db.session.commit()

        return {"message": "Question deleted successfully"}, 200
    
    
api.add_resource(SubjectResource, "/api/subject/<int:subject_id>")
api.add_resource(ChapterResource, "/api/chapter/<int:chapter_id>")
api.add_resource(QuizResource, "/api/quiz/<int:quiz_id>")    
api.add_resource(QuestionResource, "/api/question/<int:question_id>", "/api/update_question/<int:question_id>")
