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

export interface TextOpenEvent {
  content: string
  languageId: string
  diagnostics: Diagnostic[]
  selections: Selection[]
}

export interface Messages {
  changeCfg: ExtensionConfig
  openDoc: TextOpenEvent
  changeDoc: TextOpenEvent
  textChange: TextDocumentContentChangeEvent[]
  selectionChange: Selection[]
  closeDoc: void
  diagnosticsChange: Diagnostic[]
}

export type MessagesDict = { [K in keyof Messages]: Message<Messages[K]> }

export interface IMessage<T extends keyof Messages> {
  name: T
  data: Messages[T]
}

export function sendIdentification(ws: WebSocket, type: WebSocketType): void {
  const msg: Identification = {
    type: type,
  }
  ws.send(JSON.stringify(msg))
}
