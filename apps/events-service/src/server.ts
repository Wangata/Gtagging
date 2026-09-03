import http from 'node:http';
import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import { config } from './config.js';
import type { InputMessage } from './types.js';

// In-memory pairing relay: a TV registers with a pairing code, a mobile
// remote joins the same code, and button/trackpad input is relayed
// TV-ward. No persistence — matches "grabtv-events" in
// docs/GRABTV_ENVIRONMENTS_AZURE.md, deployed as its own container app.
interface PairingSession {
  code: string;
  tv?: WebSocket;
  remotes: Set<WebSocket>;
}

const sessions = new Map<string, PairingSession>();

function getOrCreateSession(code: string): PairingSession {
  let session = sessions.get(code);
  if (!session) {
    session = { code, remotes: new Set() };
    sessions.set(code, session);
  }
  return session;
}

function send(socket: WebSocket, message: Record<string, unknown>): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

const app = express();
app.get('/health', (_req, res) => {
  res.json({ ok: true, sessions: sessions.size });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (socket, req) => {
  const url = new URL(req.url ?? '', 'http://localhost');
  const role = url.searchParams.get('role');
  const code = url.searchParams.get('code')?.toUpperCase();

  if ((role !== 'tv' && role !== 'remote') || !code) {
    send(socket, { type: 'error', message: 'role (tv|remote) and code query params are required' });
    socket.close();
    return;
  }

  const session = getOrCreateSession(code);

  if (role === 'tv') {
    session.tv = socket;
    send(socket, { type: 'registered', code });
    console.log(`[events-service] TV registered for code ${code}`);

    // Upgrade any remotes that joined before the TV did.
    for (const remote of session.remotes) send(remote, { type: 'paired', code });
    if (session.remotes.size > 0) {
      send(socket, { type: 'remote_connected', remoteCount: session.remotes.size });
    }

    socket.on('close', () => {
      if (session.tv === socket) {
        session.tv = undefined;
        for (const remote of session.remotes) send(remote, { type: 'tv_disconnected' });
        console.log(`[events-service] TV disconnected for code ${code}`);
      }
    });
  } else {
    session.remotes.add(socket);
    if (session.tv) {
      send(socket, { type: 'paired', code });
      send(session.tv, { type: 'remote_connected', remoteCount: session.remotes.size });
    } else {
      send(socket, { type: 'pending', code });
    }
    console.log(
      `[events-service] Remote joined code ${code} (tv ${session.tv ? 'connected' : 'not yet connected'})`
    );

    socket.on('close', () => {
      session.remotes.delete(socket);
      if (session.tv) send(session.tv, { type: 'remote_connected', remoteCount: session.remotes.size });
    });
  }

  socket.on('message', (raw) => {
    if (role !== 'remote' || !session.tv) return;
    let msg: InputMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (msg.type === 'input') {
      send(session.tv, { type: 'input', input: msg.input });
    }
  });

  socket.on('error', () => {});
});

server.listen(config.port, () => {
  console.log(`[events-service] listening on :${config.port}`);
});
