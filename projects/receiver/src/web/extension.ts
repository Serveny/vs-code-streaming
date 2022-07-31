import { Diagnostic, ExtensionContext, languages, Selection, TextDocumentContentChangeEvent, TextDocumentContentProvider, Uri, window, workspace } from 'vscode'
import { Message, Messages, MessagesDict, TextOpenEvent } from '../../../shared/src/socket-message'
import { changeText, clearDoc, setSelection, showDoc } from './cmds'

export function activate(context: ExtensionContext) {
  let socket = new WebSocket('ws://localhost:1870')
  socket.onmessage = msg => handle(msg.data)
  workspace.registerTextDocumentContentProvider(scheme, textProvider)
}

const scheme = 'vscode-streaming-extension'
const textProvider = new (class implements TextDocumentContentProvider {
  private content: string = ''
  provideTextDocumentContent = (uri: Uri): string => this.content
  setContent = (str: string) => (this.content = str)
})()

const handlers: MessagesDict = {
  openDoc: new Message(onOpenDocument),
  textChange: new Message(onChangeText),
  selectionChange: new Message(onChangeSelection),
  clear: new Message(clearDoc),
  diagnosticsChange: new Message(onChangeDiagnostics),
}

function handle(json: string) {
  const msg = JSON.parse(json)
  const name = msg.name as keyof Messages
  handlers[name].invoke(msg.data)
}

async function onOpenDocument(ev: TextOpenEvent) {
  await clearDoc()
  await showDoc(ev.content, ev.languageId)
}

async function onChangeText(ev: TextDocumentContentChangeEvent[]) {
  const editor = window.activeTextEditor
  if (editor) for (const change of ev) await changeText(editor, change)
}

function onChangeSelection(ev: Selection[]) {
  const editor = window.activeTextEditor
  if (editor) for (const sel of ev) setSelection(editor, sel)
}

function onChangeDiagnostics(ev: Diagnostic[]) {
  console.log(ev)
  const editor = window.activeTextEditor
  if (editor) languages.createDiagnosticCollection('diags').set(editor.document.uri, ev)
}

export function deactivate() {}
