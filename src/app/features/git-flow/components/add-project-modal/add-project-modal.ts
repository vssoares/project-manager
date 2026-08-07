import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../../shared/components/button/button';
import { GitFlowApi } from '../../data-access/git-flow.api';
import type { CustomProject } from '../../state/git-flow.store';

@Component({
  selector: 'app-add-project-modal',
  imports: [FormsModule, Button],
  templateUrl: './add-project-modal.html',
})
export class AddProjectModal {
  private readonly api = inject(GitFlowApi);

  readonly add = output<CustomProject>();
  readonly close = output<void>();

  protected readonly name = signal('');
  protected readonly folderPath = signal('');

  protected async browse(): Promise<void> {
    const selected = await this.api.selectFolder();
    if (!selected) return;
    this.folderPath.set(selected);
    if (!this.name().trim()) {
      this.name.set(selected.split(/[\\/]/).pop() ?? '');
    }
  }

  protected submit(): void {
    const name = this.name().trim();
    const path = this.folderPath().trim();
    if (!name || !path) return;
    this.add.emit({ name, path });
    this.close.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.close.emit();
  }
}
