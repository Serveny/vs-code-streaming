import { TextDocumentContentChangeEvent } from 'vscode'

export class Message<T> {
  constructor(private handler: (arg: T) => void) {}

  public invoke(arg: unknown): void {
    this.handler(arg as T)
  }
}

export interface TextOpenEvent {
  content: string
  languageId: string
}

export interface Messages {
  openDoc: TextOpenEvent
  textChange: TextDocumentContentChangeEvent[]
}

export type MessagesDict = { [K in keyof Messages]: Message<Messages[K]> }

export interface IMessage<T extends keyof Messages> {
  name: T
  data: Messages[T]
}
