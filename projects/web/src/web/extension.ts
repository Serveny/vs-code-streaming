// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { Message, MessagesDict, SocketMessage } from '../../../shared/src/socket-message'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const socket = new WebSocket('ws://localhost:1870')
  socket.onmessage = msg => handle(msg.data)
}

const handlers: MessagesDict = {
  openDoc: new Message(openDocument),
}

function handle(json: string) {
  console.log('SOCKET-EVENT:', json)
  const msg = SocketMessage.fromJSON(json)
  handlers[msg.name].invoke(msg.data)
}

function openDocument(text: string) {
  console.log('openDoc', text)
}

// this method is called when your extension is deactivated
export function deactivate() {}
