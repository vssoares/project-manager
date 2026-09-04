import { Injectable } from '@angular/core'
import {
  api,
  isElectron,
  type RunCommandPayload,
  type UpdateAvailablePayload,
  type UpdateProgressPayload,
} from '../../../core/api'

export type { RunCommandPayload, UpdateAvailablePayload, UpdateProgressPayload }

/**
 * Thin typed wrapper over the shared `window.api` bridge, scoped to what the
 * git-flow feature needs. The bridge itself (and its type) lives in core/api.ts.
 */
@Injectable({ providedIn: 'root' })
export class ElectronApiService {
  get isElectron(): boolean {
    return isElectron
  }

  runCommand(payload: RunCommandPayload): Promise<void> {
    return api.runCommand(payload)
  }

  openGitk(projectPath: string): Promise<void> {
    return api.openGitk(projectPath)
  }

  selectFolder(): Promise<string | null> {
    return api.selectFolder()
  }

  getAppVersion(): Promise<string> {
    return api.getAppVersion()
  }

  onPsOut(cb: (text: string) => void): () => void {
    return api.onPsOut(cb)
  }

  onPsErr(cb: (text: string) => void): () => void {
    return api.onPsErr(cb)
  }

  onPsDone(cb: (code: number) => void): () => void {
    return api.onPsDone(cb)
  }

  getAutoUpdateEnabled(): Promise<boolean> {
    return api.getAutoUpdateEnabled()
  }

  setAutoUpdateEnabled(enabled: boolean): Promise<boolean> {
    return api.setAutoUpdateEnabled(enabled)
  }

  checkForUpdate(): Promise<unknown> {
    return api.checkForUpdate()
  }

  downloadUpdate(): Promise<unknown> {
    return api.downloadUpdate()
  }

  installUpdate(): Promise<void> {
    return api.installUpdate()
  }

  onUpdateAvailable(cb: (payload: UpdateAvailablePayload) => void): () => void {
    return api.onUpdateAvailable(cb)
  }

  onUpdateProgress(cb: (payload: UpdateProgressPayload) => void): () => void {
    return api.onUpdateProgress(cb)
  }

  onUpdateDownloaded(cb: () => void): () => void {
    return api.onUpdateDownloaded(cb)
  }

  onUpdateError(cb: (message: string) => void): () => void {
    return api.onUpdateError(cb)
  }
}
