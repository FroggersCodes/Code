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
import * as fs from "fs";
import * as path from "path";

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
  winStreak: number;
  title: string | null;
  avatar: string | null;
}
const leaderboard = new Map<string, LeaderboardEntry>();

const LEADERBOARD_FILE = path.resolve(process.cwd(), "data", "leaderboard.json");
const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const REDIS_KEY   = "bugracer:leaderboard";

async function loadLeaderboard(): Promise<void> {
  // Try Redis first
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const res = await fetch(`${REDIS_URL}/get/${REDIS_KEY}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      });
      const { result } = await res.json() as { result: string | null };
      if (result) {
        const entries: LeaderboardEntry[] = JSON.parse(result);
        for (const entry of entries) leaderboard.set(entry.username.toLowerCase(), entry);
        console.log(`[leaderboard] Loaded ${leaderboard.size} entries from Redis.`);
        return;
      }
    } catch (err) {
      console.error("[leaderboard] Redis load failed, falling back to file:", err);
    }
  }
  // Fallback: local file (local dev)
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const entries: LeaderboardEntry[] = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, "utf8"));
      for (const entry of entries) leaderboard.set(entry.username.toLowerCase(), entry);
      console.log(`[leaderboard] Loaded ${leaderboard.size} entries from disk.`);
    }
  } catch (err) {
    console.error("[leaderboard] File load failed:", err);
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function saveLeaderboard(): void {
  if (saveTimer) return;
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    const entries = Array.from(leaderboard.values());
    // Save to Redis if configured
    if (REDIS_URL && REDIS_TOKEN) {
      try {
        await fetch(`${REDIS_URL}/set/${REDIS_KEY}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify([JSON.stringify(entries)]),
        });
      } catch (err) {
        console.error("[leaderboard] Redis save failed:", err);
      }
    }
    // Always write local file as backup
    try {
      fs.mkdirSync(path.dirname(LEADERBOARD_FILE), { recursive: true });
      fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(entries, null, 2));
    } catch (err) {
      console.error("[leaderboard] File save failed:", err);
    }
  }, 2000);
}

// ─── Suggestions & Bug Reports (server-side) ─────────────────────────────────
interface Suggestion { id: string; username: string; text: string; createdAt: string; }
interface BugReport { id: string; username: string; challengeTitle: string; reason: string; description: string; createdAt: string; }
const suggestions: Suggestion[] = [];
const bugReports: BugReport[] = [];

const SUGGESTIONS_FILE = path.resolve(process.cwd(), "data", "suggestions.json");
const REPORTS_FILE = path.resolve(process.cwd(), "data", "reports.json");

function loadSuggestionsAndReports(): void {
  try {
    if (fs.existsSync(SUGGESTIONS_FILE)) {
      const data: Suggestion[] = JSON.parse(fs.readFileSync(SUGGESTIONS_FILE, "utf8"));
      suggestions.push(...data);
      console.log(`[suggestions] Loaded ${suggestions.length} suggestions from disk.`);
    }
  } catch (err) { console.error("[suggestions] File load failed:", err); }
  try {
    if (fs.existsSync(REPORTS_FILE)) {
      const data: BugReport[] = JSON.parse(fs.readFileSync(REPORTS_FILE, "utf8"));
      bugReports.push(...data);
      console.log(`[reports] Loaded ${bugReports.length} bug reports from disk.`);
    }
  } catch (err) { console.error("[reports] File load failed:", err); }
}

let saveSuggestionsTimer: ReturnType<typeof setTimeout> | null = null;
function saveSuggestionsAndReports(): void {
  if (saveSuggestionsTimer) return;
  saveSuggestionsTimer = setTimeout(() => {
    saveSuggestionsTimer = null;
    try {
      fs.mkdirSync(path.dirname(SUGGESTIONS_FILE), { recursive: true });
      fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(suggestions, null, 2));
      fs.writeFileSync(REPORTS_FILE, JSON.stringify(bugReports, null, 2));
    } catch (err) { console.error("[suggestions/reports] File save failed:", err); }
  }, 2000);
}

// ─── Announcements (server-side) ──────────────────────────────────────────────
interface Announcement { id: string; title: string; body: string; createdAt: string; }
const announcements: Announcement[] = [];
const ANNOUNCEMENTS_FILE = path.resolve(process.cwd(), "data", "announcements.json");

function loadAnnouncements(): void {
  try {
    if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
      const data: Announcement[] = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, "utf8"));
      announcements.push(...data);
      console.log(`[announcements] Loaded ${announcements.length} announcements from disk.`);
    }
  } catch (err) { console.error("[announcements] File load failed:", err); }
}

let saveAnnouncementsTimer: ReturnType<typeof setTimeout> | null = null;
function saveAnnouncements(): void {
  if (saveAnnouncementsTimer) return;
  saveAnnouncementsTimer = setTimeout(() => {
    saveAnnouncementsTimer = null;
    try {
      fs.mkdirSync(path.dirname(ANNOUNCEMENTS_FILE), { recursive: true });
      fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2));
    } catch (err) { console.error("[announcements] File save failed:", err); }
  }, 2000);
}

// ─── Friends & Invites (server-side) ──────────────────────────────────────────
// friends: username.lower() -> Set of friend usernames (lower)
const friendsMap = new Map<string, Set<string>>();
// invites: username.lower() -> array of { from: string, createdAt: string }
interface FriendInvite { from: string; createdAt: string; }
const invitesMap = new Map<string, FriendInvite[]>();
const FRIENDS_FILE = path.resolve(process.cwd(), "data", "friends.json");

function loadFriends(): void {
  try {
    if (fs.existsSync(FRIENDS_FILE)) {
      const data = JSON.parse(fs.readFileSync(FRIENDS_FILE, "utf8")) as { friends: Record<string, string[]>; invites: Record<string, FriendInvite[]> };
      for (const [k, v] of Object.entries(data.friends)) friendsMap.set(k, new Set(v));
      for (const [k, v] of Object.entries(data.invites)) invitesMap.set(k, v);
      console.log(`[friends] Loaded friends data from disk.`);
    }
  } catch (err) { console.error("[friends] File load failed:", err); }
}

let saveFriendsTimer: ReturnType<typeof setTimeout> | null = null;
function saveFriends(): void {
  if (saveFriendsTimer) return;
  saveFriendsTimer = setTimeout(() => {
    saveFriendsTimer = null;
    try {
      fs.mkdirSync(path.dirname(FRIENDS_FILE), { recursive: true });
      const friends: Record<string, string[]> = {};
      friendsMap.forEach((v, k) => { friends[k] = Array.from(v); });
      const invites: Record<string, FriendInvite[]> = {};
      invitesMap.forEach((v, k) => { invites[k] = v; });
      fs.writeFileSync(FRIENDS_FILE, JSON.stringify({ friends, invites }, null, 2));
    } catch (err) { console.error("[friends] File save failed:", err); }
  }, 2000);
}

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

  // Update leaderboard entries (create if missing so all players appear)
  let p1Entry = leaderboard.get(p1.username.toLowerCase());
  if (!p1Entry) {
    p1Entry = { username: p1.username, elo: newRatingA, rank: getRankFromElo(newRatingA), wins: 0, losses: 0, draws: 0, winStreak: 0, title: null, avatar: null };
    leaderboard.set(p1.username.toLowerCase(), p1Entry);
  }
  p1Entry.elo = newRatingA;
  p1Entry.rank = getRankFromElo(newRatingA);
  if (draw) { p1Entry.draws++; p1Entry.winStreak = 0; }
  else if (p1Won) { p1Entry.wins++; p1Entry.winStreak = (p1Entry.winStreak ?? 0) + 1; }
  else { p1Entry.losses++; p1Entry.winStreak = 0; }

  let p2Entry = leaderboard.get(p2.username.toLowerCase());
  if (!p2Entry) {
    p2Entry = { username: p2.username, elo: newRatingB, rank: getRankFromElo(newRatingB), wins: 0, losses: 0, draws: 0, winStreak: 0, title: null, avatar: null };
    leaderboard.set(p2.username.toLowerCase(), p2Entry);
  }
  p2Entry.elo = newRatingB;
  p2Entry.rank = getRankFromElo(newRatingB);
  if (draw) { p2Entry.draws++; p2Entry.winStreak = 0; }
  else if (!p1Won) { p2Entry.wins++; p2Entry.winStreak = (p2Entry.winStreak ?? 0) + 1; }
  else { p2Entry.losses++; p2Entry.winStreak = 0; }

  saveLeaderboard();

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

export async function setupSocketHandlers(io: Server): Promise<void> {
  await loadLeaderboard();
  await loadSuggestionsAndReports();
  await loadAnnouncements();
  await loadFriends();

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
    socket.on("leaderboard:update", (data: { username: string; elo: number; rank: string; wins: number; losses: number; draws: number; winStreak?: number; title?: string | null; avatar?: string | null; isGuest?: boolean }) => {
      if (data.username && typeof data.elo === "number" && !data.isGuest) {
        const existing = leaderboard.get(data.username.toLowerCase());
        leaderboard.set(data.username.toLowerCase(), {
          username: data.username,
          elo: data.elo,
          rank: data.rank,
          wins: data.wins || 0,
          losses: data.losses || 0,
          draws: data.draws || 0,
          winStreak: data.winStreak ?? existing?.winStreak ?? 0,
          title: data.title !== undefined ? data.title : (existing?.title ?? null),
          avatar: data.avatar !== undefined ? data.avatar : (existing?.avatar ?? null),
        });
        saveLeaderboard();
      }
    });

    socket.on("leaderboard:get", () => {
      const entries = Array.from(leaderboard.values())
        .sort((a, b) => b.elo - a.elo)
        .slice(0, 50);
      socket.emit("leaderboard:data", entries);
    });

    socket.on("profile:get", (data: { username: string }) => {
      const entry = leaderboard.get(data.username.toLowerCase()) ?? null;
      socket.emit("profile:data", entry);
    });

    socket.on("season:info", () => {
      const SEASON_EPOCH = new Date("2026-03-01").getTime();
      const SEASON_MS = 183 * 24 * 60 * 60 * 1000; // ~6 months
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
          winStreak: 0,
          title: data.title ?? null,
          avatar: null,
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

    // ── Suggestions (server-side) ────────────────────────────────────────────
    socket.on("suggestion:add", (data: { username: string; text: string }) => {
      if (!data.text?.trim()) return;
      suggestions.unshift({
        id: Date.now().toString(36),
        username: data.username || "Guest",
        text: data.text.trim().slice(0, 500),
        createdAt: new Date().toISOString(),
      });
      saveSuggestionsAndReports();
    });

    socket.on("suggestions:get", () => {
      socket.emit("suggestions:data", suggestions);
    });

    socket.on("suggestion:delete", ({ id, passphrase }: { id: string; passphrase: string }) => {
      if (passphrase !== ADMIN_PASSPHRASE) return;
      const idx = suggestions.findIndex((s) => s.id === id);
      if (idx !== -1) suggestions.splice(idx, 1);
      saveSuggestionsAndReports();
      socket.emit("suggestions:data", suggestions);
    });

    // ── Bug Reports (server-side) ─────────────────────────────────────────────
    socket.on("report:add", (data: { username: string; challengeTitle: string; reason: string; description: string }) => {
      bugReports.unshift({
        id: Date.now().toString(36),
        username: data.username || "Guest",
        challengeTitle: data.challengeTitle,
        reason: data.reason,
        description: data.description || "",
        createdAt: new Date().toISOString(),
      });
      saveSuggestionsAndReports();
    });

    socket.on("reports:get", () => {
      socket.emit("reports:data", bugReports);
    });

    socket.on("report:delete", ({ id, passphrase }: { id: string; passphrase: string }) => {
      if (passphrase !== ADMIN_PASSPHRASE) return;
      const idx = bugReports.findIndex((r) => r.id === id);
      if (idx !== -1) bugReports.splice(idx, 1);
      saveSuggestionsAndReports();
      socket.emit("reports:data", bugReports);
    });

    // ── Announcements ─────────────────────────────────────────────────────────
    socket.on("announcements:get", () => {
      socket.emit("announcements:data", announcements);
    });

    socket.on("announcement:add", (data: { passphrase: string; title: string; body: string }) => {
      if (data.passphrase !== ADMIN_PASSPHRASE) return;
      announcements.unshift({
        id: Date.now().toString(36),
        title: data.title.trim().slice(0, 200),
        body: data.body.trim().slice(0, 2000),
        createdAt: new Date().toISOString(),
      });
      saveAnnouncements();
      socket.emit("announcements:data", announcements);
    });

    socket.on("announcement:delete", ({ id, passphrase }: { id: string; passphrase: string }) => {
      if (passphrase !== ADMIN_PASSPHRASE) return;
      const idx = announcements.findIndex((a) => a.id === id);
      if (idx !== -1) announcements.splice(idx, 1);
      saveAnnouncements();
      socket.emit("announcements:data", announcements);
    });

    // ── Friends & Invites (server-side) ───────────────────────────────────────
    socket.on("friends:get", ({ username }: { username: string }) => {
      const key = username.toLowerCase();
      const friendsList = Array.from(friendsMap.get(key) ?? []);
      // Get stats from leaderboard for each friend
      const friendsData = friendsList.map((f) => {
        const entry = leaderboard.get(f);
        return entry
          ? { username: entry.username, elo: entry.elo, rank: entry.rank, wins: entry.wins, losses: entry.losses }
          : { username: f, elo: 0, rank: "Silver", wins: 0, losses: 0 };
      });
      const invites = invitesMap.get(key) ?? [];
      socket.emit("friends:data", { friends: friendsData, invites });
    });

    socket.on("friend:invite", ({ from, to }: { from: string; to: string }) => {
      const fromKey = from.toLowerCase();
      const toKey = to.toLowerCase();
      if (fromKey === toKey) return;
      // Check if already friends
      if (friendsMap.get(fromKey)?.has(toKey)) return;
      // Check if invite already sent
      const existingInvites = invitesMap.get(toKey) ?? [];
      if (existingInvites.some((inv) => inv.from.toLowerCase() === fromKey)) return;
      // Check if target user exists on the leaderboard
      if (!leaderboard.has(toKey)) {
        socket.emit("friend:error", { message: `Player "${to}" not found` });
        return;
      }
      existingInvites.push({ from, createdAt: new Date().toISOString() });
      invitesMap.set(toKey, existingInvites);
      saveFriends();
      socket.emit("friend:invite-sent", { to });
      // If target is online, notify them
      const targetSid = userToSocket.get(toKey);
      if (targetSid) io.to(targetSid).emit("friend:invite-received", { from });
    });

    socket.on("friend:accept", ({ username, from }: { username: string; from: string }) => {
      const key = username.toLowerCase();
      const fromKey = from.toLowerCase();
      // Remove invite
      const invites = invitesMap.get(key) ?? [];
      invitesMap.set(key, invites.filter((inv) => inv.from.toLowerCase() !== fromKey));
      // Add friends (bidirectional)
      if (!friendsMap.has(key)) friendsMap.set(key, new Set());
      if (!friendsMap.has(fromKey)) friendsMap.set(fromKey, new Set());
      friendsMap.get(key)!.add(fromKey);
      friendsMap.get(fromKey)!.add(key);
      saveFriends();
      // Re-send updated data
      socket.emit("friend:accepted", { from });
    });

    socket.on("friend:decline", ({ username, from }: { username: string; from: string }) => {
      const key = username.toLowerCase();
      const fromKey = from.toLowerCase();
      const invites = invitesMap.get(key) ?? [];
      invitesMap.set(key, invites.filter((inv) => inv.from.toLowerCase() !== fromKey));
      saveFriends();
    });

    socket.on("friend:remove", ({ username, friend }: { username: string; friend: string }) => {
      const key = username.toLowerCase();
      const friendKey = friend.toLowerCase();
      friendsMap.get(key)?.delete(friendKey);
      friendsMap.get(friendKey)?.delete(key);
      saveFriends();
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
