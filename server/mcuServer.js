const kurento = require('kurento-client');

let kurentoClient;

async function startMCU() {
  console.log('Starting MCU...');
  kurentoClient = await kurento('ws://localhost:8888/kurento');
  // 추가 MCU 로직 설정
}

async function stopMCU() {
  console.log('Stopping MCU...');
  if (kurentoClient) {
    await kurentoClient.close();
  }
}

module.exports = { startMCU, stopMCU };
