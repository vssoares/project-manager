export interface PickedFile {
  path: string
  name: string
  content: string
}

export interface RunCommandPayload {
  action: string
  version?: string
  projectPath: string
  branchType?: string
  branchUs?: string
  branchName?: string
  force?: boolean
}

export interface UpdateAvailablePayload {
  version: string
}

export interface UpdateProgressPayload {
  percent: number
}

export interface ElectronApi {
  isElectron: true

  loadState: () => Promise<unknown>
  saveState: (state: unknown) => Promise<boolean>
  pickFile: () => Promise<PickedFile | null>
  readFile: (filePath: string) => Promise<string | null>
  writeFile: (filePath: string, content: string) => Promise<boolean>
  showInFolder: (filePath: string) => Promise<void>

  runCommand: (payload: RunCommandPayload) => Promise<void>
  openGitk: (projectPath: string) => Promise<void>
  selectFolder: () => Promise<string | null>
  getAppVersion: () => Promise<string>
  onPsOut: (cb: (text: string) => void) => () => void
  onPsErr: (cb: (text: string) => void) => () => void
  onPsDone: (cb: (code: number) => void) => () => void

  getAutoUpdateEnabled: () => Promise<boolean>
  setAutoUpdateEnabled: (enabled: boolean) => Promise<boolean>
  checkForUpdate: () => Promise<unknown>
  downloadUpdate: () => Promise<unknown>
  installUpdate: () => Promise<void>
  onUpdateAvailable: (cb: (payload: UpdateAvailablePayload) => void) => () => void
  onUpdateProgress: (cb: (payload: UpdateProgressPayload) => void) => () => void
  onUpdateDownloaded: (cb: () => void) => () => void
  onUpdateError: (cb: (message: string) => void) => () => void
}

declare global {
  interface Window {
    api?: ElectronApi
  }
}

const memoryFallback: Record<string, unknown> = {}

const noop = () => () => {}

const browserFallback: ElectronApi = {
  isElectron: true,

  async loadState() {
    const raw = localStorage.getItem('env-switcher-state')
    return raw ? JSON.parse(raw) : memoryFallback.state ?? null
  },
  async saveState(state) {
    localStorage.setItem('env-switcher-state', JSON.stringify(state))
    memoryFallback.state = state
    return true
  },
  async pickFile() {
    return null
  },
  async readFile() {
    return null
  },
  async writeFile() {
    return false
  },
  async showInFolder() {},

  async runCommand() {},
  async openGitk() {},
  async selectFolder() {
    return null
  },
  async getAppVersion() {
    return ''
  },
  onPsOut: noop,
  onPsErr: noop,
  onPsDone: noop,

  async getAutoUpdateEnabled() {
    return localStorage.getItem('autoUpdateEnabled') === 'true'
  },
  async setAutoUpdateEnabled(enabled) {
    localStorage.setItem('autoUpdateEnabled', String(enabled))
    return true
  },
  async checkForUpdate() {
    return null
  },
  async downloadUpdate() {
    return null
  },
  async installUpdate() {},
  onUpdateAvailable: noop,
  onUpdateProgress: noop,
  onUpdateDownloaded: noop,
  onUpdateError: noop,
}

export const api: ElectronApi = window.api ?? browserFallback
export const isElectron = Boolean(window.api)
