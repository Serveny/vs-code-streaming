import { ExtensionContext, commands, window } from 'vscode'
import { WsServer } from './ws-server'
import { registerEvents } from './ev-register'

export function activate(context: ExtensionContext) {
  const disposable = commands.registerCommand('vs-code-streaming.startCodeStreaming', () => start())
  context.subscriptions.push(disposable)
}

function start() {
  const server = new WsServer()
  server.open(ev => registerEvents(ev))
  window.showInformationMessage('VS Code Streaming Server started: "http://localhost:1870"')
}

// this method is called when your extension is deactivated
export function deactivate() {}
