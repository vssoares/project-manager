import { Component, computed, inject, input, output, signal } from '@angular/core';
import { AppStateService } from '../core/app-state.service';
import { UpdateService } from '../core/update/update.service';
import type { PageKey } from '../core/types';
import { ElectronApiService } from '../features/git-flow/data-access/electron-api.service';
import { Icon } from '../shared/components/icon/icon';
import { UpdateOverlay } from '../shared/components/update-overlay/update-overlay';

const NAV_TABS: { key: PageKey; label: string; hint: string }[] = [
  { key: 'files', label: 'Editor', hint: 'Editar ambientes' },
  { key: 'history', label: 'Histórico', hint: 'Versões salvas' },
  { key: 'compare', label: 'Diff', hint: 'Comparar conteúdo' },
  { key: 'gitflow', label: 'Git Flow', hint: 'Hotfix e branches' },
];

@Component({
  selector: 'app-layout',
  imports: [Icon, UpdateOverlay],
  templateUrl: './layout.html',
})
export class Layout {
  readonly app = inject(AppStateService);
  private readonly electron = inject(ElectronApiService);
  protected readonly update = inject(UpdateService);
  readonly navTabs = NAV_TABS;

  readonly page = input.required<PageKey>();
  readonly navigate = output<PageKey>();
  protected readonly appVersion = signal('');

  readonly liveEnv = computed(() => {
    const file = this.app.selectedFile();
    return file?.environments.find((e) => e.id === file.activeEnvironmentId) ?? null;
  });

  constructor() {
    this.update.init();
    if (this.electron.isElectron) {
      this.electron.getAppVersion().then((version) => this.appVersion.set(version));
    }
  }

  openFile(id: string) {
    this.app.selectFile(id);
    this.navigate.emit('files');
  }

  appliedEnv(f: { environments: { id: string; name: string; color: string }[]; activeEnvironmentId: string | null }) {
    return f.environments.find((e) => e.id === f.activeEnvironmentId) ?? null;
  }

  protected onUpdateClick(): void {
    this.update.startUpdate();
  }
}
