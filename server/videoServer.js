const express = require('express');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

const app = express();
const PORT = 8080;

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/videoDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;

let gfs;
connection.once('open', () => {
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection('videos'); // 비디오 파일 컬렉션 지정
  console.log('Connected to MongoDB and GridFS initialized');
});

// 비디오 스트리밍 라우트
app.get('/video/:filename', async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    if (!file) return res.status(404).send('File not found');

    const range = req.headers.range;
    if (!range) return res.status(400).send('Requires Range header');

    const videoSize = file.length;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + 1 * 1e6 - 1, videoSize - 1);

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': 'video/mp4',
    });

    const readStream = gfs.createReadStream({ filename: file.filename, range: { start, end } });
    readStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while streaming the video');
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Video server is running on http://localhost:${PORT}`);
});
