import React from 'react';

const VideoPlayer = ({ filename }) => {
  return (
    <div>
      <h2>Video Streaming</h2>
      <video
        controls
        src={`http://localhost:8080/video/${filename}`}
        style={{ width: "100%", maxWidth: "600px" }}
      />
    </div>
  );
};

export default VideoPlayer;
