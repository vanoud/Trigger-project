from datetime import datetime

from bson import ObjectId #module pour le format de base mongodb
from pymongo import MongoClient, DESCENDING #import du client de connexion mongo pymongo pour gérer les requetes
from werkzeug.security import generate_password_hash  #module de haschage pour le mot de passe 

from user import User # import du modele user on va instancié via les fonctions ci dessous 

client = MongoClient("mongodb+srv://vanoud:formation59@chatapp.wbany.mongodb.net/myFirstDatabase?retryWrites=true&w=majority") #connexion à la base mongodb sur aws 

chat_db = client.get_database("ChatDB") #recuperation de la base mongo
users_collection = chat_db.get_collection("users") #recuperation de la collection users dans la var users_collection
rooms_collection = chat_db.get_collection("rooms") # recuperation de la colelction dans une variable 
room_members_collection = chat_db.get_collection("room_members")
messages_collection = chat_db.get_collection("messages")


def get_user():
    
    collect = users_collection.find()
    p = []
    for i in collect:
        print(i['_id'])
        p.append(i['_id'])
    
    print(p)
    
get_user()