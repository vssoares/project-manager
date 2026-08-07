import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../../../core/app-state.service';
import { ENV_COLORS } from '../../../../core/types';
import { CodeEditor } from '../../../../shared/components/code-editor/code-editor';
import { Icon } from '../../../../shared/components/icon/icon';
import { Modal } from '../../../../shared/components/modal/modal';

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `${min} min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

@Component({
  selector: 'app-files-page',
  imports: [FormsModule, CodeEditor, Icon, Modal],
  templateUrl: './files-page.html',
})
export class FilesPage {
  readonly app = inject(AppStateService);
  readonly colors = ENV_COLORS;
  readonly newEnvOpen = signal(false);
  readonly saveMsgOpen = signal(false);
  readonly toast = signal<string | null>(null);

  newFileName = '';
  newEnvName = '';
  newEnvColor: string = ENV_COLORS[0].color;
  versionMsg = '';

  currentEnvId(file: { environments: { id: string }[] }) {
    return this.app.selectedEnvironment()?.id ?? file.environments[0]?.id;
  }

  env(file: {
    environments: { id: string; name: string; content: string; updatedAt: number; versions: unknown[]; color: string }[];
  }) {
    const id = this.currentEnvId(file);
    return file.environments.find((e) => e.id === id) ?? null;
  }

  ago = timeAgo;
  lineCount(content: string) {
    return content.split('\n').filter(Boolean).length;
  }

  createFile() {
    this.app.addTrackedFileManual(this.newFileName || '.env');
    this.newFileName = '';
  }

  createEnv(fileId: string) {
    if (!this.newEnvName.trim()) return;
    this.app.addEnvironment(fileId, this.newEnvName.trim(), this.newEnvColor);
    this.newEnvName = '';
    this.newEnvOpen.set(false);
  }

  saveVersion(fileId: string, envId: string) {
    this.app.saveVersion(fileId, envId, this.versionMsg);
    this.versionMsg = '';
    this.saveMsgOpen.set(false);
    this.showToast('Versão salva no histórico.');
  }

  async handleApply(fileId: string) {
    const file = this.app.selectedFile();
    const env = this.env(file!);
    if (!env) return;
    if (!file?.path) {
      await this.app.linkPath(fileId);
      return;
    }
    const res = await this.app.applyToDisk(fileId, env.id);
    this.showToast(res.message);
  }

  private showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }
}
