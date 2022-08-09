/// <reference lib="dom" />

import { Message, sendIdentification, WebCustomizerMessages, WebCustomizerMessagesDict, WebSocketType } from './../../shared/src/socket-message'

const handlers: WebCustomizerMessagesDict = {
  changeCss: new Message(onChangeCss),
}

function handle(json: string): void {
  const msg = JSON.parse(json)
  const name = msg.name as keyof WebCustomizerMessages
  handlers[name].invoke(msg.data)
}

function onChangeCss(): void {
  const el = document.querySelector('link[data-name="custom-css"]')
  el?.setAttribute('href', `custom.css?rnd=${Math.random()}`)
}

export function start(port: number): void {
  openSocketConnection(port)
}

function openSocketConnection(port: number): void {
  const ws = new WebSocket(`ws://localhost:${port}`)
  console.log('Open Web Customizer WebSocket Connection on port', port)
  ws.onopen = (): void => sendIdentification(ws, WebSocketType.webCustomizer)
  ws.onmessage = (msg): void => handle(msg.data)
  ws.onclose = (): NodeJS.Timeout => setTimeout(() => openSocketConnection(port), 1000)
}
