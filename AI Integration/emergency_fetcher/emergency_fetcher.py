# emergency_services/emergency_fetcher.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # ✅ This enables CORS for all routes

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Overpass query template
QUERY_TEMPLATE = """
[out:json];
(
  node["amenity"="hospital"](around:{radius},{lat},{lon});
  node["amenity"="police"](around:{radius},{lat},{lon});
  node["amenity"="fire_station"](around:{radius},{lat},{lon});
);
out body;
"""

@app.route("/", methods=["GET"])
def home():
    return "Emergency Service API is running.", 200

@app.route("/nearby_services", methods=["POST"])
def get_nearby_services():
    data = request.get_json()
    lat = data.get("latitude")
    lon = data.get("longitude")
    radius = data.get("radius", 2500)

    if not lat or not lon:
        return jsonify({"error": "Missing latitude or longitude"}), 400

    query = QUERY_TEMPLATE.format(radius=radius, lat=lat, lon=lon)
    response = requests.post(OVERPASS_URL, data={"data": query})
    results = response.json()

    services = []
    for element in results.get("elements", []):
        services.append({
            "name": element.get("tags", {}).get("name", "Unnamed"),
            "lat": element["lat"],
            "lon": element["lon"],
            "type": element.get("tags", {}).get("amenity", "unknown")
        })

    return jsonify(services)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
