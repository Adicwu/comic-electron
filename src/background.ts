'use strict'

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  Menu,
  Tray,
  BrowserView
} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { WEB_NAME } from './common/static'

const path = require('path')
const iconPath = path.join(__static, 'android-chrome-192x192.png')
const isDevelopment = process.env.NODE_ENV !== 'production'
let indexWindow: BrowserWindow | null
let mainWindow: BrowserWindow | null
let tray: Tray | null

const hideWindow = () => indexWindow && indexWindow.hide()
const closeWindow = () => indexWindow && indexWindow.close()
const showWindow = () => indexWindow && indexWindow.show()

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

function createTray() {
  const tray = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      role: 'quit'
    }
  ])
  // 鼠标左键
  tray.on('click', showWindow)
  tray.setToolTip(WEB_NAME)
  tray.setContextMenu(contextMenu)
  return tray
}
async function createIndexWindow() {
  const windowConfig = {
    width: 1600,
    height: 900,
    resizable: false,
    frame: false,
    show: false,
    transparent: true,
    icon: iconPath,
    webPreferences: {
      // nodeIntegration: process.env
      //   .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: true,
      contextIsolation: false
    }
  }
  const win = new BrowserWindow(windowConfig)
  const mask = new BrowserView()
  win.setBrowserView(mask)
  mask.setBounds({
    x: 0,
    y: 0,
    width: windowConfig.width,
    height: windowConfig.height
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    mask.webContents.loadURL(
      process.env.WEBPACK_DEV_SERVER_URL + '/loading.html'
    )
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    mask.webContents.loadURL('app://./loading.html')
    win.loadURL('app://./index.html')
  }

  // 显示窗口
  mask.webContents.on('dom-ready', () => {
    console.log('dom-ready', new Date())
    win.show()
  })

  ipcMain.on('indexWindowLoading:close', () => {
    win.removeBrowserView(mask)
  })

  return win
}
// todo 布局修改 窗口独立
async function createMainWindow(id: ComicId) {
  const path =
    process.env.NODE_ENV === 'development'
      ? `http://localhost:8080/comicmain/${id}`
      : `file://${__dirname}/comicmain/${id}`

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    resizable: false,
    frame: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env
      //   .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // const size = screen.getPrimaryDisplay().workAreaSize
  // const { y = 0 } = tray ? tray.getBounds() : null
  // const { height, width } = mainWindow.getBounds()
  // const yPosition = process.platform === 'darwin' ? y : y - height
  // mainWindow.setBounds({
  //   x: size.width - width,
  //   y: yPosition,
  //   height,
  //   width
  // })

  if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  mainWindow.setAlwaysOnTop(true)
  mainWindow.loadURL(path)

  mainWindow.show()
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createIndexWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS3_DEVTOOLS)
  //   } catch (e) {
  //     console.error('Vue Devtools failed to install:', e)
  //   }
  // }
  tray = createTray()
  indexWindow = await createIndexWindow()
})

ipcMain.on('indexWindow:hide', hideWindow)
ipcMain.on('indexWindow:close', closeWindow)
ipcMain.on('mainWindow:open', (_, id: ComicId) => {
  createMainWindow(id)
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
