// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { Message, Messages, MessagesDict, TextOpenEvent } from '../../../shared/src/socket-message'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const socket = new WebSocket('ws://localhost:1870')
  socket.onmessage = msg => handle(msg.data)
  vscode.workspace.registerTextDocumentContentProvider(scheme, textProvider)
}

const scheme = 'vscode-streaming-extension'
const textProvider = new (class implements vscode.TextDocumentContentProvider {
  private content: string = ''
  provideTextDocumentContent = (uri: vscode.Uri): string => this.content
  setContent = (str: string) => (this.content = str)
})()

const handlers: MessagesDict = {
  openDoc: new Message(openDocument),
}

function handle(json: string) {
  const msg = JSON.parse(json)
  const name = msg.name as keyof Messages
  handlers[name].invoke(msg.data)
}

async function openDocument(ev: TextOpenEvent) {
  //textProvider.setContent(ev.content)
  let doc = await vscode.workspace.openTextDocument({ content: ev.content, language: ev.languageId }) // calls back into the provider
  await vscode.window.showTextDocument(doc, { preview: false })
}

// this method is called when your extension is deactivated
export function deactivate() {}
