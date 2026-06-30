export const clients = new Set<WebSocket>();

export function broadcast(data: any) {
  const message = JSON.stringify(data);

  for (const client of clients) {
    client.send(message);
  }
}