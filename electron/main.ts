import { app, BrowserWindow, Menu, MenuItem, shell } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { startBackend, stopBackend } from './backend-manager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 开发模式判断
const isDev = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL !== undefined || !app.isPackaged

let mainWindow: BrowserWindow | null = null

/**
 * 创建应用窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // 先不显示，等加载完成后再显示
  })

  // 窗口加载完成后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 加载应用
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    // 开发模式：连接到 Vite 开发服务器
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    // 开发模式下打开开发者工具
    mainWindow.webContents.openDevTools()
  } else if (isDev) {
    // 开发模式但 VITE_DEV_SERVER_URL 未设置，尝试默认端口
    const port = process.env.VITE_DEV_SERVER_PORT || 5173
    mainWindow.loadURL(`http://localhost:${port}`)
    mainWindow.webContents.openDevTools()
  } else {
    // 生产模式：加载打包后的文件
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  // 处理窗口关闭
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 配置右键菜单
  setupContextMenu()
}

/**
 * 配置上下文菜单（右键菜单）
 */
function setupContextMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '复制',
      role: 'copy',
      accelerator: 'CmdOrCtrl+C',
    },
    {
      label: '粘贴',
      role: 'paste',
      accelerator: 'CmdOrCtrl+V',
    },
    {
      label: '剪切',
      role: 'cut',
      accelerator: 'CmdOrCtrl+X',
    },
    { type: 'separator' },
    {
      label: '全选',
      role: 'selectAll',
      accelerator: 'CmdOrCtrl+A',
    },
    { type: 'separator' },
    {
      label: '撤销',
      role: 'undo',
      accelerator: 'CmdOrCtrl+Z',
    },
    {
      label: '重做',
      role: 'redo',
      accelerator: 'CmdOrCtrl+Shift+Z',
    },
  ]

  // 在渲染进程中设置上下文菜单
  app.on('web-contents-created', (_, contents) => {
    contents.on('context-menu', (event, params) => {
      const menu = Menu.buildFromTemplate(template)
      menu.popup()
    })
  })
}

/**
 * 应用启动
 */
app.whenReady().then(async () => {
  // 启动后端服务器
  await startBackend(isDev)

  // 创建窗口
  createWindow()

  // macOS 特殊处理：点击 dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', async () => {
  // 停止后端服务器
  await stopBackend()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用退出前清理
app.on('before-quit', async () => {
  await stopBackend()
})

// 处理外部链接（在默认浏览器中打开）
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })
})

