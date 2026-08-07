import { Component, inject, signal } from '@angular/core';
import { ElectronApiService } from '../../data-access/electron-api.service';
import { UpdateService } from '../../../../core/update/update.service';
import { Button } from '../../../../shared/components/button/button';
import { GitFlowStore } from '../../state/git-flow.store';
import { Header } from '../../components/header/header';
import { UpdateOverlay } from '../../components/update-overlay/update-overlay';
import { ProjectSelector } from '../../components/project-selector/project-selector';
import { ModeTabs } from '../../components/mode-tabs/mode-tabs';
import { HotfixPanel } from '../../components/hotfix-panel/hotfix-panel';
import { NewBranchPanel } from '../../components/new-branch-panel/new-branch-panel';
import { DeleteBranchPanel } from '../../components/delete-branch-panel/delete-branch-panel';
import { ConsoleOutput } from '../../components/console-output/console-output';

@Component({
  selector: 'app-git-flow-page',
  imports: [
    Button,
    Header,
    UpdateOverlay,
    ProjectSelector,
    ModeTabs,
    HotfixPanel,
    NewBranchPanel,
    DeleteBranchPanel,
    ConsoleOutput,
  ],
  templateUrl: './git-flow-page.html',
})
export class GitFlowPage {
  private readonly electron = inject(ElectronApiService);

  protected readonly update = inject(UpdateService);
  protected readonly store = inject(GitFlowStore);
  protected readonly appVersion = signal('');

  constructor() {
    this.update.init();
    if (this.electron.isElectron) {
      this.electron.getAppVersion().then((version) => this.appVersion.set(version));
    }
  }
}
