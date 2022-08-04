import { ConfigurationTarget, workspace } from 'vscode'

export function updateGlobalSetting(settingId: string, newValue: unknown): Thenable<void> {
  const config = workspace.getConfiguration()
  return config.update(settingId, newValue, ConfigurationTarget.Global)
}
