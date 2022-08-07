/// <reference lib="dom" />

export function startVsWebCustomizer(port: number = 1870) {
  const socket = new WebSocket(`ws://localhost:${port}`)
  console.log('Second Socket: ', socket)
  socket.onmessage = ev => console.log('SOCKET-EV: ', ev)
}
