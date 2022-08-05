import { ExtensionContext, languages, Selection, TextDocumentContentChangeEvent, TextDocumentContentProvider, window, workspace } from 'vscode'
import { Message, Messages, MessagesDict, TextOpenEvent } from '../../../shared/src/socket-message'
import { Constants, ExtensionConfig } from '../types'
import { changeDiagnostics, changeText, clearDoc, closeAllDocs, setSelection, showDoc } from './cmds'

export let $config: ExtensionConfig | undefined
let $socket: WebSocket | undefined

export function activate(ctx: ExtensionContext) {
  activateConfig(ctx)
  openSocketConnection()
  workspace.registerTextDocumentContentProvider(scheme, textProvider)
}

function activateConfig(ctx: ExtensionContext) {
  console.log('WORKSPACE: ', workspace)

  updateConfigAndEverything()

  ctx.subscriptions.push(
    workspace.onDidChangeConfiguration(ev => {
      if (ev.affectsConfiguration(Constants.settingsPrefix)) updateConfigAndEverything()
    })
  )
}

async function updateConfigAndEverything(cfg?: ExtensionConfig) {
  $config = cfg ?? (workspace.getConfiguration().get(Constants.settingsPrefix) as ExtensionConfig)
  await closeAllDocs()
}

function openSocketConnection() {
  console.log('Open WebSocket Connection on port', $config?.port)
  if (!$config || $socket) return
  const socket = new WebSocket(`ws://localhost:${$config.port}`)
  socket.onmessage = msg => handle(msg.data)
  socket.onclose = () => setTimeout(() => openSocketConnection(), 1000)
  $socket = socket
}

const scheme = 'vscode-streaming-extension'
const textProvider = new (class implements TextDocumentContentProvider {
  private content: string = ''
  provideTextDocumentContent = (): string => this.content
  setContent = (str: string) => (this.content = str)
})()
export const diagsColl = languages.createDiagnosticCollection('vscode-streaming-diags')

const handlers: MessagesDict = {
  changeCfg: new Message(onChangeCfg),
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

function onChangeCfg(cfg: ExtensionConfig) {
  console.log('Change cfg: ', cfg)
  updateConfigAndEverything(cfg)
}

export function deactivate() {}
