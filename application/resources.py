from flask_restful import Api, Resource, reqparse 
from .models import *
from flask_security import auth_required, roles_required, roles_accepted, current_user
from .utils import roles_list

api = Api()

# def roles_list(roles):
#     role_list = []
#     for role in roles:
#         role_list.append(role.name)
#     return role_list
