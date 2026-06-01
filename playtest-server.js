const fs = require("fs");
const http = require("http");
const path = require("path");
const crypto = require("crypto");

const root = __dirname;
const port = Number(process.env.PORT || process.argv[2] || 8000);
const host = process.env.HOST || "0.0.0.0";
const sockets = new Map();
let hostSocket = null;
let latestSnapshot = null;
let latestAssignments = {};
let hostSessionId = "";
let snapshotPostCount = 0;
let latestIntent = null;
let latestSnapshotStats = null;
let latestPostStats = null;
let latestSnapshotId = "";
const eventLog = [];
const maxEventLogEntries = 100;
const largeSnapshotWarnBytes = 1024 * 1024;
const maxSnapshotBacklogBytes = 2 * 1024 * 1024;

const writableOneShotDungeons = new Map([
  ["one-shot-cat1-lantern-that-lies", "one-shot-cat1-lantern-that-lies.json"],
  ["one-shot-cat2-locked-door-wraith", "one-shot-cat2-locked-door-wraith.json"],
  ["one-shot-cat3-tempest-choir", "one-shot-cat3-tempest-choir.json"],
  ["one-shot-cat4-slagmaw-cooling-line", "one-shot-cat4-slagmaw-cooling-line.json"],
  ["one-shot-cat5-corpse-flower-regent", "one-shot-cat5-corpse-flower-regent.json"],
  ["one-shot-cat6-broken-gears", "one-shot-cat6-broken-gears.json"],
  ["one-shot-cat7-blade-queen", "one-shot-cat7-blade-queen.json"],
  ["one-shot-cat8-crushing-deep", "one-shot-cat8-crushing-deep.json"],
  ["one-shot-cat9-cinders-and-chains", "one-shot-cat9-cinders-and-chains.json"],
  ["one-shot-cat10-root-first-forest", "one-shot-cat10-root-first-forest.json"],
]);

const writableCampaignDungeons = new Map([
  ["barrow-crown", { folder: "campaigns/the-barrow-crown", count: 7 }],
  ["thornwood-pact", { folder: "campaigns/the-thornwood-pact", count: 8 }],
  ["embervein-first-claim", { folder: "campaigns/the-first-claim-of-embervein", count: 1 }],
  ["dwarven-smithy-ember-oath", { folder: "campaigns/the-dwarven-smithy-ember-oath", count: 8 }],
  ["expedition-mileposts", { folder: "campaigns/the-milepost-ledger", count: 4 }],
]);

const writableSettlementLayouts = new Map([
  ["travel-camp", "travel-camp.json"],
  ["inn-common-hall", "inn-common-hall.json"],
  ["inn-side-taproom", "inn-side-taproom.json"],
  ["inn-lodge-corners", "inn-lodge-corners.json"],
  ["inn-longhouse", "inn-longhouse.json"],
]);

const writableHelperRegistries = new Map([
  ["custom-items", "creator-custom-items.json"],
  ["recruits", "creator-recruits.json"],
]);

function nowIso() {
  return new Date().toISOString();
}

function logEvent(level, message, details = {}) {
  const entry = { at: nowIso(), level, message, ...details };
  eventLog.push(entry);
  while (eventLog.length > maxEventLogEntries) eventLog.shift();
  const detailText = Object.keys(details).length ? ` ${JSON.stringify(details)}` : "";
  const line = `[${entry.at}] ${level.toUpperCase()} ${message}${detailText}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function socketLabel(ws) {
  if (!ws) return "none";
  return `${ws.playtestRole || "unknown"}:${ws.playtestName || "unnamed"}:${ws.playtestId || "no-id"}`;
}

function noteSocketWrite(ws, payload, frame) {
  ws.playtestStats = ws.playtestStats || {};
  ws.playtestStats.sentMessages = (ws.playtestStats.sentMessages || 0) + 1;
  ws.playtestStats.sentBytes = (ws.playtestStats.sentBytes || 0) + frame.length;
  ws.playtestStats.lastSentAt = nowIso();
  ws.playtestStats.lastSentType = payload?.type ?? "unknown";
  ws.playtestStats.lastSentBytes = frame.length;
}

function noteSocketReceive(ws, message, raw) {
  ws.playtestStats = ws.playtestStats || {};
  ws.playtestStats.receivedMessages = (ws.playtestStats.receivedMessages || 0) + 1;
  ws.playtestStats.receivedBytes = (ws.playtestStats.receivedBytes || 0) + Buffer.byteLength(raw || "", "utf8");
  ws.playtestStats.lastReceivedAt = nowIso();
  ws.playtestStats.lastReceivedType = message?.type ?? "unknown";
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const clean = decoded === "/" ? "/index.html" : decoded;
  const resolved = path.resolve(root, `.${clean}`);
  return resolved.startsWith(root) ? resolved : null;
}

function writableSourcePath(payload) {
  if (payload?.kind === "one-shot") {
    const file = writableOneShotDungeons.get(payload.id);
    return file ? path.resolve(root, "One-Shot Dungeons", file) : null;
  }
  if (payload?.kind === "campaign") {
    const campaign = writableCampaignDungeons.get(payload.campaignId);
    const index = Math.floor(Number(payload.index));
    if (!campaign || index < 1 || index > campaign.count) return null;
    return path.resolve(root, campaign.folder, `Dungeon${index}.json`);
  }
  if (payload?.kind === "settlement-layout") {
    const file = writableSettlementLayouts.get(payload.id);
    return file ? path.resolve(root, "settlement-layouts", file) : null;
  }
  return null;
}

function writableHelperRegistryPath(kind) {
  const file = writableHelperRegistries.get(kind);
  return file ? path.resolve(root, file) : null;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-cache",
  });
  response.end(JSON.stringify(payload));
}

function send(ws, payload) {
  if (ws.destroyed || !ws.writable) return;
  const frame = encodeFrame(JSON.stringify(payload));
  try {
    const wroteImmediately = ws.write(frame);
    noteSocketWrite(ws, payload, frame);
    if (!wroteImmediately) {
      ws.playtestStats.backpressureCount = (ws.playtestStats.backpressureCount || 0) + 1;
      ws.playtestStats.lastBackpressureAt = nowIso();
      logEvent("warn", "Socket write backpressure", {
        socket: socketLabel(ws),
        type: payload?.type ?? "unknown",
        bytes: frame.length,
        bufferSize: ws.bufferSize,
      });
    }
  } catch (error) {
    logEvent("warn", "Playtest socket send failed", {
      socket: socketLabel(ws),
      code: error.code,
      error: error.message,
    });
  }
}

function broadcast(payload, except = null) {
  sockets.forEach((client) => {
    if (payload?.type === "snapshot" && client.bufferSize > maxSnapshotBacklogBytes) {
      client.playtestStats = client.playtestStats || {};
      client.playtestStats.droppedSnapshots = (client.playtestStats.droppedSnapshots || 0) + 1;
      client.playtestStats.lastDroppedSnapshotAt = nowIso();
      logEvent("warn", "Dropped snapshot for backlogged socket", {
        socket: socketLabel(client),
        bufferSize: client.bufferSize,
        droppedSnapshots: client.playtestStats.droppedSnapshots,
      });
      return;
    }
    if (client !== except) send(client, payload);
  });
}

function peersPayload() {
  return {
    type: "peers",
    peers: Array.from(sockets.values()).map((client) => ({
      id: client.playtestId,
      role: client.playtestRole,
      name: client.playtestName,
    })),
    hostId: hostSocket?.playtestId ?? null,
  };
}

function broadcastPeers() {
  broadcast(peersPayload());
}

function acceptHostSnapshot(message, options = {}) {
  if (!message || message.hostSessionId !== hostSessionId) return false;
  const snapshotId = message.snapshotId || "";
  const duplicate = snapshotId && snapshotId === latestSnapshotId;
  const serialized = JSON.stringify(message);
  latestSnapshotStats = {
    at: nowIso(),
    source: options.source ?? "unknown",
    snapshotId,
    duplicate,
    bytes: Buffer.byteLength(serialized, "utf8"),
    mode: message.summary?.mode ?? message.state?.mode ?? null,
    roomName: message.summary?.roomName ?? message.state?.room?.name ?? null,
    heroCount: message.summary?.heroIds?.length ?? message.state?.party?.heroIds?.length ?? null,
    socketCount: sockets.size,
  };
  if (latestSnapshotStats.bytes > largeSnapshotWarnBytes) {
    logEvent("warn", "Large snapshot accepted", latestSnapshotStats);
  }
  latestSnapshot = message;
  if (snapshotId) latestSnapshotId = snapshotId;
  if (!duplicate) broadcast(message, hostSocket);
  return true;
}

function encodeFrame(data) {
  const payload = Buffer.from(data);
  const length = payload.length;
  let header;
  if (length < 126) {
    header = Buffer.from([0x81, length]);
  } else if (length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }
  return Buffer.concat([header, payload]);
}

function decodeFrames(buffer, socket) {
  const messages = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const first = buffer[offset];
    const second = buffer[offset + 1];
    const finalFrame = Boolean(first & 0x80);
    const opcode = first & 0x0f;
    let length = second & 0x7f;
    let cursor = offset + 2;
    if (length === 126) {
      if (cursor + 2 > buffer.length) break;
      length = buffer.readUInt16BE(cursor);
      cursor += 2;
    } else if (length === 127) {
      if (cursor + 8 > buffer.length) break;
      length = Number(buffer.readBigUInt64BE(cursor));
      cursor += 8;
    }
    const masked = Boolean(second & 0x80);
    const mask = masked ? buffer.subarray(cursor, cursor + 4) : null;
    if (masked) cursor += 4;
    if (cursor + length > buffer.length) break;
    const payload = Buffer.from(buffer.subarray(cursor, cursor + length));
    if (masked) {
      for (let index = 0; index < payload.length; index += 1) {
        payload[index] ^= mask[index % 4];
      }
    }
    if (opcode === 0x8) return { messages, remaining: Buffer.alloc(0), closed: true };
    if (opcode === 0x9) {
      sendControlFrame(socket, 0x0a, payload);
    } else if (opcode === 0x1 || opcode === 0x0) {
      if (opcode === 0x1 && finalFrame) {
        messages.push(payload.toString("utf8"));
      } else {
        socket.fragmentedMessage = Buffer.concat([socket.fragmentedMessage ?? Buffer.alloc(0), payload]);
        if (finalFrame) {
          messages.push(socket.fragmentedMessage.toString("utf8"));
          socket.fragmentedMessage = Buffer.alloc(0);
        }
      }
    }
    offset = cursor + length;
  }
  return { messages, remaining: buffer.subarray(offset), closed: false };
}

function sendControlFrame(socket, opcode, payload = Buffer.alloc(0)) {
  if (socket.destroyed || !socket.writable) return;
  const length = payload.length;
  if (length > 125) return;
  socket.write(Buffer.concat([Buffer.from([0x80 | opcode, length]), payload]));
}

function handleMessage(ws, raw) {
  let message;
  try {
    message = JSON.parse(raw);
  } catch {
    logEvent("warn", "Ignored invalid websocket JSON", { socket: socketLabel(ws), bytes: Buffer.byteLength(raw || "", "utf8") });
    return;
  }
  noteSocketReceive(ws, message, raw);

  if (message.type === "hello") {
    ws.playtestRole = message.role === "host" ? "host" : "guest";
    ws.playtestName = String(message.name || ws.playtestRole).slice(0, 32);
    logEvent("info", "Client hello", {
      socket: socketLabel(ws),
      remote: `${ws.remoteAddress}:${ws.remotePort}`,
      userAgent: ws.playtestUserAgent,
    });
    if (ws.playtestRole === "host") {
      if (hostSocket && hostSocket !== ws) {
        logEvent("warn", "Replacing existing host socket", { oldHost: socketLabel(hostSocket), newHost: socketLabel(ws) });
        send(hostSocket, { type: "host-replaced" });
        hostSocket.end();
      }
      hostSocket = ws;
      hostSessionId = message.sessionId || crypto.randomBytes(6).toString("hex");
      ws.hostSessionId = hostSessionId;
      latestSnapshot = null;
      latestAssignments = {};
    }
    send(ws, { type: "welcome", id: ws.playtestId, hostSessionId });
    broadcastPeers();
    if (Object.keys(latestAssignments).length) send(ws, { type: "assign", assignments: latestAssignments });
    if (latestSnapshot && ws.playtestRole !== "host") send(ws, latestSnapshot);
    return;
  }

  if (message.type === "snapshot" && ws === hostSocket && (!message.hostSessionId || message.hostSessionId === hostSessionId)) {
    acceptHostSnapshot({ ...message, hostSessionId }, { source: "websocket" });
    return;
  }

  if (message.type === "assign" && ws === hostSocket && (!message.hostSessionId || message.hostSessionId === hostSessionId)) {
    latestAssignments = message.assignments ?? {};
    broadcast(message, ws);
    return;
  }

  if (message.type === "intent" && hostSocket && ws !== hostSocket) {
    latestIntent = {
      at: new Date().toISOString(),
      from: ws.playtestId,
      fromName: ws.playtestName,
      kind: message.payload?.kind ?? null,
      heroId: message.payload?.heroId ?? null,
      targetId: message.payload?.targetId ?? null,
      position: message.payload?.position ?? null,
      relayedToHost: Boolean(hostSocket),
    };
    logEvent("info", "Guest intent relayed", latestIntent);
    send(hostSocket, { ...message, peerId: ws.playtestId, peerName: ws.playtestName });
    return;
  }

  if (message.type === "reactionPrompt" && ws === hostSocket) {
    const target = Array.from(sockets.values()).find((client) => client.playtestId === message.targetPeerId);
    if (target) send(target, message);
    return;
  }

  if (message.type === "spellTargetResult" && ws === hostSocket) {
    latestIntent = {
      ...(latestIntent ?? {}),
      resultAt: new Date().toISOString(),
      resultType: message.type,
      targetPeerId: message.targetPeerId,
      resolved: Boolean(message.resolved),
    };
    const target = Array.from(sockets.values()).find((client) => client.playtestId === message.targetPeerId);
    if (target) send(target, message);
    return;
  }

  if (message.type === "reactionResponse" && hostSocket && ws !== hostSocket) {
    send(hostSocket, { ...message, peerId: ws.playtestId, peerName: ws.playtestName });
  }
}

const server = http.createServer((request, response) => {
  if (request.url?.startsWith("/playtest-status")) {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-cache",
    });
    response.end(
      JSON.stringify(
        {
          hostId: hostSocket?.playtestId ?? null,
          hostSessionId,
          socketCount: sockets.size,
          sockets: Array.from(sockets.values()).map((client) => ({
            id: client.playtestId,
            role: client.playtestRole,
            name: client.playtestName,
            remote: client.playtestStats?.remote,
            bufferSize: client.bufferSize,
            destroyed: client.destroyed,
            writable: client.writable,
            stats: client.playtestStats ?? {},
          })),
          latestSummary: latestSnapshot?.summary ?? null,
          latestGameHasStarted: latestSnapshot?.gameHasStarted ?? null,
          latestSnapshotStats,
          latestPostStats,
          latestIntent,
          snapshotPostCount,
          eventLog: eventLog.slice(-30),
        },
        null,
        2,
      ),
    );
    return;
  }

  if (request.method === "POST" && request.url?.startsWith("/playtest-snapshot")) {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) request.destroy();
    });
    request.on("end", () => {
      try {
        const message = JSON.parse(body);
        const accepted = acceptHostSnapshot(message, { source: "post" });
        if (accepted) snapshotPostCount += 1;
        latestPostStats = {
          at: nowIso(),
          accepted,
          bytes: Buffer.byteLength(body, "utf8"),
          snapshotPostCount,
        };
        response.writeHead(accepted ? 200 : 409, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-cache",
        });
        response.end(JSON.stringify({ accepted, latestSummary: latestSnapshot?.summary ?? null }));
      } catch (error) {
        logEvent("warn", "Invalid snapshot POST JSON", { bytes: Buffer.byteLength(body, "utf8"), error: error.message });
        response.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ accepted: false, error: "Invalid JSON" }));
      }
    });
    return;
  }

  if (request.method === "POST" && request.url?.startsWith("/save-source-dungeon")) {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) request.destroy();
    });
    request.on("end", () => {
      try {
        const payload = JSON.parse(body);
        const filePath = writableSourcePath(payload);
        if (!filePath || !filePath.startsWith(root)) {
          sendJson(response, 403, { saved: false, error: "Source dungeon is not writable." });
          return;
        }
        if (!payload.template || typeof payload.template !== "object" || Array.isArray(payload.template)) {
          sendJson(response, 400, { saved: false, error: "Missing template object." });
          return;
        }
        const json = `${JSON.stringify(payload.template, null, 2)}\n`;
        fs.mkdir(path.dirname(filePath), { recursive: true }, (mkdirError) => {
          if (mkdirError) {
            logEvent("error", "Failed to prepare source dungeon directory", { filePath, error: mkdirError.message });
            sendJson(response, 500, { saved: false, error: "Write failed." });
            return;
          }
          fs.writeFile(filePath, json, "utf8", (error) => {
          if (error) {
            logEvent("error", "Failed to save source dungeon", { filePath, error: error.message });
            sendJson(response, 500, { saved: false, error: "Write failed." });
            return;
          }
          logEvent("info", "Saved source dungeon", { filePath: path.relative(root, filePath) });
          sendJson(response, 200, { saved: true, file: path.relative(root, filePath).replace(/\\/g, "/") });
          });
        });
      } catch (error) {
        logEvent("warn", "Invalid source dungeon save JSON", { bytes: Buffer.byteLength(body, "utf8"), error: error.message });
        sendJson(response, 400, { saved: false, error: "Invalid JSON" });
      }
    });
    return;
  }

  if (request.method === "POST" && request.url?.startsWith("/save-helper-registry")) {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20 * 1024 * 1024) request.destroy();
    });
    request.on("end", () => {
      try {
        const payload = JSON.parse(body);
        const filePath = writableHelperRegistryPath(payload?.kind);
        if (!filePath || !filePath.startsWith(root)) {
          sendJson(response, 403, { saved: false, error: "Registry is not writable." });
          return;
        }
        if (!Array.isArray(payload.entries)) {
          sendJson(response, 400, { saved: false, error: "Missing entries array." });
          return;
        }
        const json = `${JSON.stringify(payload.entries, null, 2)}\n`;
        fs.writeFile(filePath, json, "utf8", (error) => {
          if (error) {
            logEvent("error", "Failed to save helper registry", { filePath, error: error.message });
            sendJson(response, 500, { saved: false, error: "Write failed." });
            return;
          }
          logEvent("info", "Saved helper registry", { kind: payload.kind, filePath: path.relative(root, filePath) });
          sendJson(response, 200, { saved: true, file: path.relative(root, filePath).replace(/\\/g, "/") });
        });
      } catch (error) {
        logEvent("warn", "Invalid helper registry save JSON", { bytes: Buffer.byteLength(body, "utf8"), error: error.message });
        sendJson(response, 400, { saved: false, error: "Invalid JSON" });
      }
    });
    return;
  }

  const filePath = safePath(request.url);
  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    const stream = fs.createReadStream(filePath);
    stream.on("error", () => {
      if (!response.headersSent) response.writeHead(500);
      response.end("Read error");
    });
    response.on("error", () => stream.destroy());
    response.on("close", () => stream.destroy());
    stream.pipe(response);
  });
});

server.on("clientError", (_error, socket) => {
  logEvent("warn", "HTTP client error", {
    code: _error.code,
    error: _error.message,
    remote: `${socket.remoteAddress}:${socket.remotePort}`,
  });
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Close the other server or start this one with a different port.`);
    process.exitCode = 1;
    return;
  }
  console.error("Playtest server error:", error);
});

server.on("upgrade", (request, socket) => {
  if (request.headers.upgrade?.toLowerCase() !== "websocket") {
    socket.destroy();
    return;
  }
  const key = request.headers["sec-websocket-key"];
  const accept = crypto.createHash("sha1").update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest("base64");
  socket.write(
    [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${accept}`,
      "",
      "",
    ].join("\r\n"),
  );
  socket.playtestId = crypto.randomBytes(4).toString("hex");
  socket.playtestRole = "guest";
  socket.playtestName = "guest";
  socket.playtestUserAgent = request.headers["user-agent"] || "";
  socket.frameBuffer = Buffer.alloc(0);
  socket.fragmentedMessage = Buffer.alloc(0);
  socket.playtestStats = {
    connectedAt: nowIso(),
    remote: `${socket.remoteAddress}:${socket.remotePort}`,
    sentMessages: 0,
    sentBytes: 0,
    receivedMessages: 0,
    receivedBytes: 0,
    backpressureCount: 0,
  };
  sockets.set(socket.playtestId, socket);
  logEvent("info", "WebSocket connected", {
    socket: socketLabel(socket),
    remote: socket.playtestStats.remote,
    userAgent: socket.playtestUserAgent,
  });
  socket.on("data", (chunk) => {
    socket.frameBuffer = Buffer.concat([socket.frameBuffer, chunk]);
    const decoded = decodeFrames(socket.frameBuffer, socket);
    socket.frameBuffer = decoded.remaining;
    decoded.messages.forEach((message) => handleMessage(socket, message));
    if (decoded.closed) socket.end();
  });
  socket.on("drain", () => {
    logEvent("info", "Socket drain", { socket: socketLabel(socket), bufferSize: socket.bufferSize });
  });
  socket.on("close", (hadError) => {
    logEvent(hadError ? "warn" : "info", "WebSocket closed", {
      socket: socketLabel(socket),
      hadError,
      stats: socket.playtestStats,
    });
    sockets.delete(socket.playtestId);
    if (hostSocket === socket) {
      hostSocket = null;
      hostSessionId = "";
      latestSnapshot = null;
      latestAssignments = {};
    }
    broadcastPeers();
  });
  socket.on("error", (error) => {
    socket.playtestStats.lastErrorAt = nowIso();
    socket.playtestStats.lastErrorCode = error.code;
    socket.playtestStats.lastErrorMessage = error.message;
    logEvent("warn", "Playtest socket error", {
      socket: socketLabel(socket),
      code: error.code,
      error: error.message,
      bufferSize: socket.bufferSize,
      stats: socket.playtestStats,
    });
  });
});

server.listen(port, host, () => {
  console.log(`Depthbound playtest server running at http://${host}:${port}/`);
  console.log("Host URL:  http://localhost:" + port + "/index.html?playtest=host");
  console.log("Guest URL: http://YOUR_HAMACHI_IP:" + port + "/index.html?playtest=guest");
});
