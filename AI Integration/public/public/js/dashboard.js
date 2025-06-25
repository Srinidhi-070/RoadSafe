const socket = io();

socket.on("emergency_alert", (data) => {
    const list = document.getElementById("alerts");
    const item = document.createElement("li");
    item.innerText = `🚨 Alert Received! Location: (${data.latitude}, ${data.longitude})`;
    list.appendChild(item);
});
