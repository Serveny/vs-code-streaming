import { DiagnosticChangeEvent, Disposable, languages, TextDocument, TextDocumentChangeEvent, TextEditor, TextEditorSelectionChangeEvent, window, workspace } from 'vscode'
import { WebSocket } from 'ws'
import { IMessage, Messages } from '../../shared/src/socket-message'

export function registerEvents(ws: WebSocket) {
  const dispo: Disposable[] = [
    workspace.onDidChangeTextDocument(sendChangeText),
    window.onDidChangeActiveTextEditor(onChangeActiveDoc),
    window.onDidChangeTextEditorSelection(sendCursorChange),
    languages.onDidChangeDiagnostics(sendChangeDiagnostic),
  ]
  ws.on('close', () => dispo.forEach(item => item.dispose()))
  console.log('events registered')
  sendOpenActiveDoc()

  function send<T extends keyof Messages>(msg: IMessage<T>) {
    ws.send(JSON.stringify(msg))
  }

  function onChangeActiveDoc(editor?: TextEditor) {
    if (editor) sendOpenDoc(editor)
    else if (window.visibleTextEditors.length === 0) send({ name: 'closeDoc', data: undefined })
  }

  function sendOpenDoc(editor: TextEditor) {
    const doc = editor.document
    if (doc.uri.scheme === 'file') {
      setTimeout(
        () =>
          send({
            name: 'openDoc',
            data: {
              content: doc.getText(),
              languageId: doc.languageId,
              diagnostics: languages.getDiagnostics(doc.uri),
              selections: editor.selections as any,
            },
          }),
        100
      )
    }
  }

  function sendChangeText(ev: TextDocumentChangeEvent) {
    send({
      name: 'textChange',
      data: ev.contentChanges as any,
    })
  }

  function sendCursorChange(ev: TextEditorSelectionChangeEvent) {
    send({
      name: 'selectionChange',
      data: ev.selections as any,
    })
  }

  function sendChangeDiagnostic(ev: DiagnosticChangeEvent) {
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

  function sendOpenActiveDoc() {
    const editor = window.activeTextEditor
    if (editor) sendOpenDoc(editor)
  }
}
