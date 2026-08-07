import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../../../core/app-state.service';
import { Icon } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-settings-page',
  imports: [FormsModule, Icon],
  templateUrl: './settings-page.html',
})
export class SettingsPage {
  readonly app = inject(AppStateService);
  readonly editingId = signal<string | null>(null);
  editingName = '';
  newName = '';

  startRename(id: string, name: string) {
    this.editingId.set(id);
    this.editingName = name;
  }

  commitRename(id: string, fallback: string) {
    if (this.editingId() !== id) return;
    this.app.renameTrackedFile(id, this.editingName || fallback);
    this.editingId.set(null);
  }

  createBlank() {
    if (!this.newName.trim()) return;
    this.app.addTrackedFileManual(this.newName.trim());
    this.newName = '';
  }

  remove(id: string, name: string) {
    if (confirm(`Remover "${name}" e todo o seu histórico?`)) {
      this.app.removeTrackedFile(id);
    }
  }
}
