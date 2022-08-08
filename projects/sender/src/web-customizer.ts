/// <reference lib="dom" />

import { sendIdentification, WebSocketType } from './../../shared/src/socket-message'

export function start(port: number): void {
  const ws = new WebSocket(`ws://localhost:${port}`)
  console.log('Second Socket: ', ws)
  ws.onmessage = (ev): void => console.log('SOCKET-EV: ', ev)
  ws.onopen = (): void => sendIdentification(ws, WebSocketType.webCustomizer)
}
