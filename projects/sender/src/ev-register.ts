import { DiagnosticChangeEvent, languages, TextDocument, TextDocumentChangeEvent, TextEditorSelectionChangeEvent, window, workspace } from 'vscode'
import { WebSocket } from 'ws'
import { IMessage, Messages } from '../../shared/src/socket-message'

export function registerEvents(ws: WebSocket) {
  workspace.onDidOpenTextDocument(onOpenText)
  workspace.onDidChangeTextDocument(onChangeText)
  workspace.onDidCloseTextDocument(onCloseDoc)
  window.onDidChangeTextEditorSelection(onCursorChange)
  languages.onDidChangeDiagnostics(onChangeDiagnostic)

  openActiveDoc()
  console.log('events registered')

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

  function onCloseDoc() {
    const activeDoc = window.activeTextEditor?.document
    if (activeDoc) onOpenText(activeDoc)
    else send({ name: 'clear', data: undefined })
  }

  function onCursorChange(ev: TextEditorSelectionChangeEvent) {
    send({
      name: 'selectionChange',
      data: ev.selections as any,
    })
  }

  function onChangeDiagnostic(ev: DiagnosticChangeEvent) {
    const activePath = window.activeTextEditor?.document.uri.path
    if (activePath && ev.uris.map(uri => uri.path).includes(activePath)) {
      const diags = languages.getDiagnostics().find(diag => diag[0].path == activePath)
      if (diags)
        send({
          name: 'diagnosticsChange',
          data: diags[1],
        })
    }
  }

  function openActiveDoc() {
    const doc = window.activeTextEditor?.document
    if (doc) onOpenText(doc)
  }
}
