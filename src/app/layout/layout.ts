import { Component, computed, inject, input, output } from '@angular/core';
import { AppStateService } from '../core/app-state.service';
import type { PageKey } from '../core/types';
import { Icon } from '../shared/components/icon/icon';

const NAV_TABS: { key: PageKey; label: string; hint: string }[] = [
  { key: 'files', label: 'Editor', hint: 'Editar ambientes' },
  { key: 'history', label: 'Histórico', hint: 'Versões salvas' },
  { key: 'compare', label: 'Diff', hint: 'Comparar conteúdo' },
  { key: 'gitflow', label: 'Git Flow', hint: 'Hotfix e branches' },
];

@Component({
  selector: 'app-layout',
  imports: [Icon],
  templateUrl: './layout.html',
})
export class Layout {
  readonly app = inject(AppStateService);
  readonly navTabs = NAV_TABS;

  readonly page = input.required<PageKey>();
  readonly navigate = output<PageKey>();

  readonly liveEnv = computed(() => {
    const file = this.app.selectedFile();
    return file?.environments.find((e) => e.id === file.activeEnvironmentId) ?? null;
  });

  openFile(id: string) {
    this.app.selectFile(id);
    this.navigate.emit('files');
  }

  appliedEnv(f: { environments: { id: string; name: string; color: string }[]; activeEnvironmentId: string | null }) {
    return f.environments.find((e) => e.id === f.activeEnvironmentId) ?? null;
  }
}
