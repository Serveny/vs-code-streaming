import { ExtensionContext, window } from 'vscode'
import { registerEvents } from './ev-register'
import { WsServer } from './ws-server'

export function activate(context: ExtensionContext) {
  start()
  // context.subscriptions.push(commands.registerCommand('vs-code-streaming.startCodeStreaming', () => start()))
}

function start() {
  const server = new WsServer()
  server.open(ws => registerEvents(ws))
  window.showInformationMessage('VS Code Streaming Server started: "http://localhost:1870"')
}

export function deactivate() {}
