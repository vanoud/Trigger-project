from datetime import datetime #import module date time pour daté les messages 
import unittest
import logging
# from bson.json_util import dumps
from flask import Flask, render_template, request, redirect, url_for #import flask gestionaire de vue et de requete et de redirection
from flask_login import LoginManager, login_user, login_required, logout_user, current_user # module d'auth 
from flask_socketio import SocketIO, join_room, leave_room #gestionnaire de socket 
from pymongo.errors import DuplicateKeyError #gestionaire d'erreur de requetes 
# import du modele de la db 
from db import get_user, save_user, save_room, add_room_members, get_rooms_for_user, get_room, is_room_member, \
    get_room_members, is_room_admin, update_room, remove_room_members, save_message, get_messages ,get_subject,all_users

app = Flask(__name__)
app.secret_key = "sfdjkafnk" 
socketio = SocketIO(app) 
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

#decorateur de route ( url ) 

logging.basicConfig(filename='record.log', level=logging.DEBUG, format=f'%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')


@app.route('/')
def index():
    redirect(url_for('login'))
    return render_template('login.html')

@app.route('/debats')
def home(): #methode de la route dans laquel on verifie si un user est log on retourne une vue debats.html 
    rooms = []
    if current_user.is_authenticated() : 
        rooms = get_rooms_for_user(current_user.username)
    return render_template("debats.html", rooms=rooms)


@app.route('/politique/')
def politique():
    rooms = []
    subject = []
    if current_user.is_authenticated():
        subject = get_subject(subject)
        rooms = get_rooms_for_user(current_user.username)
        # subject = test_ok(current_user.username)
    return render_template("politique.html", rooms=rooms,subject=subject)

@app.route('/ecologie/')
def ecologie():
    rooms = []
    subject = []
    if current_user.is_authenticated():
        subject = get_subject(subject)
        rooms = get_rooms_for_user(current_user.username)
        # subject = test_ok(current_user.username)
    return render_template("ecologie.html", rooms=rooms,subject=subject)

@app.route('/technologie/')
def technologie():
    rooms = []
    subject = []
    if current_user.is_authenticated():
        subject = get_subject(subject)
        rooms = get_rooms_for_user(current_user.username)
        # subject = test_ok(current_user.username)
    return render_template("technologie.html", rooms=rooms,subject=subject)


#route sur laquel on verifie si le user est auth qui redirige vers la page debats en appelant la methode home plus haut
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))

    message = ''
    if request.method == 'POST': #si on valide le formulaire voir submit form dans les vues login.html
        username = request.form.get('username')
        password_input = request.form.get('password')
        user = get_user(username)
        # ici on recupére la requete mongodb via la methode get_user du modele  voir fonction get_user dans db.py
        if user and user.check_password(password_input):
            login_user(user)
            return redirect(url_for('home'))
        #methode login_user de flask_login qui va check l'objet user et redirigé la methode home qui appel la methode home() route ("/") 
        else:
            message = 'Failed to login!'
    return render_template('login.html', message=message)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    #si user connecté on redirige vers la page d'index 
    message = ''
    if request.method == 'POST': # ici on recupére le formulaire si ok on try : avec la methode save user qui push en db 
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        try:
            save_user(username, email, password)
            return redirect(url_for('login'))
        except DuplicateKeyError:
            message = "Cet utilisateur Existe déja !!"
    return render_template('signup.html', message=message)


@app.route("/logout/")
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

#route pour la creation de rooms 
@app.route('/create-room/', methods=['GET', 'POST'])
@login_required #methode qui verifie si auth 
def create_room():
    message = ''
    if request.method == 'POST' and request.form.get('flexRadioDefault') == 'private':
        room_name = request.form.get('room_name')
        usernames = [username.strip() for username in request.form.get('members').split(',')] #ici on recupére les nom d'user dans du formulaire de creation de rooms on strip pour les espaces 
        subject = request.form.get('subject')                                                                                 # et on parse avec une " , " pour recupérer un tableau des users  
        if len(room_name) and len(usernames): # check conditionnel si true 
            room_id = save_room(room_name, current_user.username,subject)  # on stock dans une variable la methode de requetes de base 
            
            if current_user.username in usernames: 
                usernames.remove(current_user.username)
            subject = request.form.get('subject')  
            add_room_members(room_id, room_name, usernames, current_user.username,subject)

            return redirect(url_for('view_room', room_id=room_id)) 
        else:
            message = "Echec de creation de room"
    
    elif request.method == 'POST' and request.form.get('flexRadioDefault') == 'public':
        room_name = request.form.get('room_name')
        all_user =  all_users()
        usernames2 = [all_user.strip() for all_user in all_user.split(',')]
        subject = request.form.get('subject')  
        if len(room_name): # check conditionnel si true 
            room_id = save_room(room_name, current_user.username,subject)  # on stock dans une variable la methode de requetes de base 
            if current_user.username in usernames2: 
                usernames2.remove(current_user.username)
            subject = request.form.get('subject') 
            add_room_members(room_id, room_name, usernames2, current_user.username,subject)
            return redirect(url_for('view_room', room_id=room_id)) 
        else:
            message = "Echec de creation de room"

    return render_template('create_room.html', message=message)


@app.route('/rooms/<room_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_room(room_id):
    room = get_room(room_id)
    if room and is_room_admin(room_id, current_user.username):
        existing_room_members = [member['_id']['username'] for member in get_room_members(room_id)]
        room_members_str = ",".join(existing_room_members)
        message = ''
        if request.method == 'POST':
            room_name = request.form.get('room_name')
            room['name'] = room_name
            update_room(room_id, room_name)

            new_members = [username.strip() for username in request.form.get('members').split(',')]
            members_to_add = list(set(new_members) - set(existing_room_members))
            members_to_remove = list(set(existing_room_members) - set(new_members))
            if len(members_to_add):
                add_room_members(room_id, room_name, members_to_add, current_user.username)
            if len(members_to_remove):
                remove_room_members(room_id, members_to_remove)
            message = 'Room edited successfully'
            room_members_str = ",".join(new_members)
        return render_template('edit_room.html', room=room, room_members_str=room_members_str, message=message)
    else:
        return "Channel introuvable !", 404


@app.route('/rooms/<room_id>/')
@login_required
def view_room(room_id):
    room = get_room(room_id)
    if room and is_room_member(room_id, current_user.username):
        room_members = get_room_members(room_id)
        messages = get_messages(room_id)
        return render_template('view_room.html', username=current_user.username, room=room, room_members=room_members,
                               messages=messages)
                               
    else:
        return "Channel introuvable !", 404


@app.route('/rooms/<room_id>/messages/')
@login_required
def get_older_messages(room_id):
    room = get_room(room_id)
    if room and is_room_member(room_id, current_user.username):
        page = int(request.args.get('page', 0))
        messages = get_messages(room_id, page)
        return dumps(messages)
    else:
        return "Channel introuvable !", 404

@app.route('/test/')
def test():
    
    test = all_users()

    return test


@socketio.on('send_message')
def handle_send_message_event(data):
    app.logger.info("{} a envoyé un message au channel {}: {}".format(data['username'],
                                                                    data['room'],
                                                                    data['message']))
    data['created_at'] = datetime.now().strftime("%d %b, %H:%M")
    save_message(data['room'], data['message'], data['username'])
    socketio.emit('receive_message', data, room=data['room'])


@socketio.on('join_room')
def handle_join_room_event(data):
    app.logger.info("{} a rejoint le channel {}".format(data['username'], data['room']))
    join_room(data['room'])
    socketio.emit('join_room_announcement', data, room=data['room'])


@socketio.on('leave_room')
def handle_leave_room_event(data):
    app.logger.info("{} a quitté le channel{}".format(data['username'], data['room']))
    leave_room(data['room'])
    socketio.emit('leave_room_announcement', data, room=data['room'])


@login_manager.user_loader
def load_user(username):
    return get_user(username)


if __name__ == '__main__':
    socketio.run(app, debug=True,host="0.0.0.0",port=80)
    unittest.main()

