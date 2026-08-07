import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../../shared/components/button/button';
import { GitFlowStore } from '../../state/git-flow.store';

@Component({
  selector: 'app-hotfix-panel',
  imports: [FormsModule, Button],
  templateUrl: './hotfix-panel.html',
})
export class HotfixPanel {
  protected readonly store = inject(GitFlowStore);

  protected onVersionKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.store.execute();
  }
}
