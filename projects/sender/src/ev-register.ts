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

  console.log('registerEvents')
  workspace.onDidOpenTextDocument(onOpenText)
  workspace.onDidChangeTextDocument(onChangeText)
  window.onDidChangeTextEditorSelection(onCursorChange)
}
