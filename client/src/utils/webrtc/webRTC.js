const candidateQueue = []; // ICE Candidate를 임시 저장하는 큐

export const createPeerConnection = (safeSend, onTrack) => {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:localhost:3478" }],
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("Sending ICE candidate:", event.candidate);
      safeSend(
        JSON.stringify({ type: "candidate", candidate: event.candidate.toJSON() })
      );
    }
  };

  pc.ontrack = (event) => {
    console.log("Received remote track:", event.streams[0]);
    if (onTrack) onTrack(event.streams[0]);
  };

  return pc;
};

export const createOffer = async (peerConnection, safeSend) => {
  try {
    if (peerConnection.signalingState !== "stable") {
      console.warn("Cannot create offer: PeerConnection is not stable.");
      return;
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("Sending offer:", offer);

    safeSend(JSON.stringify({ type: "offer", offer: { type: offer.type, sdp: offer.sdp } }));
  } catch (error) {
    console.error("Error creating offer:", error);
  }
};

export const handleOffer = async (peerConnection, offer, safeSend) => {
  try {
    if (!peerConnection) {
      console.warn("PeerConnection is not initialized. Initializing...");
      peerConnection = createPeerConnection(safeSend, () => {});
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    console.log("Remote description set with offer.");

    // 수신된 ICE Candidate 처리
    while (candidateQueue.length > 0) {
      const candidate = candidateQueue.shift();
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("Queued ICE candidate added:", candidate);
    }

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log("Sending answer:", answer);

    safeSend(JSON.stringify({ type: "answer", answer: { type: answer.type, sdp: answer.sdp } }));
  } catch (error) {
    console.error("Error handling offer:", error);
  }
};

export const handleAnswer = async (peerConnection, answer) => {
  try {
    if (peerConnection.signalingState === "have-local-offer") {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("Remote description set with answer.");
    } else {
      console.warn("Cannot handle answer: Signaling state is not 'have-local-offer'.");
    }
  } catch (error) {
    console.error("Error handling answer:", error);
  }
};

export const handleCandidate = async (peerConnection, candidate) => {
  if (!peerConnection.remoteDescription) {
    console.warn("Remote description not set yet. Queueing ICE candidate.");
    candidateQueue.push(candidate);
  } else {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    console.log("ICE candidate added:", candidate);
  }
};
