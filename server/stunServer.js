const dgram = require('dgram');

// STUN 속성
const MAGIC_COOKIE = 0x2112A442;

const server = dgram.createSocket('udp4');

// 메시지 수신 이벤트
server.on('message', (msg, rinfo) => {
  console.log(`STUN 메시지를 수신했습니다: ${rinfo.address}:${rinfo.port}`);
  console.log("메시지 내용:", msg);
  const messageType = msg.readUInt16BE(0); // 메시지 타입 읽기
  const magicCookie = msg.readUInt32BE(4); // 매직 쿠키 확인

  // STUN 메시지 유효성 검증
  if (magicCookie !== MAGIC_COOKIE) {
    console.error("유효하지 않은 STUN 메시지입니다.");
    return;
  }

  // STUN 응답 생성
  const responseType = 0x0101; // Binding Success Response (성공 응답)
  const transactionId = msg.slice(8, 20); // 요청에서 Transaction ID 추출
  const response = Buffer.alloc(32); // 응답 버퍼 생성

  // 응답 타입 및 길이 설정
  response.writeUInt16BE(responseType, 0); // 응답 타입 설정
  response.writeUInt16BE(0, 2); // 속성이 없으므로 길이는 0
  response.writeUInt32BE(MAGIC_COOKIE, 4); // 매직 쿠키 설정

  // Transaction ID 복사
  transactionId.copy(response, 8);

  // XOR-MAPPED-ADDRESS 속성 추가
  const family = 0x01; // IPv4 주소 패밀리
  const port = rinfo.port ^ (MAGIC_COOKIE >> 16); // 포트 XOR 처리
  const address = rinfo.address.split('.').map((octet, index) => {
    return parseInt(octet) ^ ((MAGIC_COOKIE >> (8 * (3 - index))) & 0xFF); // IP 주소 각 옥텟 XOR 처리
  });

  response.writeUInt16BE(0x0020, 20); // XOR-MAPPED-ADDRESS 속성 타입
  response.writeUInt16BE(8, 22); // 속성 길이
  response.writeUInt8(0, 24); // 예약된 필드 (0으로 설정)
  response.writeUInt8(family, 25); // 주소 패밀리 (IPv4)
  response.writeUInt16BE(port, 26); // XOR된 포트 값
  address.forEach((octet, index) => response.writeUInt8(octet, 28 + index)); // XOR된 주소 값 설정

  // 응답 전송
  server.send(response, 0, response.length, rinfo.port, rinfo.address, (err) => {
    if (err) console.error(err);
    console.log(`응답을 전송했습니다: ${rinfo.address}:${rinfo.port}`);
  });
});

// 서버 시작 시 이벤트
server.on('listening', () => {
  const address = server.address();
  console.log(`STUN 서버가 시작되었습니다: ${address.address}:${address.port}`);
});

// STUN 서버 3478 포트에 바인딩
server.bind(3478);
