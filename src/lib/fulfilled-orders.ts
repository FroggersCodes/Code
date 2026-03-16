/**
 * In-memory store of fulfilled LemonSqueezy orders.
 * Maps product_id -> Set<username>.
 *
 * In production, replace with a real database.
 */
const fulfilledOrders = new Map<string, Set<string>>();

export function addFulfilledOrder(productId: string, username: string): void {
  if (!fulfilledOrders.has(productId)) {
    fulfilledOrders.set(productId, new Set());
  }
  fulfilledOrders.get(productId)!.add(username);
}

export function consumeFulfilledOrder(productId: string, username: string): boolean {
  const users = fulfilledOrders.get(productId);
  if (users?.has(username)) {
    users.delete(username);
    return true;
  }
  return false;
}
