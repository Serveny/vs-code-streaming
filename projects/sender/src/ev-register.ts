import { ConfigurationChangeEvent, DiagnosticChangeEvent, Disposable, languages, TextDocumentChangeEvent, TextEditor, TextEditorSelectionChangeEvent, window, workspace } from 'vscode'
import { WebSocket } from 'ws'
import { IMessage, Messages } from '../../shared/src/socket-message'
import { Constants, ExtensionConfig } from '../../shared/src/types'

abstract class EventRegister {
  constructor(private ws: WebSocket) {}

  send<T extends keyof Messages>(msg: IMessage<T>): void {
    this.ws.send(JSON.stringify(msg))
  }
}

export class ExtensionEventRegister extends EventRegister {
  constructor(ws: WebSocket) {
    console.log('Register extension events now', ws)
    super(ws)
    const dispo: Disposable[] = [
      workspace.onDidChangeConfiguration(this.sendChangeCfg.bind(this)),
      workspace.onDidChangeTextDocument(this.sendChangeText.bind(this)),
      window.onDidChangeActiveTextEditor(this.onChangeActiveDoc.bind(this)),
      window.onDidChangeTextEditorSelection(this.sendChangeCursor.bind(this)),
      languages.onDidChangeDiagnostics(this.sendChangeDiagnostic.bind(this)),
    ]
    ws.on('close', () => dispo.forEach(item => item.dispose()))
    this.sendOpenActiveDoc()
    console.log('events registered')
  }
  sendChangeCfg(ev: ConfigurationChangeEvent): void {
    if (ev.affectsConfiguration(Constants.settingsPrefix))
      this.send({
        name: 'changeCfg',
        data: workspace.getConfiguration().get(Constants.settingsPrefix) as ExtensionConfig,
      })
  }

  onChangeActiveDoc(editor?: TextEditor): void {
    if (editor) this.sendOpenDoc(editor)
    else if (window.visibleTextEditors.length === 0) this.send({ name: 'closeDoc', data: undefined })
  }

  sendOpenDoc(editor: TextEditor): void {
    const doc = editor.document
    if (doc.uri.scheme === 'file')
      setTimeout(
        () =>
          this.send({
            name: 'openDoc',
            data: {
              content: doc.getText(),
              languageId: doc.languageId,
              diagnostics: languages.getDiagnostics(doc.uri),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              selections: editor.selections as any,
            },
          }),
        100
      )
  }

  sendChangeText(ev: TextDocumentChangeEvent): void {
    this.send({
      name: 'textChange',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: ev.contentChanges as any,
    })
  }

  sendChangeCursor(ev: TextEditorSelectionChangeEvent): void {
    console.log('THIS', this)
    this.send({
      name: 'selectionChange',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: ev.selections as any,
    })
  }

  sendChangeDiagnostic(ev: DiagnosticChangeEvent): void {
    const activePath = window.activeTextEditor?.document.uri.path

    if (activePath && ev.uris.map(uri => uri.path).includes(activePath)) {
      const diags = languages.getDiagnostics().find(diag => diag[0].path === activePath)
      if (diags)
        this.send({
          name: 'diagnosticsChange',
          data: diags[1],
        })
    }
  }

  sendOpenActiveDoc(): void {
    const editor = window.activeTextEditor
    if (editor) this.sendOpenDoc(editor)
  }
}

export class WebCustomizerEventRegister extends EventRegister {
  constructor(ws: WebSocket) {
    console.log('register web customizer events now', ws)
    super(ws)
  }
}
