#!/usr/bin/env electron

const {app, Menu, BrowserWindow, Tray} = require('electron')
const url = require('url')
const path = require('path')
const yaml = require('js-yaml')
const fs = require('fs')
const os = require('os')

global.EOL = os.EOL

const help = `-i, --interval <n>         Interval in minutes to query Stack Overflow for new questions. max: 60, min: 0.5
-t, --tags [tags]          Comma separated tags to filter questions by. Must match tags from the SOF tag list.
-u, --username [username]  Stack Overflow (Google) Username or Email
-p, --password [password]  Stack Overflow (Google) Password
-c, --config               Use username and password from when last specified. Saved in config.yaml
--show-config              Show saved username and password
-h, --help                 output usage information\r\n`

/* Keep a global reference of the window object, if you don't, the window will
be closed automatically when the JavaScript object is garbage collected. */
let tray = null
let mainWindow

function runHeadless () {
  mainWindow = new BrowserWindow({show: false, title: 'Stack Overflow Notifier'})
  tray = new Tray(path.join(__dirname, '../images/sof.png'))

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../static/headless.html'),
    protocol: 'file:'
  }))

  const contextMenu = Menu.buildFromTemplate([
    {label: 'Quit',
      click: () => {
        mainWindow.close()
      }}
  ])

  tray.setContextMenu(contextMenu)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createWindow () {
  let args = process.argv
  if (args.length <= 5 && (args[2] !== '--help' && args[2] !== '-h') && args[2] !== '--show-config') {
    process.stdout.write(`Insufficient arguments. Run --help for more information${global.EOL}`)
    process.exit(0)
  } else {
    // noinspection FallThroughInSwitchStatementJS
    switch (args[2]) {
      case '--help':
      case '-h':
        process.stdout.write(help)
        process.exit(0)

      case '--show-config':
        let confPath = path.join(__dirname, '../../config.yaml')
        if (!fs.existsSync(confPath)) {
          process.stdout.write(`Cannot find config file at ${confPath}${global.EOL}`)
        } else {
          let config = yaml.safeLoad(fs.readFileSync(confPath))
          process.stdout.write(`Username: ${config.username}${global.EOL}Password: ${config.password}${global.EOL}`)
        }
        process.exit(0)

      default:
        runHeadless(args)
    }
  }
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
