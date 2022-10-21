const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Root = require('./teatre/dist/server/core/root').default
const SCHEDULE = require('./dist/schedule').default

function createWindowForPlay(index) {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.setMenuBarVisibility(false)

  const root = new Root({
    Play: SCHEDULE[index],
    ready: (root) => {
      root.start()
      win.loadFile(path.join(__dirname, './teatre/dist/index.html'))
    },
    api: {
      on: (channel, listener) => ipcMain.on(channel, listener),
      off: (channel, listener) => ipcMain.removeListener(channel, listener),
      send: (event, data) => win.webContents.send(event, data),
    },
    win,
  })

  win.on('closed', () => root.stop())

  win.webContents.openDevTools() // todo: @tmp
}

function loadAllPlays() {
  for (let index = 0, len = SCHEDULE.length; index < len; index++) {
    createWindowForPlay(index)
  }
}

app.whenReady().then(() => loadAllPlays())

app.on('activate', function() {
  if (BrowserWindow.getAllWindows().length === 0) loadAllPlays()
})

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit()
})
