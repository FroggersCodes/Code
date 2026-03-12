import type { Server, Socket } from "socket.io";
import type { FullChallenge } from "../lib/challenges";
import type { ChallengeData } from "../types";
import { getRandomChallenge } from "../lib/challenges";
import { updateRatings, getRankFromElo } from "../lib/elo";
import { validateSubmission } from "./validation";
import {
  addToQueue,
  removeFromQueue,
  tryMatch,
  getQueuedPlayers,
  type QueuedPlayer,
} from "./matchmaking";

function broadcastQueueStatus(io: Server): void {
  const players = getQueuedPlayers();
  const size = players.length;
  players.forEach((p, idx) => {
    io.to(p.socketId).emit("queue:status", { position: idx, queueSize: size });
  });
}

interface GameRoom {
  id: string;
  players: { socketId: string; username: string; elo: number; rank: string }[];
  challenge: FullChallenge;
  startTime: number;
  timeLimit: number;
  solves: Map<string, number>; // socketId -> solve time in ms
  timedOut: Set<string>;
  ended: boolean;
  readyPlayers: Set<string>;
}

const rooms = new Map<string, GameRoom>();
const playerRooms = new Map<string, string>(); // socketId -> roomId

// ─── Practice rooms ────────────────────────────────────────────────────────
interface PracticeRoom {
  id: string;
  code: string;
  host: { socketId: string; username: string; elo: number; rank: string; title?: string | null };
  guest: { socketId: string; username: string; elo: number; rank: string; title?: string | null } | null;
  challenge: FullChallenge | null;
  timeLimit: number; // seconds
  language: string;
  difficulty: number | null;
  hostTime: number | null;
  guestTime: number | null;
  startTime: number;
  started: boolean;
  ended: boolean;
}

const practiceRooms = new Map<string, PracticeRoom>();
const practiceRoomsByCode = new Map<string, string>(); // code -> roomId
const playerPracticeRooms = new Map<string, string>(); // socketId -> roomId

function generatePracticeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return practiceRoomsByCode.has(code) ? generatePracticeCode() : code;
}

function getChallengeForPractice(language: string, difficulty: number | null): FullChallenge {
  const { CHALLENGES } = require("../lib/challenges");
  let pool = CHALLENGES.filter((c: FullChallenge) => c.language === language);
  if (difficulty !== null) pool = pool.filter((c: FullChallenge) => c.difficulty === difficulty);
  if (pool.length === 0) pool = CHALLENGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function endPracticeGame(room: PracticeRoom, io: Server): void {
  if (room.ended) return;
  room.ended = true;

  io.to(room.host.socketId).emit("practice:end", {
    playerTime: room.hostTime,
    opponentTime: room.guestTime,
  });
  if (room.guest) {
    io.to(room.guest.socketId).emit("practice:end", {
      playerTime: room.guestTime,
      opponentTime: room.hostTime,
    });
  }

  playerPracticeRooms.delete(room.host.socketId);
  if (room.guest) playerPracticeRooms.delete(room.guest.socketId);
  practiceRoomsByCode.delete(room.code);
  practiceRooms.delete(room.id);
}

// Leaderboard: username -> stats
interface LeaderboardEntry {
  username: string;
  elo: number;
  rank: string;
  wins: number;
  losses: number;
  draws: number;
}
const leaderboard = new Map<string, LeaderboardEntry>();

// ─── Admin / messaging ────────────────────────────────────────────────────────
const ADMIN_PASSPHRASE = "FroggersSmiles0407";

// one-time title grant codes
const grantCodes = new Map<string, { titleId: string; used: boolean }>();

// pending messages: username.lower() → messages
interface AdminMessage { id: string; text: string; createdAt: string; }
const pendingMessages = new Map<string, AdminMessage[]>();

// live socket routing: socketId ↔ username.lower()
const socketToUser = new Map<string, string>();
const userToSocket = new Map<string, string>();

let matchmakingInterval: ReturnType<typeof setInterval> | null = null;

function generateRoomId(): string {
  return `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function stripFixedCode(challenge: FullChallenge): ChallengeData {
  const { fixedCode, ...data } = challenge;
  return data;
}

function endGame(room: GameRoom, io: Server): void {
  if (room.ended) return;
  room.ended = true;

  const [p1, p2] = room.players;
  const p1Solved = room.solves.has(p1.socketId);
  const p2Solved = room.solves.has(p2.socketId);
  const p1Time = room.solves.get(p1.socketId) ?? null;
  const p2Time = room.solves.get(p2.socketId) ?? null;

  // Determine winner from p1's perspective
  let p1Won = false;
  let draw = false;

  if (p1Solved && p2Solved) {
    if (p1Time! < p2Time!) p1Won = true;
    else if (p1Time! > p2Time!) p1Won = false;
    else draw = true;
  } else if (p1Solved) {
    p1Won = true;
  } else if (p2Solved) {
    p1Won = false;
  } else {
    draw = true;
  }

  const p1Score = p1Won ? 1 : draw ? 0.5 : 0;
  const { newRatingA, newRatingB, change } = updateRatings(p1.elo, p2.elo, p1Score);

  const fixedCode = room.challenge?.fixedCode;
  const buggyCode = room.challenge?.buggyCode;

  // Send results to player 1
  io.to(p1.socketId).emit("game:end", {
    won: p1Won,
    draw,
    playerTime: p1Time,
    opponentTime: p2Time,
    opponentName: p2.username,
    eloChange: p1Won ? change : draw ? 0 : -change,
    newElo: newRatingA,
    newRank: getRankFromElo(newRatingA),
    fixedCode,
    buggyCode,
  });

  // Send results to player 2
  io.to(p2.socketId).emit("game:end", {
    won: !p1Won && !draw,
    draw,
    playerTime: p2Time,
    opponentTime: p1Time,
    opponentName: p1.username,
    eloChange: !p1Won && !draw ? change : draw ? 0 : -change,
    newElo: newRatingB,
    newRank: getRankFromElo(newRatingB),
    fixedCode,
    buggyCode,
  });

  // Update leaderboard entries
  const p1Entry = leaderboard.get(p1.username.toLowerCase());
  if (p1Entry) {
    p1Entry.elo = newRatingA;
    p1Entry.rank = getRankFromElo(newRatingA);
    if (draw) p1Entry.draws++;
    else if (p1Won) p1Entry.wins++;
    else p1Entry.losses++;
  }
  const p2Entry = leaderboard.get(p2.username.toLowerCase());
  if (p2Entry) {
    p2Entry.elo = newRatingB;
    p2Entry.rank = getRankFromElo(newRatingB);
    if (draw) p2Entry.draws++;
    else if (!p1Won) p2Entry.wins++;
    else p2Entry.losses++;
  }

  // Cleanup
  playerRooms.delete(p1.socketId);
  playerRooms.delete(p2.socketId);
  rooms.delete(room.id);
}

function createRoom(p1: QueuedPlayer, p2: QueuedPlayer, io: Server): void {
  const roomId = generateRoomId();
  const challenge = getRandomChallenge();

  const room: GameRoom = {
    id: roomId,
    players: [
      { socketId: p1.socketId, username: p1.username, elo: p1.elo, rank: p1.rank },
      { socketId: p2.socketId, username: p2.username, elo: p2.elo, rank: p2.rank },
    ],
    challenge,
    startTime: 0,
    timeLimit: 90000,
    solves: new Map(),
    timedOut: new Set(),
    ended: false,
    readyPlayers: new Set(),
  };

  rooms.set(roomId, room);
  playerRooms.set(p1.socketId, roomId);
  playerRooms.set(p2.socketId, roomId);

  // Notify both players
  io.to(p1.socketId).emit("match:found", {
    roomId,
    opponent: { username: p2.username, elo: p2.elo, rank: p2.rank, title: p2.title },
  });
  io.to(p2.socketId).emit("match:found", {
    roomId,
    opponent: { username: p1.username, elo: p1.elo, rank: p1.rank, title: p1.title },
  });
}

export function setupSocketHandlers(io: Server): void {
  // Matchmaking loop: check for matches every second
  matchmakingInterval = setInterval(() => {
    let match = tryMatch();
    let anyMatched = false;
    while (match) {
      const [p1, p2] = match;
      createRoom(p1, p2, io);
      match = tryMatch();
      anyMatched = true;
    }
    // Update remaining queued players after matches are made
    if (anyMatched) broadcastQueueStatus(io);
  }, 1000);

  io.on("connection", (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Leaderboard events
    socket.on("leaderboard:update", (data: { username: string; elo: number; rank: string; wins: number; losses: number; draws: number; isGuest?: boolean }) => {
      if (data.username && typeof data.elo === "number" && !data.isGuest) {
        leaderboard.set(data.username.toLowerCase(), {
          username: data.username,
          elo: data.elo,
          rank: data.rank,
          wins: data.wins || 0,
          losses: data.losses || 0,
          draws: data.draws || 0,
        });
      }
    });

    socket.on("leaderboard:get", () => {
      const entries = Array.from(leaderboard.values())
        .sort((a, b) => b.elo - a.elo)
        .slice(0, 50);
      socket.emit("leaderboard:data", entries);
    });

    socket.on("season:info", () => {
      const SEASON_EPOCH = new Date("2026-03-01").getTime();
      const SEASON_MS = 60 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const elapsed = now - SEASON_EPOCH;
      const seasonNumber = Math.max(1, Math.floor(elapsed / SEASON_MS) + 1);
      const seasonStart = SEASON_EPOCH + (seasonNumber - 1) * SEASON_MS;
      const seasonEnd = seasonStart + SEASON_MS;
      const daysLeft = Math.max(0, Math.ceil((seasonEnd - now) / (24 * 60 * 60 * 1000)));
      socket.emit("season:info", { season: seasonNumber, daysLeft, endsAt: new Date(seasonEnd).toISOString() });
    });

    socket.on("queue:join", (data: { username: string; elo: number; rank: string; title?: string | null }) => {
      // Also update leaderboard when joining queue
      if (data.username && !leaderboard.has(data.username.toLowerCase())) {
        leaderboard.set(data.username.toLowerCase(), {
          username: data.username,
          elo: data.elo,
          rank: data.rank,
          wins: 0,
          losses: 0,
          draws: 0,
        });
      }

      addToQueue({
        socketId: socket.id,
        username: data.username,
        elo: data.elo,
        rank: data.rank,
        title: data.title ?? null,
        joinedAt: Date.now(),
      });

      broadcastQueueStatus(io);
    });

    socket.on("queue:leave", () => {
      removeFromQueue(socket.id);
      broadcastQueueStatus(io);
    });

    socket.on("game:ready", (data: { roomId: string }) => {
      const room = rooms.get(data.roomId);
      if (!room || room.ended) return;

      room.readyPlayers.add(socket.id);

      // When both players are ready, start the game
      if (room.readyPlayers.size === 2) {
        room.startTime = Date.now();

        const challengeData = stripFixedCode(room.challenge);

        for (const player of room.players) {
          io.to(player.socketId).emit("game:start", {
            roomId: room.id,
            challenge: challengeData,
            timeLimit: room.timeLimit,
          });
        }

        // Auto-end game after time limit + buffer
        setTimeout(() => {
          if (!room.ended) {
            endGame(room, io);
          }
        }, room.timeLimit + 5000);
      }
    });

    socket.on("game:submit", (data: { roomId: string; code: string }) => {
      const room = rooms.get(data.roomId);
      if (!room || room.ended || room.startTime === 0) return;

      // Already solved
      if (room.solves.has(socket.id)) return;

      const correct = validateSubmission(data.code, room.challenge.fixedCode);

      socket.emit("game:submit-result", { correct });

      if (correct) {
        const solveTime = Date.now() - room.startTime;
        room.solves.set(socket.id, solveTime);

        // Notify opponent
        const opponent = room.players.find((p) => p.socketId !== socket.id);
        if (opponent) {
          io.to(opponent.socketId).emit("game:opponent-solved", { opponentTime: solveTime });
        }

        // If both solved, end game
        if (room.solves.size === 2) {
          endGame(room, io);
        }
      }
    });

    socket.on("game:timeout", (data: { roomId: string }) => {
      const room = rooms.get(data.roomId);
      if (!room || room.ended) return;

      room.timedOut.add(socket.id);

      // If both timed out or one solved + one timed out, end
      if (room.timedOut.size + room.solves.size >= 2) {
        endGame(room, io);
      }
    });

    socket.on("game:typing", (data: { roomId: string; typing: boolean }) => {
      const room = rooms.get(data.roomId);
      if (!room || room.ended) return;

      const opponent = room.players.find((p) => p.socketId !== socket.id);
      if (opponent) {
        io.to(opponent.socketId).emit("game:opponent-typing", { typing: data.typing });
      }
    });

    // ─── Practice room events ────────────────────────────────────────────────
    socket.on(
      "practice:create",
      (data: { language: string; difficulty: number | null; timeLimit: number; username: string; elo: number; rank: string; title?: string | null }) => {
        const code = generatePracticeCode();
        const roomId = `practice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const room: PracticeRoom = {
          id: roomId,
          code,
          host: { socketId: socket.id, username: data.username, elo: data.elo, rank: data.rank, title: data.title ?? null },
          guest: null,
          challenge: null,
          timeLimit: data.timeLimit,
          language: data.language,
          difficulty: data.difficulty,
          hostTime: null,
          guestTime: null,
          startTime: 0,
          started: false,
          ended: false,
        };
        practiceRooms.set(roomId, room);
        practiceRoomsByCode.set(code, roomId);
        playerPracticeRooms.set(socket.id, roomId);
        socket.emit("practice:created", { code, roomId });
      }
    );

    socket.on(
      "practice:join",
      (data: { code: string; username: string; elo: number; rank: string; title?: string | null }) => {
        const roomId = practiceRoomsByCode.get(data.code.toUpperCase());
        if (!roomId) {
          socket.emit("practice:error", { message: "Room not found. Check the code and try again." });
          return;
        }
        const room = practiceRooms.get(roomId);
        if (!room || room.started || room.ended) {
          socket.emit("practice:error", { message: "This room is no longer available." });
          return;
        }
        if (room.guest) {
          socket.emit("practice:error", { message: "This room is already full." });
          return;
        }
        room.guest = { socketId: socket.id, username: data.username, elo: data.elo, rank: data.rank, title: data.title ?? null };
        playerPracticeRooms.set(socket.id, roomId);
        // Notify host that opponent joined
        io.to(room.host.socketId).emit("practice:opponent-joined", {
          username: data.username,
          elo: data.elo,
          rank: data.rank,
          title: data.title ?? null,
        });
        // Notify guest of host info + room config
        socket.emit("practice:opponent-joined", {
          username: room.host.username,
          elo: room.host.elo,
          rank: room.host.rank,
          title: room.host.title ?? null,
          config: { language: room.language, difficulty: room.difficulty, timeLimit: room.timeLimit },
        });
      }
    );

    socket.on("practice:start", (data: { roomId: string }) => {
      const room = practiceRooms.get(data.roomId);
      if (!room || room.started || room.ended) return;
      if (socket.id !== room.host.socketId) return; // only host can start
      if (!room.guest) return; // need opponent

      room.started = true;
      room.startTime = Date.now();
      room.challenge = getChallengeForPractice(room.language, room.difficulty);

      // Strip fixedCode before sending to clients
      const { fixedCode, ...challengeData } = room.challenge;
      void fixedCode; // server keeps fixedCode for validation

      io.to(room.host.socketId).emit("practice:begin", {
        roomId: room.id,
        challenge: challengeData,
        timeLimit: room.timeLimit,
      });
      io.to(room.guest!.socketId).emit("practice:begin", {
        roomId: room.id,
        challenge: challengeData,
        timeLimit: room.timeLimit,
      });

      // Auto-end after time limit + buffer
      setTimeout(() => {
        if (!room.ended) endPracticeGame(room, io);
      }, room.timeLimit * 1000 + 5000);
    });

    socket.on("practice:submit", (data: { roomId: string; code: string }) => {
      const room = practiceRooms.get(data.roomId);
      if (!room || !room.started || room.ended || !room.challenge) return;

      const isHost = socket.id === room.host.socketId;
      const alreadySolved = isHost ? room.hostTime !== null : room.guestTime !== null;
      if (alreadySolved) return;

      const correct = validateSubmission(data.code, room.challenge.fixedCode);
      socket.emit("practice:submit-result", { correct });

      if (correct) {
        const solveTime = Date.now() - room.startTime;
        if (isHost) room.hostTime = solveTime;
        else room.guestTime = solveTime;

        const opponent = isHost ? room.guest : room.host;
        if (opponent) {
          io.to(opponent.socketId).emit("practice:opponent-solved", { time: solveTime });
        }

        // If both done, end
        if (room.hostTime !== null && room.guestTime !== null) {
          endPracticeGame(room, io);
        }
      }
    });

    socket.on("practice:timeout", (data: { roomId: string }) => {
      const room = practiceRooms.get(data.roomId);
      if (!room || !room.started || room.ended) return;

      const isHost = socket.id === room.host.socketId;
      // Mark as timed out (null solve time stays null)
      if (isHost && room.hostTime === null) room.hostTime = -1; // sentinel for timeout
      else if (!isHost && room.guestTime === null) room.guestTime = -1;

      // If both accounted for, end
      if (room.hostTime !== null && room.guestTime !== null) {
        endPracticeGame(room, io);
      }
    });

    socket.on("practice:leave", (data: { roomId: string }) => {
      const room = practiceRooms.get(data.roomId);
      if (!room || room.ended) return;
      endPracticeGame(room, io);
    });

    socket.on("match:reaction", (data: { roomId: string; msg: string }) => {
      const room = rooms.get(data.roomId);
      if (!room) return;
      const other = room.players.find((p) => p.socketId !== socket.id);
      if (other) io.to(other.socketId).emit("match:reaction", { msg: data.msg });
    });

    // ── Player registration (for messaging) ──────────────────────────────────
    socket.on("player:register", ({ username }: { username: string }) => {
      const key = username.toLowerCase();
      socketToUser.set(socket.id, key);
      userToSocket.set(key, socket.id);
      // Flush any pending messages
      const msgs = pendingMessages.get(key) ?? [];
      if (msgs.length > 0) socket.emit("player:messages", msgs);
    });

    socket.on("player:dismiss-message", ({ messageId }: { messageId: string }) => {
      const username = socketToUser.get(socket.id);
      if (!username) return;
      const msgs = pendingMessages.get(username) ?? [];
      pendingMessages.set(username, msgs.filter((m) => m.id !== messageId));
    });

    // ── Admin messaging ───────────────────────────────────────────────────────
    socket.on("admin:send-message", ({ passphrase, toUsername, text }: { passphrase: string; toUsername: string; text: string }) => {
      if (passphrase !== ADMIN_PASSPHRASE) return;
      const key = toUsername.toLowerCase();
      const msg: AdminMessage = { id: Date.now().toString(36), text, createdAt: new Date().toISOString() };
      const msgs = pendingMessages.get(key) ?? [];
      msgs.push(msg);
      pendingMessages.set(key, msgs);
      // Live delivery if player is online right now
      const sid = userToSocket.get(key);
      if (sid) io.to(sid).emit("player:messages", [msg]);
      socket.emit("admin:message-sent", { ok: true });
    });

    socket.on("admin:generate-code", ({ passphrase, titleId }: { passphrase: string; titleId: string }) => {
      if (passphrase !== ADMIN_PASSPHRASE) return;
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
      grantCodes.set(code, { titleId, used: false });
      socket.emit("admin:code-generated", { code });
    });

    // ── Title claim ───────────────────────────────────────────────────────────
    socket.on("title:claim", ({ code }: { code: string }) => {
      const entry = grantCodes.get(code.toUpperCase().trim());
      if (!entry || entry.used) {
        socket.emit("title:claim-result", { ok: false, error: entry ? "Code already used" : "Invalid code" });
        return;
      }
      entry.used = true;
      socket.emit("title:claim-result", { ok: true, titleId: entry.titleId });
    });

    socket.on("disconnect", () => {
      console.log(`Player disconnected: ${socket.id}`);

      // Clean up messaging maps
      const username = socketToUser.get(socket.id);
      if (username) {
        socketToUser.delete(socket.id);
        userToSocket.delete(username);
      }

      // Remove from matchmaking queue
      removeFromQueue(socket.id);

      // Handle active ranked game forfeit
      const roomId = playerRooms.get(socket.id);
      if (roomId) {
        const room = rooms.get(roomId);
        if (room && !room.ended) {
          const opponent = room.players.find((p) => p.socketId !== socket.id);
          if (opponent) {
            io.to(opponent.socketId).emit("game:opponent-disconnected");

            // Opponent wins by forfeit
            room.solves.set(opponent.socketId, room.startTime > 0 ? Date.now() - room.startTime : 0);
            endGame(room, io);
          }
        }
      }

      // Handle practice room disconnect
      const practiceRoomId = playerPracticeRooms.get(socket.id);
      if (practiceRoomId) {
        const pRoom = practiceRooms.get(practiceRoomId);
        if (pRoom && !pRoom.ended) {
          endPracticeGame(pRoom, io);
        }
      }
    });
  });
}
