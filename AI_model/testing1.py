from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from flask import send_from_directory
from io import BytesIO
from PIL import Image
import base64, os, json
from datetime import datetime
from ultralytics import YOLO
import requests
import pandas as pd
import random
import math



app = Flask(__name__, static_url_path='/public', static_folder='public', template_folder='templates')
socketio = SocketIO(app, cors_allowed_origins="*")

EMERGENCY_DIR = 'public/emergency'
LOG_DIR = 'activity_log'
os.makedirs(EMERGENCY_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

model = YOLO(r"C:\Users\nilam\OneDrive\Desktop\Mini_project\my_model\train\weights\best.pt")
model.conf = 0.25

class_weights = {
    'fire': 0.9, 'smoke': 0.8, 'airbag': 0.7, 'truck': 0.6,
    'damaged_bike': 0.5, 'accident': 0.4, 'injured_person': 0.1,
    'damaged_car': 0.1, 'healthy_person': 0.0, 'undamaged_car': 0.0
}

latest_detection = {}

def generate_dummy_ambulances(center_lat, center_lon, count=6, radius_m=2500):
    dummy_ambulances = []
    for _ in range(count):
        angle = random.uniform(0, 2 * math.pi)
        distance = random.uniform(0, radius_m)
        delta_lat = (distance * math.cos(angle)) / 111320
        delta_lon = (distance * math.sin(angle)) / (111320 * math.cos(math.radians(center_lat)))
        dummy_ambulances.append({
            "latitude": center_lat + delta_lat,
            "longitude": center_lon + delta_lon
        })
    return dummy_ambulances

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def predict_severity_from_image_path(image_path):
    results = model(image_path)
    result = results[0]
    boxes = result.boxes
    df = pd.DataFrame({
        "xmin": boxes.xyxy[:, 0].cpu().numpy(),
        "ymin": boxes.xyxy[:, 1].cpu().numpy(),
        "xmax": boxes.xyxy[:, 2].cpu().numpy(),
        "ymax": boxes.xyxy[:, 3].cpu().numpy(),
        "confidence": boxes.conf.cpu().numpy(),
        "class": boxes.cls.cpu().numpy()
    })
    df["name"] = [model.names[int(cls)] for cls in df["class"]]
    counts = df['name'].value_counts().to_dict()
    total_score = sum(counts.get(cls, 0) * wt for cls, wt in class_weights.items())
    severity = "Severe" if total_score >= 1.4 else "Moderate" if total_score >= 0.6 else "Minor"
    return severity, counts, total_score

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/public/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('public/js', filename)

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route("/ambulance_dashboard")
def ambulance_dashboard():
    return render_template("ambulance_dashboard.html")

@app.route('/upload', methods=['POST'])
def upload_image():
    global latest_detection
    data = request.get_json()
    image_data = data['image'].split(",")[1]
    img_bytes = base64.b64decode(image_data)
    img = Image.open(BytesIO(img_bytes)).convert('RGB')

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"captured_{timestamp}.jpg"
    file_path = os.path.join(EMERGENCY_DIR, filename)
    img.save(file_path)

    severity, counts, total_score = predict_severity_from_image_path(file_path)

    latest_detection = {
        "image": f"/public/emergency/{os.path.basename(file_path)}",
        "severity": severity,
        "counts": counts
    }

    return jsonify({
        'severity': severity,
        'total_score': round(total_score, 2),
        'counts': counts
    })

@app.route('/notify_all_services', methods=['POST'])
def notify_all_services():
    global latest_detection
    data = request.get_json()
    location = data.get("location")

    now = datetime.now()
    log_entry = {
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S"),
        "notification": "Notification sent to all emergency services - hospital, police_station, fire_station",
        "severity": latest_detection.get("severity", "N/A"),
        "counts": latest_detection.get("counts", {})
    }

    log_file = os.path.join(LOG_DIR, "alert_log.json")
    logs = []
    if os.path.exists(log_file):
        try:
            with open(log_file, "r") as f:
                logs = json.load(f)
        except:
            logs = []

    logs.append(log_entry)
    with open(log_file, "w") as f:
        json.dump(logs, f, indent=4)

    # Generate dummy ambulances
    dummy_ambulances = generate_dummy_ambulances(location["latitude"], location["longitude"])

    socketio.emit('emergency_alert', {
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "timestamp": now.strftime("%H:%M:%S"),
        "severity": latest_detection.get("severity", "N/A"),
        "counts": latest_detection.get("counts", {}),
        "image": latest_detection.get("image", ""),
        "ambulances": dummy_ambulances
    })

    return jsonify({"status": "success"}), 200

@app.route('/get_nearby_services', methods=['POST'])
def get_nearby_services():
    data = request.get_json()
    lat, lon = data.get("latitude"), data.get("longitude")
    if not lat or not lon:
        return jsonify({"error": "Missing coordinates"}), 400
    try:
        response = requests.post("http://127.0.0.1:5001/nearby_services", json={
            "latitude": lat,
            "longitude": lon,
            "radius": 2500
        })
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@socketio.on("ambulance_accept")
def handle_ambulance_accept(data):
    print("✅ Ambulance Accepted Emergency:")
    lat, lon = data['latitude'], data['longitude']
    severity = data['severity']
    counts = data['counts']
    image = data['image']

    ambulances = generate_dummy_ambulances(lat, lon, count=6)
    min_dist = float('inf')
    assigned = None
    for amb in ambulances:
        dist = haversine(lat, lon, amb['latitude'], amb['longitude'])
        if dist < min_dist:
            min_dist = dist
            assigned = amb

    distance_meters = round(min_dist)

    print(f"🚑 Assigned Dummy Ambulance: {assigned} ({distance_meters} meters away)")

    socketio.emit("ambulance_assigned", {
        "ambulance_lat": assigned['latitude'],
        "ambulance_lon": assigned['longitude'],
        "accident_lat": lat,
        "accident_lon": lon,
        "image": image,
        "severity": severity,
        "distance": distance_meters
    })


if __name__ == '__main__':
    socketio.run(app, port=5000, debug=True)
