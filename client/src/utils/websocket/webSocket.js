import { v4 as uuidv4 } from "uuid";
const clientId = uuidv4(); // 각 클라이언트 고유 ID

export const initializeWebSocket = (url, handlers) => {
  const ws = new WebSocket(url);

  ws.onopen = () => console.log("WebSocket connected");
  ws.onclose = () => console.log("WebSocket disconnected");
  ws.onerror = (error) => console.error("WebSocket error:", error);

  ws.onmessage = async (message) => {
    let data;

    // Blob 처리
    if (message.data instanceof Blob) {
      const text = await message.data.text(); // Blob을 텍스트로 변환
      data = JSON.parse(text);
    } else {
      data = JSON.parse(message.data);
    }

    const { type, senderId, ...payload } = data;

    // 자기 자신이 보낸 메시지는 무시
    if (senderId === clientId) return;

    // Offer를 받으면 자동으로 Answer를 보냄
    if (type === "offer") {
      console.log("Received offer. Initializing connection...");
      handlers.offer(payload);
    }

    if (handlers[type]) handlers[type](payload);
  };

  const safeSend = (message) => {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        const messageWithId = { ...JSON.parse(message), senderId: clientId };
        ws.send(JSON.stringify(messageWithId));
      } else {
        console.warn("WebSocket is not open. Message not sent:", message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return { ws, safeSend };
};
