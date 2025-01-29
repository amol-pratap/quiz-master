class config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    
class LocalDEVelopmentconfig(config):   
    SQLALCHEMY_DATABASE_URI = "sqlite:///quiz-master.sqlite3"
    DEBUG = True
    
    #config ofr security
    SECRET_KEY = "my-top-secret-key" # hash user password, session
    SECURITY_PASSWORD_HASH = "ASDFGH"  #mechanism for hashing password
    SECURITY_PASSWORD_SALT =  "this-is-passsword-salt"  #helps in hashing password
    WTF_CSRF_ENABLED= False
    SECURITY_TOKEN_AUTHENTICATION_HEADER= "Authentication-Token"