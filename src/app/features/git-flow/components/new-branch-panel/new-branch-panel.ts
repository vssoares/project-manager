import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../../shared/components/button/button';
import { GitFlowStore } from '../../state/git-flow.store';

@Component({
  selector: 'app-new-branch-panel',
  imports: [FormsModule, Button],
  templateUrl: './new-branch-panel.html',
})
export class NewBranchPanel {
  protected readonly store = inject(GitFlowStore);

  protected onNameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.store.createBranch();
  }
}
