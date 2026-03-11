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
  getQueuePosition,
  getQueueSize,
  type QueuedPlayer,
} from "./matchmaking";

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
    opponent: { username: p2.username, elo: p2.elo, rank: p2.rank },
  });
  io.to(p2.socketId).emit("match:found", {
    roomId,
    opponent: { username: p1.username, elo: p1.elo, rank: p1.rank },
  });
}

export function setupSocketHandlers(io: Server): void {
  // Matchmaking loop: check for matches every second
  matchmakingInterval = setInterval(() => {
    let match = tryMatch();
    while (match) {
      const [p1, p2] = match;
      createRoom(p1, p2, io);
      match = tryMatch();
    }

    // Send queue status updates
    // (We iterate connected sockets that are in the queue)
  }, 1000);

  io.on("connection", (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Leaderboard events
    socket.on("leaderboard:update", (data: { username: string; elo: number; rank: string; wins: number; losses: number; draws: number }) => {
      if (data.username && typeof data.elo === "number") {
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

    socket.on("queue:join", (data: { username: string; elo: number; rank: string }) => {
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
        joinedAt: Date.now(),
      });

      socket.emit("queue:status", {
        position: getQueuePosition(socket.id),
        queueSize: getQueueSize(),
      });
    });

    socket.on("queue:leave", () => {
      removeFromQueue(socket.id);
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

    socket.on("disconnect", () => {
      console.log(`Player disconnected: ${socket.id}`);

      // Remove from matchmaking queue
      removeFromQueue(socket.id);

      // Handle active game forfeit
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
    });
  });
}
