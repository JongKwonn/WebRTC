import React, { useEffect, useRef, useState } from "react";
import VideoPlayer from "./VideoPlayer";
import VideoEditor from "./VideoEditor";
import {
  initializeWebSocket,
  initializePeerConnection,
  createOffer,
  handleOffer,
  handleAnswer,
  handleCandidate,
} from "../utils";

const App = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const webSocketRef = useRef(null);
  const [brightness, setBrightness] = useState(1);
  const [callStarted, setCallStarted] = useState(false);
  const [isOfferSent, setIsOfferSent] = useState(false); // Offer 충돌 방지 상태

  useEffect(() => {
    const connectWebSocket = () => {
      const { ws, safeSend } = initializeWebSocket("ws://localhost:8081", {
        offer: async (data) => {
          console.log("Received offer", data);

          if (!peerConnectionRef.current) {
            initializeConnection();
          }

          await handleOffer(peerConnectionRef.current, data.offer, safeSend);
        },
        answer: (data) => {
          console.log("Received answer", data);
          handleAnswer(peerConnectionRef.current, data.answer);
        },
        candidate: (data) => {
          console.log("Received ICE candidate", data);
          handleCandidate(peerConnectionRef.current, data.candidate);
        },
      });

      webSocketRef.current = { ws, safeSend };
    };

    connectWebSocket();
  }, []);

  const initializeConnection = () => {
    if (peerConnectionRef.current) {
      console.warn("PeerConnection is already initialized.");
      return;
    }

    const peerConnection = initializePeerConnection(
      webSocketRef.current?.safeSend,
      (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    );

    peerConnectionRef.current = peerConnection;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) =>
          peerConnection.addTrack(track, stream)
        );
      });
  };

  const startCall = () => {
    if (callStarted || peerConnectionRef.current) {
      console.warn("Call has already been started or PeerConnection is already initialized.");
      return;
    }

    setCallStarted(true);
    initializeConnection();

    // Offer를 한 번만 보내도록 설정
    if (!isOfferSent) {
      setTimeout(() => {
        const { safeSend } = webSocketRef.current;
        createOffer(peerConnectionRef.current, safeSend);
        setIsOfferSent(true); // Offer 전송 플래그 설정
      }, 500);
    }
  };

  return (
    <div>
      <h1>WebRTC Video Chat and Streaming</h1>
      <VideoPlayer filename="example.mp4" />
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "45%", marginRight: "5%" }}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: "45%", filter: `brightness(${brightness})` }}
      />
      <button onClick={startCall}>Start Call</button>
      <VideoEditor
        brightness={brightness}
        setBrightness={setBrightness}
        webSocket={webSocketRef.current?.safeSend}
      />
    </div>
  );
};

export default App;
