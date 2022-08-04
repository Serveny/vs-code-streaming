import { commands, ExtensionContext, window, workspace } from 'vscode'
import { registerEvents } from './ev-register'
import { Constants, ExtensionConfig } from './types'
import { WsServer } from './ws-server'

export let $config: ExtensionConfig
let server: WsServer | undefined

export function activate(ctx: ExtensionContext) {
  activateConfig(ctx)
  registerCommands(ctx)
  if ($config.activateOnStart) $config.enabled
  if ($config.enabled) start()
}

function activateConfig(ctx: ExtensionContext) {
  updateConfigAndEverything()

  ctx.subscriptions.push(
    workspace.onDidChangeConfiguration(ev => {
      if (ev.affectsConfiguration(Constants.SettingsPrefix)) updateConfigAndEverything()
    })
  )
}

function updateConfigAndEverything() {
  $config = workspace.getConfiguration().get(Constants.SettingsPrefix) as ExtensionConfig
  console.log('Configs: ', workspace.getConfiguration())
  console.log('$config: ', $config)
}

function registerCommands(ctx: ExtensionContext) {
  const subs = ctx.subscriptions
  subs.push(commands.registerCommand(`${Constants.SettingsPrefix}.start`, start))
  subs.push(commands.registerCommand(`${Constants.SettingsPrefix}.restart`, restart))
  subs.push(commands.registerCommand(`${Constants.SettingsPrefix}.stop`, stop))
}

function start() {
  if ($config.enabled) {
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
