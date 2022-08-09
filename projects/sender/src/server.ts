import express from 'express'
import expressWs from 'express-ws'
import { Server } from 'http'
import { WebSocket } from 'ws'
import { $config } from './extension'
import { engine } from 'express-handlebars'
import path from 'path'
import { toCSS } from 'cssjson'

export class CodeScreenServer {
  app: expressWs.Application
  server: Server

  constructor() {
    const { app } = expressWs(express())
    app.use('/web', express.static(path.join(__dirname, './web')))
    app.use('/custom.css', (_, res) => {
      res.attachment('custom.css')
      res.type('css')
      res.send(toCSS($config.styles))
    })
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

  open(regFn: (ws: WebSocket) => void): void {
    this.app.ws('/', regFn)
  }

  close(): void {
    this.server.close()
  }
}
