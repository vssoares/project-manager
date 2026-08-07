import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../../shared/components/button/button';
import { GitFlowStore } from '../../state/git-flow.store';

@Component({
  selector: 'app-delete-branch-panel',
  imports: [FormsModule, Button],
  templateUrl: './delete-branch-panel.html',
})
export class DeleteBranchPanel {
  protected readonly store = inject(GitFlowStore);

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.store.deleteBranch();
  }
}
