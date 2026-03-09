import express from "express";
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { matchmakingQueue } from "./src/lib/matchmaking";
import { validateCodeFix } from "./src/lib/challenges";
import { updateRatings, getRankFromElo } from "./src/lib/elo";
import { getBotSolveDelay, shouldBotFail, BOT_PLAYER } from "./src/lib/bot";
import type { ServerToClientEvents, ClientToServerEvents, GameState, Player } from "./src/types";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

const GAME_DURATION = 90; // seconds

// Track active games
interface ActiveGame {
  matchId: number;
  challengeId: number;
  fixedCode: string;
  startTime: number;
  timer: NodeJS.Timeout;
  player1SocketId: string;
  player2SocketId: string | null; // null for bot
  player1Id: number;
  player2Id: number;
  player1Solved: boolean;
  player2Solved: boolean;
  player1Time: number | null;
  player2Time: number | null;
  isVsBot: boolean;
  ended: boolean;
}

const activeGames = new Map<number, ActiveGame>();
const socketToPlayer = new Map<string, number>(); // socketId -> userId
const playerToSocket = new Map<number, string>(); // userId -> socketId

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: { origin: "*" },
  });

  // Matchmaking check interval
  setInterval(() => {
    const match = matchmakingQueue.findMatch();
    if (match) {
      startPvPMatch(io, match.entry1, match.entry2);
    }
  }, 1000);

  io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on("join_queue", async (data) => {
      const { userId, mode } = data;
      socketToPlayer.set(socket.id, userId);
      playerToSocket.set(userId, socket.id);

      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          socket.emit("error", "User not found");
          return;
        }

        const player: Player = {
          id: user.id,
          username: user.username,
          elo: user.elo,
          rank: user.rank,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
        };

        if (mode === "bot") {
          await startBotMatch(io, socket.id, player);
        } else {
          const position = matchmakingQueue.add(player, socket.id);
          socket.emit("queue_position", position);
        }
      } catch {
        socket.emit("error", "Failed to join queue");
      }
    });

    socket.on("leave_queue", () => {
      matchmakingQueue.remove(socket.id);
    });

    socket.on("code_submit", async (data) => {
      const { matchId, code } = data;
      const game = activeGames.get(matchId);
      if (!game || game.ended) return;

      const playerId = socketToPlayer.get(socket.id);
      if (!playerId) return;

      const isCorrect = validateCodeFix(code, game.fixedCode);
      if (!isCorrect) {
        // Notify opponent of failed attempt
        const opponentSocketId =
          playerId === game.player1Id ? game.player2SocketId : game.player1SocketId;
        if (opponentSocketId) {
          io.to(opponentSocketId).emit("opponent_progress", { typing: false, submitCount: 1 });
        }
        return;
      }

      const solveTime = Date.now() - game.startTime;

      if (playerId === game.player1Id) {
        game.player1Solved = true;
        game.player1Time = solveTime;
      } else {
        game.player2Solved = true;
        game.player2Time = solveTime;
      }

      // Notify opponent that this player solved it
      const opponentSocketId =
        playerId === game.player1Id ? game.player2SocketId : game.player1SocketId;
      if (opponentSocketId) {
        io.to(opponentSocketId).emit("opponent_solved", { time: solveTime });
      }

      // If first to solve, end the game
      if (!game.ended) {
        await endGame(io, game, playerId);
      }
    });

    socket.on("typing_update", (data) => {
      const { matchId, typing } = data;
      const game = activeGames.get(matchId);
      if (!game || game.ended) return;

      const playerId = socketToPlayer.get(socket.id);
      if (!playerId) return;

      const opponentSocketId =
        playerId === game.player1Id ? game.player2SocketId : game.player1SocketId;
      if (opponentSocketId) {
        io.to(opponentSocketId).emit("opponent_progress", { typing, submitCount: 0 });
      }
    });

    socket.on("disconnect", () => {
      const playerId = socketToPlayer.get(socket.id);
      matchmakingQueue.remove(socket.id);
      if (playerId) {
        socketToPlayer.delete(socket.id);
        playerToSocket.delete(playerId);
      }
    });
  });

  async function getRandomChallenge() {
    const count = await prisma.challenge.count();
    const skip = Math.floor(Math.random() * count);
    const challenge = await prisma.challenge.findFirst({ skip, take: 1 });
    return challenge!;
  }

  async function startPvPMatch(
    io: Server,
    entry1: { player: Player; socketId: string },
    entry2: { player: Player; socketId: string }
  ) {
    const challenge = await getRandomChallenge();

    const match = await prisma.match.create({
      data: {
        player1Id: entry1.player.id,
        player2Id: entry2.player.id,
        challengeId: challenge.id,
        isVsBot: false,
        player1Elo: entry1.player.elo,
        player2Elo: entry2.player.elo,
        status: "in_progress",
      },
    });

    const gameState: GameState = {
      matchId: match.id,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        language: challenge.language,
        buggyCode: challenge.buggyCode,
        hint: challenge.hint ?? undefined,
        difficulty: challenge.difficulty,
        category: challenge.category,
      },
      timeRemaining: GAME_DURATION,
      player1: { id: entry1.player.id, username: entry1.player.username, elo: entry1.player.elo, rank: entry1.player.rank, submitted: false, solved: false },
      player2: { id: entry2.player.id, username: entry2.player.username, elo: entry2.player.elo, rank: entry2.player.rank, submitted: false, solved: false },
      isVsBot: false,
    };

    // Notify both players
    io.to(entry1.socketId).emit("match_found", { matchId: match.id, opponent: entry2.player });
    io.to(entry2.socketId).emit("match_found", { matchId: match.id, opponent: entry1.player });

    // Start game after a short delay for the "match found" animation
    setTimeout(() => {
      io.to(entry1.socketId).emit("game_start", gameState);
      io.to(entry2.socketId).emit("game_start", gameState);
    }, 3000);

    // Timer for game end
    const timer = setTimeout(() => {
      const game = activeGames.get(match.id);
      if (game && !game.ended) {
        endGame(io, game, null); // draw - time ran out
      }
    }, (GAME_DURATION + 3) * 1000);

    activeGames.set(match.id, {
      matchId: match.id,
      challengeId: challenge.id,
      fixedCode: challenge.fixedCode,
      startTime: Date.now() + 3000,
      timer,
      player1SocketId: entry1.socketId,
      player2SocketId: entry2.socketId,
      player1Id: entry1.player.id,
      player2Id: entry2.player.id,
      player1Solved: false,
      player2Solved: false,
      player1Time: null,
      player2Time: null,
      isVsBot: false,
      ended: false,
    });
  }

  async function startBotMatch(io: Server, socketId: string, player: Player) {
    const challenge = await getRandomChallenge();

    const match = await prisma.match.create({
      data: {
        player1Id: player.id,
        player2Id: null,
        challengeId: challenge.id,
        isVsBot: true,
        player1Elo: player.elo,
        player2Elo: BOT_PLAYER.elo,
        status: "in_progress",
      },
    });

    const gameState: GameState = {
      matchId: match.id,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        language: challenge.language,
        buggyCode: challenge.buggyCode,
        hint: challenge.hint ?? undefined,
        difficulty: challenge.difficulty,
        category: challenge.category,
      },
      timeRemaining: GAME_DURATION,
      player1: { id: player.id, username: player.username, elo: player.elo, rank: player.rank, submitted: false, solved: false },
      player2: { id: BOT_PLAYER.id, username: BOT_PLAYER.username, elo: BOT_PLAYER.elo, rank: BOT_PLAYER.rank, submitted: false, solved: false },
      isVsBot: true,
    };

    io.to(socketId).emit("match_found", { matchId: match.id, opponent: BOT_PLAYER });

    setTimeout(() => {
      io.to(socketId).emit("game_start", gameState);
    }, 3000);

    const timer = setTimeout(() => {
      const game = activeGames.get(match.id);
      if (game && !game.ended) {
        endGame(io, game, null);
      }
    }, (GAME_DURATION + 3) * 1000);

    activeGames.set(match.id, {
      matchId: match.id,
      challengeId: challenge.id,
      fixedCode: challenge.fixedCode,
      startTime: Date.now() + 3000,
      timer,
      player1SocketId: socketId,
      player2SocketId: null,
      player1Id: player.id,
      player2Id: BOT_PLAYER.id,
      player1Solved: false,
      player2Solved: false,
      player1Time: null,
      player2Time: null,
      isVsBot: true,
      ended: false,
    });

    // Simulate bot solving
    const botDelay = getBotSolveDelay(player.elo, challenge.difficulty);
    const willFail = shouldBotFail(player.elo);

    setTimeout(() => {
      const game = activeGames.get(match.id);
      if (!game || game.ended) return;

      if (willFail) {
        // Bot fails first attempt, notify player
        io.to(socketId).emit("opponent_progress", { typing: true, submitCount: 1 });

        // Bot tries again after additional delay
        setTimeout(() => {
          const g = activeGames.get(match.id);
          if (!g || g.ended) return;
          g.player2Solved = true;
          g.player2Time = Date.now() - g.startTime;
          io.to(socketId).emit("opponent_solved", { time: g.player2Time });
          if (!g.player1Solved && !g.ended) {
            endGame(io, g, BOT_PLAYER.id);
          }
        }, botDelay * 0.4);
      } else {
        game.player2Solved = true;
        game.player2Time = Date.now() - game.startTime;
        io.to(socketId).emit("opponent_solved", { time: game.player2Time });
        if (!game.player1Solved && !game.ended) {
          endGame(io, game, BOT_PLAYER.id);
        }
      }
    }, botDelay + 3000);
  }

  async function endGame(io: Server, game: ActiveGame, winnerId: number | null) {
    if (game.ended) return;
    game.ended = true;
    clearTimeout(game.timer);

    const isDraw = winnerId === null;
    const scoreA = winnerId === game.player1Id ? 1 : isDraw ? 0.5 : 0;

    // Get current ELO
    const player1 = await prisma.user.findUnique({ where: { id: game.player1Id } });
    if (!player1) return;

    const p2Elo = game.isVsBot ? BOT_PLAYER.elo : (await prisma.user.findUnique({ where: { id: game.player2Id } }))?.elo ?? 1000;

    const { newRatingA, newRatingB, change } = updateRatings(player1.elo, p2Elo, scoreA);

    // Update player 1
    await prisma.user.update({
      where: { id: game.player1Id },
      data: {
        elo: newRatingA,
        rank: getRankFromElo(newRatingA),
        wins: winnerId === game.player1Id ? { increment: 1 } : undefined,
        losses: winnerId !== null && winnerId !== game.player1Id ? { increment: 1 } : undefined,
        draws: isDraw ? { increment: 1 } : undefined,
      },
    });

    // Update player 2 (if not bot)
    if (!game.isVsBot && game.player2Id > 0) {
      await prisma.user.update({
        where: { id: game.player2Id },
        data: {
          elo: newRatingB,
          rank: getRankFromElo(newRatingB),
          wins: winnerId === game.player2Id ? { increment: 1 } : undefined,
          losses: winnerId !== null && winnerId !== game.player2Id ? { increment: 1 } : undefined,
          draws: isDraw ? { increment: 1 } : undefined,
        },
      });
    }

    // Update match record
    await prisma.match.update({
      where: { id: game.matchId },
      data: {
        winnerId,
        player1Time: game.player1Time,
        player2Time: game.player2Time,
        eloChange: change,
        status: "completed",
      },
    });

    const result = {
      matchId: game.matchId,
      winnerId,
      player1Time: game.player1Time,
      player2Time: game.player2Time,
      eloChange: change,
      player1NewElo: newRatingA,
      player2NewElo: newRatingB,
      isDraw,
    };

    // Notify players
    io.to(game.player1SocketId).emit("game_end", result);
    if (game.player2SocketId) {
      io.to(game.player2SocketId).emit("game_end", result);
    }

    // Cleanup
    activeGames.delete(game.matchId);
  }

  // Handle all other requests with Next.js
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> BugRacer server ready on http://localhost:${PORT}`);
  });
});
