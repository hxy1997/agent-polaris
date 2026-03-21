export function createClientId(prefix = "id"): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) {
    return `${prefix}-${randomId}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
