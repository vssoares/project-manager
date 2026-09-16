import { Component, computed, inject, input, output, signal } from '@angular/core';
import { AppStateService } from '../core/app-state.service';
import { UpdateService } from '../core/update/update.service';
import type { PageKey } from '../core/types';
import { FOURDEVS_GROUPS, FOURDEVS_KEYS } from '../features/fourdevs/fourdevs.nav';
import { ElectronApiService } from '../features/git-flow/data-access/electron-api.service';
import { Icon } from '../shared/components/icon/icon';
import { UpdateOverlay } from '../shared/components/update-overlay/update-overlay';

const NAV_TABS: { key: PageKey; label: string; hint: string; icon: string }[] = [
  { key: 'files', label: 'Editor', hint: 'Editar ambientes', icon: 'edit' },
  { key: 'gitflow', label: 'Git Flow', hint: 'Hotfix e branches', icon: 'compare' },
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
  readonly fourdevsGroups = FOURDEVS_GROUPS;

  readonly page = input.required<PageKey>();
  readonly navigate = output<PageKey>();
  protected readonly appVersion = signal('');
  private readonly fourdevsManualOpen = signal<boolean | null>(null);

  readonly liveEnv = computed(() => {
    const file = this.app.selectedFile();
    return file?.environments.find((e) => e.id === file.activeEnvironmentId) ?? null;
  });

  protected readonly fourdevsOpen = computed(() => {
    const manual = this.fourdevsManualOpen();
    if (manual !== null) return manual;
    return FOURDEVS_KEYS.has(this.page());
  });

  protected readonly fourdevsActive = computed(() => FOURDEVS_KEYS.has(this.page()));

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

  toggleFourdevs(): void {
    this.fourdevsManualOpen.set(!this.fourdevsOpen());
  }

  openFourdevs(key: PageKey): void {
    this.fourdevsManualOpen.set(true);
    this.navigate.emit(key);
  }

  appliedEnv(f: { environments: { id: string; name: string; color: string }[]; activeEnvironmentId: string | null }) {
    return f.environments.find((e) => e.id === f.activeEnvironmentId) ?? null;
  }
}
