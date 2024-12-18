const mediasoup = require('mediasoup');

let worker;

async function startSFU() {
  console.log('Starting SFU...');
  worker = await mediasoup.createWorker();
  // 추가 SFU 로직 설정
}

async function stopSFU() {
  console.log('Stopping SFU...');
  if (worker) {
    await worker.close();
  }
}

module.exports = { startSFU, stopSFU };
