import { Component, inject, signal } from '@angular/core';
import { Button } from '../../../../shared/components/button/button';
import { GitFlowStore } from '../../state/git-flow.store';
import { AddProjectModal } from '../add-project-modal/add-project-modal';
import type { CustomProject } from '../../state/git-flow.store';

@Component({
  selector: 'app-project-selector',
  imports: [Button, AddProjectModal],
  templateUrl: './project-selector.html',
})
export class ProjectSelector {
  protected readonly store = inject(GitFlowStore);
  protected readonly showModal = signal(false);

  protected onAdd(project: CustomProject): void {
    this.store.addProject(project);
  }
}
