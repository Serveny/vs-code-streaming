import { TextDocument, TextDocumentChangeEvent, TextEditorSelectionChangeEvent, window, workspace } from 'vscode'
import { WebSocket } from 'ws'
import { IMessage, Messages } from '../../shared/src/socket-message'

export function registerEvents(ws: WebSocket) {
  function send<T extends keyof Messages>(msg: IMessage<T>) {
    ws.send(JSON.stringify(msg))
  }

  function onOpenText(ev: TextDocument) {
    console.log('OnOpenText')
    if (ev.languageId !== 'plaintext')
      send({
        name: 'openDoc',
        data: {
          content: ev.getText(),
          languageId: ev.languageId,
        },
      })
  }

  function onChangeText(ev: TextDocumentChangeEvent) {
    send({
      name: 'textChange',
      data: ev.contentChanges as any,
    })
  }

  function onCursorChange(ev: TextEditorSelectionChangeEvent) {
    send({
      name: 'cursorChange',
      data: ev.selections as any,
    })
  }

  function onCloseDoc() {
    const activeDoc = window.activeTextEditor?.document
    if (activeDoc) onOpenText(activeDoc)
    else send({ name: 'clear', data: undefined })
  }

  function openActiveDoc() {
    const doc = window.activeTextEditor?.document
    if (doc) onOpenText(doc)
  }

  console.log('registerEvents')
  workspace.onDidOpenTextDocument(onOpenText)
  workspace.onDidChangeTextDocument(onChangeText)
  workspace.onDidCloseTextDocument(onCloseDoc)
  window.onDidChangeTextEditorSelection(onCursorChange)

  openActiveDoc()
}
