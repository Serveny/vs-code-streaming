export class SocketMessage<TData> {
  constructor(public name: keyof Messages, public data: TData) {
    console.log('Message with name: ', name)
  }

  toJSON(): string {
    try {
      console.log(this)
      return JSON.stringify({ name: this.name, data: this.data })
    } catch (err: any) {
      console.error(err)
    }
    return ''
  }

  static fromJSON<T>(json: string): SocketMessage<T> {
    return JSON.parse(json)
  }
}

export class Message<T> {
  constructor(private handler: (arg: T) => void) {}

  public invoke(arg: unknown): void {
    this.handler(arg as T)
  }
}
//export type Message<T> = (arg: T) => void
//interface Message<T> { type: typeof T, handler: (arg: T) =>void}

export interface Messages {
  openDoc: string
}

export type MessagesDict = { [K in keyof Messages]: Message<Messages[K]> }
