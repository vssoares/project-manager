import { app, BrowserWindow, ipcMain, dialog, shell, IpcMainInvokeEvent } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'node:path'
import fs from 'node:fs/promises'
import { existsSync, copyFileSync } from 'node:fs'
import os from 'node:os'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import Store from 'electron-store'
import type { RunCommandPayload } from './types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const store = new Store({ name: 'env-switcher-data' })

let mainWindow: BrowserWindow | null = null

const isDev = !app.isPackaged

function resolveIconPath() {
  const candidates = isDev
    ? [
        path.join(__dirname, '../build/icon.ico'),
        path.join(__dirname, '../build/icon.png'),
      ]
    : [
        path.join(process.resourcesPath, 'icon.ico'),
        path.join(process.resourcesPath, 'icon.png'),
        path.join(__dirname, '../build/icon.ico'),
        path.join(__dirname, '../build/icon.png'),
      ]
  return candidates.find((candidate) => existsSync(candidate))
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: 'Project Manager',
    backgroundColor: '#0a0e12',
    autoHideMenuBar: true,
    icon: resolveIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

function setupAutoUpdater(win: BrowserWindow) {
  autoUpdater.autoDownload = false

  autoUpdater.on('update-available', (info) => {
    win.webContents.send('update:available', { version: info.version })
  })
  autoUpdater.on('download-progress', (progress) => {
    win.webContents.send('update:progress', { percent: Math.floor(progress.percent) })
  })
  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update:downloaded')
  })
  autoUpdater.on('error', (err) => {
    win.webContents.send('update:error', err?.message ?? String(err))
  })
}

app.whenReady().then(() => {
  const win = createWindow()
  setupAutoUpdater(win)

  if (!isDev) {
    setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 3000)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ---- App state persistence (tracked files / environments / versions) ----

ipcMain.handle('state:load', () => {
  return store.get('appState', null)
})

ipcMain.handle('state:save', (_evt, state: unknown) => {
  store.set('appState', state)
  return true
})

// ---- Filesystem access for the real tracked file on disk ----

ipcMain.handle('fs:pickFile', async () => {
  if (!mainWindow) return null
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Selecionar arquivo para rastrear',
    properties: ['openFile', 'showHiddenFiles'],
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const filePath = result.filePaths[0]
  let content = ''
  try {
    content = await fs.readFile(filePath, 'utf-8')
  } catch {
    content = ''
  }
  return { path: filePath, name: path.basename(filePath), content }
})

ipcMain.handle('fs:readFile', async (_evt, filePath: string) => {
  try {
    return await fs.readFile(filePath, 'utf-8')
  } catch {
    return null
  }
})

ipcMain.handle('fs:writeFile', async (_evt, filePath: string, content: string) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, 'utf-8')
  return true
})

ipcMain.handle('fs:showInFolder', (_evt, filePath: string) => {
  shell.showItemInFolder(filePath)
})

// ---- Git flow / hotfix automation (hf.ps1) ----

function getHfScriptPath(): string {
  const source = isDev
    ? path.join(__dirname, '..', 'hf.ps1')
    : path.join(process.resourcesPath, 'hf.ps1')
  const dest = path.join(os.tmpdir(), 'hf_projectmanager.ps1')
  copyFileSync(source, dest)
  return dest
}

interface GitResult {
  code: number
  stdout: string
  stderr: string
}

function runGit(projectPath: string, args: string[]): Promise<GitResult> {
  return new Promise((resolve) => {
    const child = spawn('git', args, { cwd: projectPath, windowsHide: true })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => { stdout += d.toString() })
    child.stderr.on('data', (d) => { stderr += d.toString() })
    child.on('close', (code) => resolve({ code: code ?? -1, stdout, stderr }))
    child.on('error', (err) => resolve({ code: -1, stdout, stderr: String(err) }))
  })
}

ipcMain.handle('run-command', async (event: IpcMainInvokeEvent, payload: RunCommandPayload) => {
  const { action, version, projectPath, branchType, branchUs, branchName, force } = payload
  const scriptPath = getHfScriptPath()

  const args = [
    '-ExecutionPolicy', 'Bypass',
    '-NonInteractive',
    '-File', scriptPath,
    '-action', action,
  ]
  if (version) args.push('-version', version)
  if (branchType) args.push('-branchType', branchType)
  if (branchUs) args.push('-branchUs', branchUs)
  if (branchName) args.push('-branchName', branchName)
  if (force) args.push('-force')

  const sender = event.sender

  return new Promise<void>((resolve, reject) => {
    const child = spawn('powershell.exe', args, { cwd: projectPath, windowsHide: true })

    child.stdout.on('data', (data: Buffer) => {
      sender.send('ps:out', data.toString())
    })
    child.stderr.on('data', (data: Buffer) => {
      sender.send('ps:err', data.toString())
    })
    child.on('error', (err) => {
      reject(err.message)
    })
    child.on('close', (code) => {
      sender.send('ps:done', code ?? -1)
      resolve()
    })
  })
})

ipcMain.handle('open-gitk', async (_event: IpcMainInvokeEvent, { projectPath }: { projectPath: string }) => {
  const checkout = await runGit(projectPath, ['checkout', 'master'])
  if (checkout.code !== 0) throw new Error(checkout.stderr.trim())

  const pull = await runGit(projectPath, ['pull', 'origin', 'master'])
  if (pull.code !== 0) throw new Error(pull.stderr.trim())

  spawn('gitk', ['master'], { cwd: projectPath, windowsHide: true, detached: true })
})

ipcMain.handle('get-app-version', () => app.getVersion())

ipcMain.handle('select-folder', async () => {
  if (!mainWindow) return null
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

ipcMain.handle('update-install', () => {
  autoUpdater.quitAndInstall()
})

ipcMain.handle('update-check', () => autoUpdater.checkForUpdates())
ipcMain.handle('update-download', () => autoUpdater.downloadUpdate())
