from .database import db
from flask_security import UserMixin, RoleMixin

class User(db.Model, UserMixin):
    # required for flask security
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String, unique = True, nullable = False)
    username=db.Column(db.String, nullable = False)
    qulification=db.Column(db.String, default = "None")
    password = db.Column(db.String, nullable = False)
    fs_uniquifier = db.Column(db.String, unique = True, nullable = False)
    active = db.Column(db.Boolean, nullable = False)
    roles = db.relationship('Role', backref = 'bearer', secondary = 'users_roles')
    # extra

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique = True, nullable = False)
    description = db.Column(db.String)

# many-to-many  
class UsersRoles(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))
    
    
# Subject
class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    chapters = db.relationship('Chapter', backref='subject', lazy=True)
    

#Chapters
class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    quizzes = db.relationship('Quiz', backref='chapter', lazy=True)
    

#Quize
class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=False)
    questions = db.relationship('Question', backref='quiz', lazy=True)
    
    
#Question
class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    q_text = db.Column(db.Text, nullable=False)
    options = db.relationship('Option', backref='question', lazy=True,  foreign_keys='Option.question_id')
    correct_option_id = db.Column(db.Integer, db.ForeignKey('option.id'))
 
 
# option for for correspindg q_id
class Option(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    opt_text = db.Column(db.String(255), nullable=False)     
    
    
#score card details of evry attempt
class Attemptscores(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # ✅ Corrected FK
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    quiz = db.relationship('Quiz', backref=db.backref('attempts', lazy=True))
    responses = db.relationship('AttemptResponse', backref='attempt', lazy=True)
    
    
#Response of evry quetion of all attempt
class AttemptResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey('attemptscores.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    selected_option_id = db.Column(db.Integer, db.ForeignKey('option.id'), nullable=False)
    correct = db.Column(db.Boolean, nullable=False)
    # question = db.relationship('Question', backref=db.backref('responses', lazy=True))    