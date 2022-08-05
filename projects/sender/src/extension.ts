import { commands, ExtensionContext, window, workspace } from 'vscode'
import { registerEvents } from './ev-register'
import { Constants, ExtensionConfig } from '../../shared/src/types'
import { WsServer } from './ws-server'

export let $config: ExtensionConfig
let server: WsServer | undefined

export function activate(ctx: ExtensionContext) {
  activateConfig(ctx)
  registerCommands(ctx)
  if ($config.activateOnStart) start()
}

function activateConfig(ctx: ExtensionContext) {
  updateConfigAndEverything()

  ctx.subscriptions.push(
    workspace.onDidChangeConfiguration(ev => {
      if (ev.affectsConfiguration(Constants.settingsPrefix)) updateConfigAndEverything()
    })
  )
}

function updateConfigAndEverything() {
  $config = workspace.getConfiguration().get(Constants.settingsPrefix) as ExtensionConfig
}

function registerCommands(ctx: ExtensionContext) {
  const subs = ctx.subscriptions
  subs.push(commands.registerCommand(`${Constants.settingsPrefix}.start`, start))
  subs.push(commands.registerCommand(`${Constants.settingsPrefix}.restart`, restart))
  subs.push(commands.registerCommand(`${Constants.settingsPrefix}.stop`, stop))
}

function start() {
  if (server) {
    window.showInformationMessage(`Code Streaming Screen already active under "http://localhost:${$config.port}"`)
  } else {
    server = new WsServer()
    server.open(ws => registerEvents(ws))
    window.showInformationMessage(`Code Streaming Screen Server started: "http://localhost:${$config.port}"`)
  }
}

function stop() {
  server?.close()
}

function restart() {
  stop()
  start()
}

export function deactivate() {
  stop()
}
