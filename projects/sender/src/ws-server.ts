import express from 'express'
import expressWs from 'express-ws'
import { WebSocket } from 'ws'

export class WsServer {
  app: expressWs.Application
  constructor() {
    const { app } = expressWs(express())
    app.use('/', express.static(__dirname))
    app.listen(1870)
    this.app = app
  }

  open(regFn: (ws: WebSocket) => void) {
    this.app.ws('/', regFn)
  }
}
