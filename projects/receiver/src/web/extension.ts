import { stringify } from 'querystring'
import {
  commands,
  ExtensionContext,
  Position,
  Range,
  Selection,
  TextDocument,
  TextDocumentContentChangeEvent,
  TextDocumentContentProvider,
  TextEditor,
  TextEditorRevealType,
  Uri,
  window,
  workspace,
} from 'vscode'
import { Message, Messages, MessagesDict, TextOpenEvent } from '../../../shared/src/socket-message'

export function activate(context: ExtensionContext) {
  const socket = new WebSocket('ws://localhost:1870')
  socket.onmessage = msg => handle(msg.data)
  workspace.registerTextDocumentContentProvider(scheme, textProvider)
  closeAllDocs()
}

async function closeAllDocs() {
  console.log('close docs: ', workspace.textDocuments)
  workspace.textDocuments.forEach(td => closeDoc(td))
}

async function closeDoc(td: TextDocument) {
  console.log('close: ', td)
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

function changeText(editor: TextEditor, change: TextDocumentContentChangeEvent): Thenable<boolean> {
  let range = change.range as any
  range = new Range(range[0], range[1])
  return editor.edit(eb => {
    if (change.text === '') eb.delete(range)
    else eb.replace(range, change.text)
  })
}

async function onChangeText(ev: TextDocumentContentChangeEvent[]) {
  const editor = window.activeTextEditor
  if (editor == null) return
  for (const change of ev) await changeText(editor, change)
}

function setSelection(editor: TextEditor, sel: Selection) {
  editor.selection = new Selection(sel.anchor, sel.active)
  editor.revealRange(new Range(editor.selection.start, editor.selection.end), TextEditorRevealType.InCenter)
}

function onCursorChange(ev: Selection[]) {
  const editor = window.activeTextEditor
  if (editor == null) return
  for (const sel of ev) setSelection(editor, sel)
}

export function deactivate() {}
