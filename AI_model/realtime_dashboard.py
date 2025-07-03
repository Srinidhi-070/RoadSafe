from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@socketio.on('new_alert')
def handle_alert(data):
    print("Alert received:", data)

if __name__ == '__main__':
    socketio.run(app, debug=True,port=5002)
