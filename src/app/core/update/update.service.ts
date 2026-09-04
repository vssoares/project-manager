import { Injectable, inject, signal } from '@angular/core';
import { ElectronApiService } from '../../features/git-flow/data-access/electron-api.service';

export interface UpdateInfo {
  version: string;
  progress: number;
  status: 'downloading' | 'installing';
}

/**
 * Auto-update flow: asks once to enable automatic updates, then installs
 * future releases without prompting again.
 */
@Injectable({ providedIn: 'root' })
export class UpdateService {
  private readonly electron = inject(ElectronApiService);

  readonly pendingVersion = signal<string | null>(null);
  readonly updateError = signal('');
  readonly isUpdating = signal(false);
  readonly updateInfo = signal<UpdateInfo | null>(null);

  private initialized = false;
  private autoUpdateEnabled = false;

  init(): void {
    if (this.initialized || !this.electron.isElectron) return;
    this.initialized = true;

    void this.bootstrap();
  }

  async enableAutoUpdateAndInstall(): Promise<void> {
    const version = this.pendingVersion();
    if (!version || this.isUpdating()) return;

    await this.electron.setAutoUpdateEnabled(true);
    this.autoUpdateEnabled = true;
    this.pendingVersion.set(null);
    await this.startUpdate(version);
  }

  dismissPrompt(): void {
    this.pendingVersion.set(null);
  }

  dismissError(): void {
    this.updateError.set('');
  }

  private async bootstrap(): Promise<void> {
    this.autoUpdateEnabled = await this.electron.getAutoUpdateEnabled();

    this.electron.onUpdateAvailable(({ version }) => {
      if (this.autoUpdateEnabled) {
        void this.startUpdate(version);
      } else {
        this.pendingVersion.set(version);
      }
    });

    this.electron.onUpdateError((msg) => {
      this.updateInfo.set(null);
      this.isUpdating.set(false);
      this.updateError.set(msg ? `atualização: ${msg}` : 'falha ao atualizar');
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
      if (!this.electron.isElectron) return
      this.electron.checkForUpdate().catch(() => {});
    }, 3000);
  }

  private async startUpdate(version: string): Promise<void> {
    if (!version || this.isUpdating()) return;

    this.isUpdating.set(true);
    this.updateError.set('');

    try {
      this.updateInfo.set({ version, progress: 0, status: 'downloading' });
      await this.electron.downloadUpdate();
    } catch (err) {
      this.updateInfo.set(null);
      this.isUpdating.set(false);
      this.updateError.set((err as Error)?.message || 'falha ao atualizar');
    }
  }
}
