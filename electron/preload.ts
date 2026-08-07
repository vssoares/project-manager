import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import type { RunCommandPayload, UpdateAvailablePayload, UpdateProgressPayload } from './types'

function subscribe<T>(channel: string, callback: (payload: T) => void) {
  const listener = (_event: IpcRendererEvent, payload: T) => callback(payload)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

const api = {
  isElectron: true as const,

  loadState: () => ipcRenderer.invoke('state:load'),
  saveState: (state: unknown) => ipcRenderer.invoke('state:save', state),

  pickFile: () => ipcRenderer.invoke('fs:pickFile'),
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('fs:writeFile', filePath, content),
  showInFolder: (filePath: string) => ipcRenderer.invoke('fs:showInFolder', filePath),

  runCommand: (payload: RunCommandPayload): Promise<void> => ipcRenderer.invoke('run-command', payload),
  openGitk: (projectPath: string): Promise<void> => ipcRenderer.invoke('open-gitk', { projectPath }),
  selectFolder: (): Promise<string | null> => ipcRenderer.invoke('select-folder'),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),

  onPsOut: (cb: (text: string) => void) => subscribe('ps:out', cb),
  onPsErr: (cb: (text: string) => void) => subscribe('ps:err', cb),
  onPsDone: (cb: (code: number) => void) => subscribe('ps:done', cb),

  checkForUpdate: (): Promise<unknown> => ipcRenderer.invoke('update-check'),
  downloadUpdate: (): Promise<unknown> => ipcRenderer.invoke('update-download'),
  installUpdate: (): Promise<void> => ipcRenderer.invoke('update-install'),
  onUpdateAvailable: (cb: (payload: UpdateAvailablePayload) => void) => subscribe('update:available', cb),
  onUpdateProgress: (cb: (payload: UpdateProgressPayload) => void) => subscribe('update:progress', cb),
  onUpdateDownloaded: (cb: () => void) => subscribe('update:downloaded', cb),
  onUpdateError: (cb: (message: string) => void) => subscribe('update:error', cb),
}

contextBridge.exposeInMainWorld('api', api)

export type ElectronApi = typeof api
