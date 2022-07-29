import { ExtensionContext, window } from 'vscode'
import { WsServer } from './ws-server'
import { registerEvents } from './ev-register'

export function activate(context: ExtensionContext) {
  start()
  // context.subscriptions.push(commands.registerCommand('vs-code-streaming.startCodeStreaming', () => start()))
}

function start() {
  const server = new WsServer()
  server.open(ev => registerEvents(ev))
  window.showInformationMessage('VS Code Streaming Server started: "http://localhost:1870"')
}

export function deactivate() {}
