import { Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { diffLines } from 'diff'
import { IconComponent } from '../components/icon.component'
import { MonacoDiffComponent } from '../components/monaco-diff.component'
import { AppStateService } from '../core/app-state.service'
import type { Environment } from '../core/types'

interface Source {
  key: string
  label: string
  content: string
  envName: string
}

function buildSources(env: Environment): Source[] {
  const sources: Source[] = [
    { key: `${env.id}:current`, label: `${env.name} (atual)`, content: env.content, envName: env.name },
  ]
  env.versions.forEach((v, i) => {
    sources.push({
      key: `${env.id}:${v.id}`,
      label: `${env.name} · v${env.versions.length - i} · ${v.message}`,
      content: v.content,
      envName: env.name,
    })
  })
  return sources
}

function countDiff(baseText: string, targetText: string) {
  const parts = diffLines(baseText, targetText)
  let additions = 0
  let deletions = 0
  for (const part of parts) {
    const n = part.value.replace(/\n$/, '').split('\n').length
    if (part.added) additions += n
    if (part.removed) deletions += n
  }
  return { additions, deletions }
}

@Component({
  selector: 'app-compare-page',
  standalone: true,
  imports: [FormsModule, IconComponent, MonacoDiffComponent],
  template: `
    @if (!app.selectedFile()) {
      <div class="h-full flex items-center justify-center text-mute text-sm">
        Selecione um arquivo para comparar versões.
      </div>
    } @else {
      <div class="h-full flex flex-col overflow-hidden min-h-0">
        <div class="px-5 py-3 border-b border-rail-edge flex items-center justify-between gap-4 flex-wrap bg-panel">
          <div class="flex items-center gap-2">
            <app-icon name="compare" [size]="16" className="text-copper" />
            <h1 class="font-headline text-base font-semibold">{{ app.selectedFile()!.name }}</h1>
          </div>
          <div class="flex items-center gap-2 text-[11px] font-code">
            @if (stats().deletions > 0) {
              <span class="px-2 py-1 rounded-md bg-danger/10 text-danger">−{{ stats().deletions }}</span>
            }
            @if (stats().additions > 0) {
              <span class="px-2 py-1 rounded-md bg-ok/10 text-ok">+{{ stats().additions }}</span>
            }
          </div>
        </div>

        <div class="px-5 py-3 flex gap-4 border-b border-rail-edge bg-panel/80">
          <label class="flex items-center gap-2 text-xs text-mute">
            <span class="uppercase tracking-[0.14em] text-[10px]">Base</span>
            <select
              [ngModel]="baseKey()"
              (ngModelChange)="baseKey.set($event)"
              class="bg-void border border-rail-edge rounded-md px-2 py-1.5 text-ink outline-none focus:border-copper font-code text-[11px] max-w-[280px]"
            >
              @for (s of allSources(); track s.key) {
                <option [value]="s.key">{{ s.label }}</option>
              }
            </select>
          </label>
          <label class="flex items-center gap-2 text-xs text-mute">
            <span class="uppercase tracking-[0.14em] text-[10px]">Alvo</span>
            <select
              [ngModel]="targetKey()"
              (ngModelChange)="targetKey.set($event)"
              class="bg-void border border-rail-edge rounded-md px-2 py-1.5 text-ink outline-none focus:border-copper font-code text-[11px] max-w-[280px]"
            >
              @for (s of allSources(); track s.key) {
                <option [value]="s.key">{{ s.label }}</option>
              }
            </select>
          </label>
        </div>

        @if (base() && target()) {
          <app-monaco-diff
            [original]="base()!.content"
            [modified]="target()!.content"
            [fileName]="app.selectedFile()!.name"
            [originalLabel]="base()!.label"
            [modifiedLabel]="target()!.label"
          />
        } @else {
          <div class="flex-1 flex items-center justify-center text-mute text-sm">
            Crie ao menos duas versões ou ambientes para comparar.
          </div>
        }
      </div>
    }
  `,
})
export class ComparePageComponent {
  readonly app = inject(AppStateService)
  readonly baseKey = signal<string | null>(null)
  readonly targetKey = signal<string | null>(null)

  readonly allSources = computed(() => {
    const file = this.app.selectedFile()
    if (!file) return [] as Source[]
    return file.environments.flatMap((e) => buildSources(e))
  })

  readonly base = computed(() => {
    const sources = this.allSources()
    return sources.find((s) => s.key === this.baseKey()) ?? sources[0] ?? null
  })

  readonly target = computed(() => {
    const sources = this.allSources()
    return sources.find((s) => s.key === this.targetKey()) ?? sources[1] ?? sources[0] ?? null
  })

  readonly stats = computed(() => {
    const b = this.base()
    const t = this.target()
    if (!b || !t) return { additions: 0, deletions: 0 }
    return countDiff(b.content, t.content)
  })
}
