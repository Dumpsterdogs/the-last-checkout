// The Last Checkout - game server.
// Serves the game page and relays multiplayer messages between players in the same room code.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const MAX_PER_ROOM = 8;
const PAGE = path.join(__dirname, 'public', 'index.html');

const server = http.createServer((req, res) => {
  if (req.url === '/health') { res.writeHead(200, { 'content-type': 'text/plain' }); res.end('ok'); return; }
  fs.readFile(PAGE, (err, html) => {
    if (err) { res.writeHead(500); res.end('Game file missing'); return; }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
    res.end(html);
  });
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 64 * 1024 });
const rooms = new Map(); // room name -> Map(peerId -> { ws, presence })
let counter = 0;

const send = (ws, msg) => { if (ws.readyState === 1) ws.send(JSON.stringify(msg)); };
const broadcast = (room, msg, except) => {
  const text = JSON.stringify(msg);
  for (const [id, p] of room) if (id !== except && p.ws.readyState === 1) p.ws.send(text);
};

wss.on('connection', (ws) => {
  const peer = Date.now().toString(36) + (counter++).toString(36) + Math.random().toString(36).slice(2, 6);
  let roomName = null;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (buf) => {
    let m;
    try { m = JSON.parse(buf); } catch { return; }
    if (!m || typeof m !== 'object') return;

    if (m.t === 'join') {
      if (roomName || typeof m.room !== 'string' || !/^[a-z0-9][a-z0-9_.-]{0,47}$/.test(m.room)) return;
      let room = rooms.get(m.room);
      if (!room) rooms.set(m.room, (room = new Map()));
      if (room.size >= MAX_PER_ROOM) { send(ws, { t: 'full' }); ws.close(); return; }
      roomName = m.room;
      room.set(peer, { ws, presence: {} });
      send(ws, { t: 'welcome', peer, peers: [...room].map(([id, p]) => ({ peer: id, presence: p.presence })) });
      broadcast(room, { t: 'peer', peer, presence: {} }, peer);
      return;
    }
    const room = roomName && rooms.get(roomName);
    if (!room) return;

    if (m.t === 'ev' && typeof m.topic === 'string' && m.topic.length < 48) {
      broadcast(room, { t: 'ev', topic: m.topic, data: m.data, peer }); // includes the sender, like the original room API
    } else if (m.t === 'pres' && m.p && typeof m.p === 'object') {
      const me = room.get(peer);
      if (me) { me.presence = m.p; broadcast(room, { t: 'peer', peer, presence: m.p }, peer); }
    }
  });

  ws.on('close', () => {
    const room = roomName && rooms.get(roomName);
    if (!room) return;
    room.delete(peer);
    broadcast(room, { t: 'left', peer });
    if (!room.size) rooms.delete(roomName);
  });
});

// Drop dead connections so players who closed their laptop leave the room.
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    ws.ping();
  }
}, 20000);

server.listen(PORT, () => console.log(`The Last Checkout is running on port ${PORT}`));
