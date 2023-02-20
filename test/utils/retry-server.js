import express from 'express';

const app = express();
const counts = {};

app.get('/', function (req, res) {
  const idempotencyKey = req.headers['idempotency-key'];

  const count = counts[idempotencyKey] || 0;

  if (count >= 3) {
    res.status(200);
    res.send('ok');

    return;
  }

  counts[idempotencyKey] = count + 1;

  res.status(500);
  res.send('');
});

const ref = {
  server: null,
};

const mockServer = {
  init() {
    if (ref.server) {
      return;
    }

    ref.server = app.listen('3001');
  },

  close() {
    if (ref.server) {
      ref.server.close();
      ref.server = null;
    }
  },
};

export default mockServer;
