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
   * CSS styling config for client
   */
  styles: CssStyles
}

export type ExtensionConfig = Readonly<ExtensionConfigType>

export const enum Constants {
  /**
   * Prefix used for all settings of this extension.
   */
  settingsPrefix = 'codeStreamingScreen',
}

interface CssStyles {
  children?: CssStyles
  attributes?: object
}
