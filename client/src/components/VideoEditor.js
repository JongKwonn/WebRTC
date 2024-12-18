import React from 'react';

const VideoEditor = ({ brightness, setBrightness, webSocket }) => {
  const handleBrightnessChange = (e) => {
    const newBrightness = e.target.value;
    setBrightness(newBrightness);
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: 'edit', changes: { brightness: newBrightness } }));
    }
  };

  return (
    <div>
      <h2>Video Editor</h2>
      <label>Brightness:</label>
      <input
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value={brightness}
        onChange={handleBrightnessChange}
      />
    </div>
  );
};

export default VideoEditor;
