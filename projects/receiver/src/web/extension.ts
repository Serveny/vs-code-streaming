import { ExtensionContext, languages, Selection, TextDocumentContentChangeEvent, TextDocumentContentProvider, Uri, window, workspace } from 'vscode'
import { Message, Messages, MessagesDict, TextOpenEvent } from '../../../shared/src/socket-message'
import { changeDiagnostics, changeText, clearDoc, setSelection, showDoc } from './cmds'

export function activate(context: ExtensionContext) {
  openSocketConnection()
  workspace.registerTextDocumentContentProvider(scheme, textProvider)
}

function openSocketConnection() {
  console.log('Open WebSocket Connection')
  const socket = new WebSocket('ws://localhost:1870')
  socket.onmessage = msg => handle(msg.data)
  socket.onclose = () => setTimeout(() => openSocketConnection(), 1000)
}

const scheme = 'vscode-streaming-extension'
const textProvider = new (class implements TextDocumentContentProvider {
  private content: string = ''
  provideTextDocumentContent = (uri: Uri): string => this.content
  setContent = (str: string) => (this.content = str)
})()
export const diagsColl = languages.createDiagnosticCollection('vscode-streaming-diags')

const handlers: MessagesDict = {
  openDoc: new Message(onOpenDocument),
  changeDoc: new Message(onChangeDoc),
  textChange: new Message(onChangeText),
  selectionChange: new Message(onChangeSelection),
  closeDoc: new Message(clearDoc),
  diagnosticsChange: new Message(changeDiagnostics),
}

function handle(json: string) {
  const msg = JSON.parse(json)
  const name = msg.name as keyof Messages
  handlers[name].invoke(msg.data)
}

async function onOpenDocument(ev: TextOpenEvent) {
  await showDoc(ev.content, ev.languageId)
  changeDiagnostics(ev.diagnostics)
  onChangeSelection(ev.selections)
}

async function onChangeDoc(ev: TextOpenEvent) {
  await showDoc(ev.content, ev.languageId)
  changeDiagnostics(ev.diagnostics)
}

async function onChangeText(ev: TextDocumentContentChangeEvent[]) {
  const editor = window.activeTextEditor
  if (editor) for (const change of ev) await changeText(editor, change)
}

function onChangeSelection(ev: Selection[]) {
  const editor = window.activeTextEditor
  if (editor) for (const sel of ev) setSelection(editor, sel)
}

export function deactivate() {}
