import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { diffLines } from 'diff';
import { AppStateService } from '../../../../core/app-state.service';
import type { Environment } from '../../../../core/types';
import { Icon } from '../../../../shared/components/icon/icon';
import { MonacoDiff } from '../../../../shared/components/monaco-diff/monaco-diff';

interface Source {
  key: string;
  label: string;
  content: string;
  envName: string;
}

function buildSources(env: Environment): Source[] {
  const sources: Source[] = [
    { key: `${env.id}:current`, label: `${env.name} (atual)`, content: env.content, envName: env.name },
  ];
  env.versions.forEach((v, i) => {
    sources.push({
      key: `${env.id}:${v.id}`,
      label: `${env.name} · v${env.versions.length - i} · ${v.message}`,
      content: v.content,
      envName: env.name,
    });
  });
  return sources;
}

function countDiff(baseText: string, targetText: string) {
  const parts = diffLines(baseText, targetText);
  let additions = 0;
  let deletions = 0;
  for (const part of parts) {
    const n = part.value.replace(/\n$/, '').split('\n').length;
    if (part.added) additions += n;
    if (part.removed) deletions += n;
  }
  return { additions, deletions };
}

@Component({
  selector: 'app-compare-page',
  imports: [FormsModule, Icon, MonacoDiff],
  templateUrl: './compare-page.html',
})
export class ComparePage {
  readonly app = inject(AppStateService);
  readonly baseKey = signal<string | null>(null);
  readonly targetKey = signal<string | null>(null);

  readonly allSources = computed(() => {
    const file = this.app.selectedFile();
    if (!file) return [] as Source[];
    return file.environments.flatMap((e) => buildSources(e));
  });

  readonly base = computed(() => {
    const sources = this.allSources();
    return sources.find((s) => s.key === this.baseKey()) ?? sources[0] ?? null;
  });

  readonly target = computed(() => {
    const sources = this.allSources();
    return sources.find((s) => s.key === this.targetKey()) ?? sources[1] ?? sources[0] ?? null;
  });

  readonly stats = computed(() => {
    const b = this.base();
    const t = this.target();
    if (!b || !t) return { additions: 0, deletions: 0 };
    return countDiff(b.content, t.content);
  });
}
