# notify_socket.py
from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*")

def emit_alert_to_dashboard(data):
    socketio.emit('emergency_alert', data)
