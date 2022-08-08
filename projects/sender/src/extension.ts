import { commands, ExtensionContext, window, workspace } from 'vscode'
import { ExtensionEventRegister, WebCustomizerEventRegister } from './ev-register'
import { Constants, ExtensionConfig } from '../../shared/src/types'
import { CodeScreenServer } from './server'
import { Identification, WebSocketType } from '../../shared/src/socket-message'
import { RawData, WebSocket } from 'ws'

export let $config: ExtensionConfig
let server: CodeScreenServer | undefined

export function activate(ctx: ExtensionContext): void {
  activateConfig(ctx)
  registerCommands(ctx)
  if ($config.activateOnStart) start()
}

function activateConfig(ctx: ExtensionContext): void {
  updateConfigAndEverything()

  ctx.subscriptions.push(
    workspace.onDidChangeConfiguration(ev => {
      if (ev.affectsConfiguration(Constants.settingsPrefix)) updateConfigAndEverything()
    })
  )
}

function updateConfigAndEverything(): void {
  $config = workspace.getConfiguration().get(Constants.settingsPrefix) as ExtensionConfig
}

function registerCommands(ctx: ExtensionContext): void {
  const subs = ctx.subscriptions
  subs.push(commands.registerCommand(`${Constants.settingsPrefix}.start`, start))
  subs.push(commands.registerCommand(`${Constants.settingsPrefix}.restart`, restart))
  subs.push(commands.registerCommand(`${Constants.settingsPrefix}.stop`, stop))
}

function start(): void {
  if (server) window.showInformationMessage(`Code Streaming Screen already active under "http://localhost:${$config.port}"`)
  else {
    server = new CodeScreenServer()
    server.open(identify)
    window.showInformationMessage(`Code Streaming Screen Server started: "http://localhost:${$config.port}"`)
  }
}

function identify(ws: WebSocket): void {
  const identFn = (data: RawData): void => {
    const msg = JSON.parse(data.toString()) as Identification
    if (msg.type === WebSocketType.extension) new ExtensionEventRegister(ws)
    else if (msg.type === WebSocketType.webCustomizer) new WebCustomizerEventRegister(ws)
    ws.off('message', identFn)
  }
  ws.on('message', identFn)
}

function stop(): void {
  server?.close()
}

function restart(): void {
  stop()
  start()
}

export function deactivate(): void {
  stop()
}
