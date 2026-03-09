import type { Player } from "@/types";

interface QueueEntry {
  player: Player;
  socketId: string;
  joinedAt: number;
}

const ELO_RANGE_BASE = 200;
const ELO_RANGE_EXPANSION_PER_SECOND = 5;

class MatchmakingQueue {
  private queue: QueueEntry[] = [];

  add(player: Player, socketId: string): number {
    // Don't add duplicates
    if (this.queue.some((e) => e.player.id === player.id)) {
      return this.getPosition(player.id);
    }
    this.queue.push({ player, socketId, joinedAt: Date.now() });
    return this.queue.length;
  }

  remove(socketId: string): void {
    this.queue = this.queue.filter((e) => e.socketId !== socketId);
  }

  removeByPlayerId(playerId: number): void {
    this.queue = this.queue.filter((e) => e.player.id !== playerId);
  }

  getPosition(playerId: number): number {
    const index = this.queue.findIndex((e) => e.player.id === playerId);
    return index + 1;
  }

  findMatch(): { entry1: QueueEntry; entry2: QueueEntry } | null {
    if (this.queue.length < 2) return null;

    for (let i = 0; i < this.queue.length; i++) {
      for (let j = i + 1; j < this.queue.length; j++) {
        const a = this.queue[i];
        const b = this.queue[j];

        // Calculate allowed ELO range based on wait time
        const waitTimeA = (Date.now() - a.joinedAt) / 1000;
        const waitTimeB = (Date.now() - b.joinedAt) / 1000;
        const maxWait = Math.max(waitTimeA, waitTimeB);
        const allowedRange = ELO_RANGE_BASE + maxWait * ELO_RANGE_EXPANSION_PER_SECOND;

        const eloDiff = Math.abs(a.player.elo - b.player.elo);
        if (eloDiff <= allowedRange) {
          // Remove both from queue
          this.queue = this.queue.filter(
            (e) => e.player.id !== a.player.id && e.player.id !== b.player.id
          );
          return { entry1: a, entry2: b };
        }
      }
    }
    return null;
  }

  get size(): number {
    return this.queue.length;
  }
}

export const matchmakingQueue = new MatchmakingQueue();
