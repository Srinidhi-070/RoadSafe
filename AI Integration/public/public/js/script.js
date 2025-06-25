//const socket = io();
const markers = {}; // Store all user markers by socket ID
const serviceMarkers = []; // Store emergency service markers
let hasCenteredMap = false;
let routeLine = null; // for ambulance route
let userOwnMarker = null; // 🆕 Store own user marker

// Initialize Leaflet map
const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map);

// Define separate icons for each emergency service
const icons = {
  hospital: L.icon({
    iconUrl: "/public/icons/hospital.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  police: L.icon({
    iconUrl: "/public/icons/police.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  fire_station: L.icon({
    iconUrl: "/public/icons/fire_station.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  ambulance: L.icon({
    iconUrl: "/public/icons/ambulance-icon.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  accident: L.icon({
    iconUrl: "/public/icons/alert.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),
  user: L.icon({ // 🆕 User icon
    iconUrl: "/public/icons/user.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
};

// Default icon (fallback)
const defaultIcon = L.icon({
  iconUrl: "/public/icons/pin.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Function to fetch and plot emergency services
function fetchEmergencyServices(lat, lon, radius = 2500) {
  fetch("http://127.0.0.1:5001/nearby_services", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ latitude: lat, longitude: lon, radius }),
  })
    .then((res) => res.json())
    .then((services) => {
      // Remove old service markers
      serviceMarkers.forEach(marker => map.removeLayer(marker));
      serviceMarkers.length = 0;

      // Add new markers with specific icons
      services.forEach(service => {
        const icon = icons[service.type] || defaultIcon;
        const marker = L.marker([service.lat, service.lon], { icon }).addTo(map);
        marker.bindPopup(`<b>${service.name}</b><br>${service.type}`);
        serviceMarkers.push(marker);
      });
    })
    .catch(err => console.error("Error fetching services:", err));
}

// Track user location and send to socket
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      if (!hasCenteredMap) {
        map.setView([latitude, longitude], 16);
        hasCenteredMap = true;

        // 🆕 Add user marker with user.png icon on first load
        userOwnMarker = L.marker([latitude, longitude], {
          icon: icons.user
        }).addTo(map).bindPopup("You are here");

        // Fetch and plot emergency services once on first load
        fetchEmergencyServices(latitude, longitude);
      }

      socket.emit("send-location", { latitude, longitude });
    },
    (error) => console.error(error),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
}

// Update or create user location markers
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude], {
      icon: L.icon({
        iconUrl: "/public/icons/user.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
    }).addTo(map);
    markers[id].bindPopup("User Location");
  }
});

// Remove markers on disconnect
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

socket.on("emergency_alert", (data) => {
    // Display markers for dummy ambulances
    if (data.ambulances && Array.isArray(data.ambulances)) {
        data.ambulances.forEach((amb, index) => {
            L.marker([amb.latitude, amb.longitude], {
                icon: L.icon({
                    iconUrl: '/public/icons/ambulance-icon.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                })
            }).addTo(map)
              .bindPopup(`🚑 Dummy Ambulance ${index + 1}`);
        });
    }

    // Existing logic to show alert location, image, severity, etc.
});

// 🆕 Handle ambulance assignment and draw route
socket.on("ambulance_assigned", (data) => {
  const {
    ambulance_lat,
    ambulance_lon,
    accident_lat,
    accident_lon,
    severity,
    distance,
  } = data;

  const from = [ambulance_lat, ambulance_lon];
  const to = [accident_lat, accident_lon];

  // Remove existing route if present
  if (routeLine) {
    map.removeLayer(routeLine);
  }

  // Remove user icon marker and replace with alert
  if (userOwnMarker) {
    map.removeLayer(userOwnMarker); // 🆕 remove user.png
    userOwnMarker = null;
  }

  // Draw route
  routeLine = L.polyline([from, to], {
    color: "red",
    weight: 5,
    dashArray: "10, 10",
    opacity: 0.8,
  }).addTo(map);

  // Fit map to route
  map.fitBounds(routeLine.getBounds(), { padding: [80, 80] });

  // Add ambulance marker
  L.marker(from, { icon: icons.ambulance })
    .addTo(map)
    .bindPopup("🚑 Assigned Ambulance")
    .openPopup();

  // Add accident marker with alert icon
  L.marker(to, { icon: icons.accident })
    .addTo(map)
    .bindPopup("📍 Accident Site");

  // 🆕 Display info
  const infoHTML = `
    🚑 Ambulance Assigned!<br>
    Ambulance Location: [${ambulance_lat.toFixed(4)}, ${ambulance_lon.toFixed(4)}]<br>
    Accident Location: [${accident_lat.toFixed(4)}, ${accident_lon.toFixed(4)}]<br>
    Severity: ${severity}<br>
    Distance: ${distance} meters
  `;
  const infoDiv = document.getElementById("assigned-info");
  if (infoDiv) infoDiv.innerHTML = infoHTML;
});
