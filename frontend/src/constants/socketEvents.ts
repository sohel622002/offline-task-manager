// List all socket event topics here
export const SOCKET_EVENTS = {
  POSTGRES_BINARY_PROGRESS: "postgres_binary_progress"
} as const;

// This creates a union type of all event names
export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
