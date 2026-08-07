import { Injectable, inject, signal } from '@angular/core';
import { ElectronApiService } from '../../features/git-flow/data-access/electron-api.service';

export interface UpdateInfo {
  version: string;
  progress: number;
  status: 'downloading' | 'installing';
}

/**
 * Owns the auto-update flow (electron-updater over IPC): checks for updates
 * shortly after boot, and drives the download/install lifecycle.
 */
@Injectable({ providedIn: 'root' })
export class UpdateService {
  private readonly electron = inject(ElectronApiService);

  readonly pendingVersion = signal<string | null>(null);
  readonly updateError = signal('');
  readonly isUpdating = signal(false);
  readonly updateInfo = signal<UpdateInfo | null>(null);

  private initialized = false;

  init(): void {
    if (this.initialized || !this.electron.isElectron) return;
    this.initialized = true;

    this.electron.onUpdateAvailable(({ version }) => this.pendingVersion.set(version));

    this.electron.onUpdateError((msg) => {
      this.updateError.set(msg ? `verificação: ${msg}` : 'verificação de atualização falhou');
    });

    this.electron.onUpdateProgress(({ percent }) => {
      const current = this.updateInfo();
      if (current) this.updateInfo.set({ ...current, progress: percent });
    });

    this.electron.onUpdateDownloaded(() => {
      const current = this.updateInfo();
      if (current) this.updateInfo.set({ ...current, progress: 100, status: 'installing' });
      this.electron.installUpdate();
    });

    setTimeout(() => {
      this.electron.checkForUpdate().catch(() => {});
    }, 3000);
  }

  async startUpdate(): Promise<void> {
    const version = this.pendingVersion();
    if (!version || this.isUpdating()) return;

    this.isUpdating.set(true);
    this.pendingVersion.set(null);

    try {
      this.updateInfo.set({ version, progress: 0, status: 'downloading' });
      await this.electron.downloadUpdate();
    } catch (err) {
      this.updateInfo.set(null);
      this.isUpdating.set(false);
      this.updateError.set((err as Error)?.message || 'falha ao atualizar');
    }
  }

  dismissError(): void {
    this.updateError.set('');
  }
}
