import { Component, inject } from '@angular/core';
import { Button } from '../../../../shared/components/button/button';
import { GitFlowStore, Mode } from '../../state/git-flow.store';

interface Tab {
  id: Mode;
  label: string;
}

const TABS: Tab[] = [
  { id: 'hotfix', label: 'hotfix' },
  { id: 'newbranch', label: 'new-branch' },
  { id: 'delbranch', label: 'del-branch' },
];

@Component({
  selector: 'app-mode-tabs',
  imports: [Button],
  templateUrl: './mode-tabs.html',
})
export class ModeTabs {
  protected readonly store = inject(GitFlowStore);
  protected readonly tabs = TABS;

  protected tabClass(index: number): string {
    const base = 'px-4 py-1.5 text-[11px]';
    return index < this.tabs.length - 1 ? `${base} border-r border-rail-edge` : base;
  }
}
