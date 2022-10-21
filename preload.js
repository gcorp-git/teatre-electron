const { ipcRenderer, contextBridge } = require('electron')

let done = false

const api = {
  send: (channel, data) => {
    ipcRenderer.send(channel, data)
  },
  on: (channel, listener) => {
    ipcRenderer.on(channel, listener)
  },
  off: (channel, listener) => {
    ipcRenderer.removeListener(channel, listener)
  },
}

contextBridge.exposeInMainWorld('getAPIOnce', () => !done && (done = true, api))
