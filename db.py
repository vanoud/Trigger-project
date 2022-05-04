from datetime import datetime

from bson import ObjectId #module pour le format de base mongodb
from pymongo import MongoClient, DESCENDING #import du client de connexion mongo pymongo pour gérer les requetes
from werkzeug.security import generate_password_hash  #module de haschage pour le mot de passe 

from user import User # import du modele user on va instancié via les fonctions ci dessous 



""" Gestion de la base de données (messages , membres messages) 
    client de connexion mongo vers le cloud mongodb ( service aws )
    base de donnée non ORM pour des raison techniques 
"""
client = MongoClient("mongodb+srv://vanoud:formation59@chatapp.wbany.mongodb.net/myFirstDatabase?retryWrites=true&w=majority") #connexion à la base mongodb sur aws 

chat_db = client.get_database("ChatDB") #recuperation de la base mongo
users_collection = chat_db.get_collection("users") #recuperation de la collection users dans la var users_collection
rooms_collection = chat_db.get_collection("rooms") # recuperation de la colelction dans une variable 
room_members_collection = chat_db.get_collection("room_members")
messages_collection = chat_db.get_collection("messages")


#fonction pour recupérer le password et le haché
#  push dans la db les valeurs du formulaire
def save_user(username, email, password):
    password_hash = generate_password_hash(password)
    users_collection.insert_one({'_id': username, 'email': email, 'password': password_hash})
# user_collection = requetes de la db et insert_one() methode pymongo pour push dans la mongodb

def get_user(username):
    user_data = users_collection.find_one({'_id': username})
    return User(user_data['_id'], user_data['email'], user_data['password']) if user_data else None
#   avec return user on appel la class User  du fichier user.py voir class et instance 

def save_room(room_name, created_by,subject):
    
    room_id = rooms_collection.insert_one(
        {'name': room_name, 'created_by': created_by, 'created_at': datetime.now(),'subject': subject }).inserted_id
    add_room_member(room_id, room_name, created_by, created_by,subject ,is_room_admin=True)
    

    return room_id


def update_room(room_id, room_name):
    rooms_collection.update_one({'_id': ObjectId(room_id)}, {'$set': {'name': room_name}})
    room_members_collection.update_many({'_id.room_id': ObjectId(room_id)}, {'$set': {'room_name': room_name}})


def get_room(room_id):
    return rooms_collection.find_one({'_id': ObjectId(room_id)})

def test_ok(subject):
 return rooms_collection.find_one({'subject': subject})

def add_room_member(room_id, room_name, username, added_by,subject ,is_room_admin=False):
    room_members_collection.insert_one(
        {'_id': {'room_id': ObjectId(room_id), 'username': username}, 'room_name': room_name, 'added_by': added_by,
         'added_at': datetime.now(),'subject':subject, 'is_room_admin': is_room_admin})
        # ici insert one pour clef valeur unique 

def add_room_members(room_id, room_name, usernames, added_by,subject):
    room_members_collection.insert_many(
        [{'_id': {'room_id': ObjectId(room_id), 'username': username}, 'room_name': room_name, 'added_by': added_by, 'subject' : subject,
          'added_at': datetime.now(), 'is_room_admin': False} for username in usernames])
        # ici insert many pour clef et valeurs multiples 

def remove_room_members(room_id, usernames):
    room_members_collection.delete_many(
        {'_id': {'$in': [{'room_id': ObjectId(room_id), 'username': username} for username in usernames]}})


def get_room_members(room_id):
    return list(room_members_collection.find({'_id.room_id': ObjectId(room_id)}))
     
def get_subject(subject):
    return list(room_members_collection.find({'subject': subject}))

def get_rooms_for_user(username):
    return list(room_members_collection.find({'_id.username': username}))


def is_room_member(room_id, username):
    return room_members_collection.count_documents({'_id': {'room_id': ObjectId(room_id), 'username': username}})


def is_room_admin(room_id, username):
    return room_members_collection.count_documents(
        {'_id': {'room_id': ObjectId(room_id), 'username': username}, 'is_room_admin': True})

def save_message(room_id, text, sender):
    messages_collection.insert_one({'room_id': room_id, 'text': text, 'sender': sender, 'created_at': datetime.now()})

def all_users():
    
    collect = users_collection.find()
    p = []
    for i in collect:
        p.append(i['_id'])

    ok = str(p).strip('[]')
    ok2  = str(ok).strip('\'')
    ok3  = str(ok2).replace('\'',' ')
    return ok3


MESSAGE_FETCH_LIMIT = 3


def get_messages(room_id, page=0):
    offset = page * MESSAGE_FETCH_LIMIT
    messages = list(
        messages_collection.find({'room_id': room_id}).sort('_id', DESCENDING).limit(MESSAGE_FETCH_LIMIT).skip(offset))
    for message in messages:
        message['created_at'] = message['created_at'].strftime("%d %b, %H:%M")
    return messages[::-1]
