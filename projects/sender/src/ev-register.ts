import { workspace } from 'vscode'
import { WebSocket } from 'ws'
import { SocketMessage } from '../../shared/src/socket-message'

export function registerEvents(ws: WebSocket) {
  console.log('registerEvents')
  workspace.onDidOpenTextDocument(ev => {
    const text = ev.getText()
    console.log(text)
    const msg = new SocketMessage('openDoc', ev.getText().toString()).toJSON()
    console.log('MESSAGE', msg)
    ws.send(msg)
  })
}
