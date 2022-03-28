'use strict'

const path = require('path')

import {app, protocol, BrowserWindow, ipcMain} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const storage = require('electron-localStorage')
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let win=null,printWindow=null;
async function createWindow() {
  // Create the browser window.
   win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
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
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
  printWeb()
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

//打印设置(窗口打印)
async function printWeb() {
  printWindow = new BrowserWindow({
    title: '菜单打印',
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, //开启渲染进程中调用模块  即require
      contextIsolation: false,
      preload:path.join(__static, 'print.js')
    }
  })
  const fileUrl = path.join(__static, 'print.html')
  printWindow.loadFile(fileUrl)
  initPrintEvent()
  // if (process.env.WEBPACK_DEV_SERVER_URL) {
  //   // Load the url of the dev server if in development mode
  //   await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
  //   if (!process.env.IS_TEST) printWindow.webContents.openDevTools()
  // } else {
  //   createProtocol('app')
  //   // Load the index.html when not in development
  //   printWindow.loadURL('app://./print.html')
  // }
}

function initPrintEvent() {
  ipcMain.on('print-start', (event, obj,flag) => {
    console.log('print-start')
    printWindow.webContents.send('print-edit', obj,flag);
  })
  //获得打印机列表
  ipcMain.on('allPrint',()=>{
    const printers = printWindow.webContents.getPrinters();
    win.send('printName',printers)
  })
  ipcMain.on('do', (event, deviceName,flag) => {
    const printers = printWindow.webContents.getPrinters();
      console.log('flag:'+flag)
    console.log(deviceName)
      printers.forEach(element => {
        //实际情况是status为0，打印机是正常的，这里为了走进来，所以写了3
        if (element.name === deviceName && element.status != 3) {
          win.send('print-error', deviceName + '打印机异常');
          printWindow.webContents.print({
              silent: flag||false,
              printBackground: false,
              deviceName: ''
            },
            (data) => {
              console.log("回调", data);
            });
        } else if (element.name === deviceName && element.status) {
          console.log(element.status+'-'+deviceName)
          printWindow.webContents.print({
              silent: flag||false,
              printBackground: false,
              deviceName: element.name
            },
            (data) => {
              console.log("回调", data);

            });
        }else {
          printWindow.webContents.print({
              silent:false,
              printBackground: false,
              deviceName: element.name
            },
            (data) => {
              console.log("回调", data);

            });
        }
      });
  })
}
