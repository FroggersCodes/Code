export interface QueuedPlayer {
  socketId: string;
  username: string;
  elo: number;
  rank: string;
  joinedAt: number;
}

const queue: QueuedPlayer[] = [];

export function addToQueue(player: QueuedPlayer): void {
  // Remove if already in queue
  removeFromQueue(player.socketId);
  queue.push(player);
}

export function removeFromQueue(socketId: string): void {
  const idx = queue.findIndex((p) => p.socketId === socketId);
  if (idx !== -1) queue.splice(idx, 1);
}

export function isInQueue(socketId: string): boolean {
  return queue.some((p) => p.socketId === socketId);
}

export function getQueuePosition(socketId: string): number {
  return queue.findIndex((p) => p.socketId === socketId);
}

export function getQueueSize(): number {
  return queue.length;
}

/**
 * Try to find a match for any players in the queue.
 * ELO window widens over time: ±300 initially, +100 every 10 seconds.
 * Returns matched pairs or null.
 */
export function tryMatch(): [QueuedPlayer, QueuedPlayer] | null {
  if (queue.length < 2) return null;

  const now = Date.now();

  for (let i = 0; i < queue.length; i++) {
    for (let j = i + 1; j < queue.length; j++) {
      const a = queue[i];
      const b = queue[j];
      const eloDiff = Math.abs(a.elo - b.elo);

      // Widen window based on how long the longer-waiting player has been in queue
      const waitTime = Math.max(now - a.joinedAt, now - b.joinedAt);
      const maxDiff = 300 + Math.floor(waitTime / 10000) * 100;

      if (eloDiff <= maxDiff) {
        // Remove both from queue
        queue.splice(j, 1);
        queue.splice(i, 1);
        return [a, b];
      }
    }
  }

  return null;
}
