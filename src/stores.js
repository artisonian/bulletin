import { writable } from "svelte/store";

export const session = writable({});
export const error = writable(null);

export function createPendingState() {
  const listeners = new Set();
  let pendingCount = 0;

  return {
    get() {
      return pendingCount > 0;
    },
    subscribe(subscription) {
      subscription(this.get());
      listeners.add(subscription);
      return () => {
        listeners.delete(subscription);
      };
    },
    async enqueue(promise) {
      pendingCount += 1;
      listeners.forEach((subscription) => {
        subscription(this.get());
      });
      try {
        await promise;
      } finally {
        pendingCount -= 1;
        listeners.forEach((subscription) => {
          subscription(this.get());
        });
      }
    },
  };
}

export const pending = createPendingState();
