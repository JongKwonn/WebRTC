const WebSocket = require("ws");
const { startSFU, stopSFU } = require("./sfuServer");
const { startMCU, stopMCU } = require("./mcuServer");

const WSPORT = 8081;
let currentMode = "SFU";
let connectedClients = 0;
const clients = new Set();

const wss = new WebSocket.Server({ port: WSPORT });

wss.on("connection", (ws) => {
  ws.clientId = generateUniqueId();
  connectedClients++;
  clients.add(ws);
  console.log(`Connected clients: ${connectedClients}`);

  // SFU/MCU 모드 스위칭 로직
  if (connectedClients > 5 && currentMode === "SFU") {
    console.log("Switching to MCU mode...");
    stopSFU();
    startMCU();
    currentMode = "MCU";
  } else if (connectedClients <= 5 && currentMode === "MCU") {
    console.log("Switching back to SFU mode...");
    stopMCU();
    startSFU();
    currentMode = "SFU";
  }

  ws.on("message", (message) => {
    console.log(`Received WebSocket message: ${message}`);
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  

  ws.on("close", () => {
    connectedClients--;
    clients.delete(ws);
    console.log(`Connected clients: ${connectedClients}`);
  });
});

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15);
}
