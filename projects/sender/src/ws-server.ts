import express from 'express'
import expressWs from 'express-ws'
import { Server } from 'http'
import { WebSocket } from 'ws'
import { $config } from './extension'

export class WsServer {
  app: expressWs.Application
  server: Server

  constructor() {
    const { app } = expressWs(express())
    app.use('/', express.static(__dirname))
    this.server = app.listen($config.port)
    this.app = app
  }

  open(regFn: (ws: WebSocket) => void) {
    this.app.ws('/', regFn)
  }

  close() {
    this.server.close()
  }
}
