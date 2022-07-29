import { ExtensionContext, Selection, TextDocumentContentChangeEvent, TextDocumentContentProvider, Uri, window, workspace } from 'vscode'
import { Message, Messages, MessagesDict, TextOpenEvent } from '../../../shared/src/socket-message'
import { changeText, setSelection } from './cmds'
import { reset } from './reset'

export function activate(context: ExtensionContext) {
  reset()
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
  cursorChange: new Message(onCursorChange),
}

function handle(json: string) {
  const msg = JSON.parse(json)
  const name = msg.name as keyof Messages
  handlers[name].invoke(msg.data)
}

async function onOpenDocument(ev: TextOpenEvent) {
  let doc = await workspace.openTextDocument({ content: ev.content, language: ev.languageId })
  await window.showTextDocument(doc, { preview: false })
}

async function onChangeText(ev: TextDocumentContentChangeEvent[]) {
  const editor = window.activeTextEditor
  if (editor == null) return
  for (const change of ev) await changeText(editor, change)
}

function onCursorChange(ev: Selection[]) {
  const editor = window.activeTextEditor
  if (editor == null) return
  for (const sel of ev) setSelection(editor, sel)
}

export function deactivate() {}
