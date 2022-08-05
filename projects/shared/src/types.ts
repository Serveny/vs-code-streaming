interface ExtensionConfigType {
  /**
   * Local code streaming screen server port
   */
  activateOnStart: boolean
  /**
   * Local code streaming screen server port
   */
  port: number
  /**
   * When enabled - shows highlighted error/warning icons in status bar.
   */
  statusBarIconsEnabled: boolean
  /**
   * Move status bar icons left or right by adjasting the number priority.
   */
  statusBarIconsPriority: number
  /**
   * Choose on which side the icons status bar is on: left or right.
   */
  statusBarIconsAlignment: 'left' | 'right'
  /**
   * When enabled - highlights status bar icons with background, when disabled - with foreground.
   */
  statusBarIconsUseBackground: boolean
}

export type ExtensionConfig = Readonly<ExtensionConfigType>

export const enum Constants {
  /**
   * Prefix used for all settings of this extension.
   */
  settingsPrefix = 'codeStreamingScreen',
}
