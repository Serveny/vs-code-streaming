import { commands, ExtensionContext, TextDocument, TextDocumentContentProvider, Uri, window, workspace } from 'vscode'
import { Message, Messages, MessagesDict, TextOpenEvent } from '../../../shared/src/socket-message'

export function activate(context: ExtensionContext) {
  const socket = new WebSocket('ws://localhost:1870')
  socket.onmessage = msg => handle(msg.data)
  workspace.registerTextDocumentContentProvider(scheme, textProvider)
  closeAllDocs()
}

async function closeAllDocs() {
  workspace.textDocuments.forEach(td => closeDoc(td))
}

async function closeDoc(td: TextDocument) {
  await window.showTextDocument(td, { preview: true, preserveFocus: false })
  await commands.executeCommand('workbench.action.closeActiveEditor')
  await workspace.fs.delete(td.uri)
}

const scheme = 'vscode-streaming-extension'
const textProvider = new (class implements TextDocumentContentProvider {
  private content: string = ''
  provideTextDocumentContent = (uri: Uri): string => this.content
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
  let doc = await workspace.openTextDocument({ content: ev.content, language: ev.languageId }) // calls back into the provider
  await window.showTextDocument(doc, { preview: false })
}

export function deactivate() {}
