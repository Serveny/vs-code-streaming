import express from 'express'
import expressWs from 'express-ws'
import { Server } from 'http'
import { WebSocket } from 'ws'
import { $config } from './extension'
import path from 'path'
import { toCSS } from 'cssjson'
import { indexHTML } from './index-html'

export class CodeScreenServer {
  app: expressWs.Application
  server: Server

  constructor() {
    const { app } = expressWs(express())
    app.use('/web', express.static(path.join(__dirname, './web')))
    app.use('/web/custom.css', (_, res) => {
      res.attachment('custom.css')
      res.type('css')
      res.send(toCSS($config.styles))
    })
    app.use('/product.json', express.static(path.join(__dirname, './web/product.json')))
    app.get('/', (_, res) => res.send(indexHTML($config.port)))

    this.server = app.listen($config.port)
    this.app = app
  }

  open(regFn: (ws: WebSocket) => void): void {
    this.app.ws('/', regFn)
  }

  close(): void {
    this.server.close()
  }
}
