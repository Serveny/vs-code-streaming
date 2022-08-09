import { TextDocumentContentChangeEvent, Selection, Diagnostic } from 'vscode'
import { ExtensionConfig } from './types'

export class Message<T> {
  constructor(private handler: (arg: T) => void) {}

  public invoke(arg: unknown): void {
    this.handler(arg as T)
  }
}

export enum WebSocketType {
  extension,
  webCustomizer,
}

export interface Identification {
  type: WebSocketType
}

export function sendIdentification(ws: WebSocket, type: WebSocketType): void {
  const msg: Identification = {
    type: type,
  }
  ws.send(JSON.stringify(msg))
}

/* ===========================================
   Extension
   =========================================== */

export interface ExtensionMessages {
  changeCfg: ExtensionConfig
  openDoc: TextOpenEvent
  changeDoc: TextOpenEvent
  textChange: TextDocumentContentChangeEvent[]
  selectionChange: Selection[]
  closeDoc: void
  diagnosticsChange: Diagnostic[]
}

export type ExtensionMessagesDict = { [K in keyof ExtensionMessages]: Message<ExtensionMessages[K]> }

export interface IExtensionMessage<T extends keyof ExtensionMessages> {
  name: T
  data: ExtensionMessages[T]
}

export interface TextOpenEvent {
  content: string
  languageId: string
  diagnostics: Diagnostic[]
  selections: Selection[]
}

/* ===========================================
   Web Customizer 
   =========================================== */

export interface WebCustomizerMessages {
  changeCss: void
}

export type WebCustomizerMessagesDict = { [K in keyof WebCustomizerMessages]: Message<WebCustomizerMessages[K]> }

export interface IWebCustomizerMessage<T extends keyof WebCustomizerMessages> {
  name: T
  data: WebCustomizerMessages[T]
}
