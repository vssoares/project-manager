import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../../../core/app-state.service';
import type { Version } from '../../../../core/types';
import { Icon } from '../../../../shared/components/icon/icon';

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function lineDiffSummary(a: string, b: string) {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const setA = new Set(aLines);
  const setB = new Set(bLines);
  return {
    additions: bLines.filter((l) => !setA.has(l)).length,
    deletions: aLines.filter((l) => !setB.has(l)).length,
  };
}

@Component({
  selector: 'app-history-page',
  imports: [FormsModule, Icon],
  templateUrl: './history-page.html',
})
export class HistoryPage {
  readonly app = inject(AppStateService);
  filter = '';
  readonly filterSig = signal('');
  readonly format = formatDate;

  readonly currentEnvId = computed(
    () => this.app.selectedEnvironment()?.id ?? this.app.selectedFile()?.environments[0]?.id ?? null,
  );

  readonly versions = computed(() => {
    const env = this.app.selectedEnvironment() ?? this.app.selectedFile()?.environments[0] ?? null;
    const q = this.filterSig().toLowerCase();
    return (env?.versions ?? []).filter((v) => v.message.toLowerCase().includes(q));
  });

  diffAt(i: number) {
    const list = this.versions();
    const prev = list[i + 1];
    if (!prev) return null;
    return lineDiffSummary(prev.content, list[i].content);
  }

  restore(v: Version) {
    const file = this.app.selectedFile();
    const env = this.app.selectedEnvironment() ?? file?.environments[0];
    if (!file || !env) return;
    this.app.restoreVersion(file.id, env.id, v.id);
  }
}
