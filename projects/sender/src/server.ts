import express from 'express'
import expressWs from 'express-ws'
import { Server } from 'http'
import { WebSocket } from 'ws'
import { $config } from './extension'
import { engine } from 'express-handlebars'
import path from 'path'

export class CodeScreenServer {
  app: expressWs.Application
  server: Server

  constructor() {
    const { app } = expressWs(express())
    app.use('/web', express.static(path.join(__dirname, './web')))
    app.use('/product.json', express.static(path.join(__dirname, './product.json')))
    app.engine('handlebars', engine())
    app.set('view engine', 'handlebars')
    app.set('views', path.join(__dirname, './views'))
    app.get('/', (_, res) =>
      res.render('index.hbs', {
        port: $config.port,
      })
    )

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
