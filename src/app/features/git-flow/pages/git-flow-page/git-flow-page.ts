import { Component, inject } from '@angular/core';
import { Button } from '../../../../shared/components/button/button';
import { GitFlowStore } from '../../state/git-flow.store';
import { Header } from '../../components/header/header';
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
  protected readonly store = inject(GitFlowStore);
}
