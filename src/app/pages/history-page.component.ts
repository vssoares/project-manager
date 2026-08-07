import { Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IconComponent } from '../components/icon.component'
import { AppStateService } from '../core/app-state.service'
import type { Version } from '../core/types'

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function lineDiffSummary(a: string, b: string) {
  const aLines = a.split('\n')
  const bLines = b.split('\n')
  const setA = new Set(aLines)
  const setB = new Set(bLines)
  return {
    additions: bLines.filter((l) => !setA.has(l)).length,
    deletions: aLines.filter((l) => !setB.has(l)).length,
  }
}

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    @if (!app.selectedFile()) {
      <div class="h-full flex items-center justify-center text-mute text-sm">
        Selecione um arquivo para ver o histórico.
      </div>
    } @else {
      <div class="h-full flex flex-col overflow-hidden">
        <div class="px-5 py-4 border-b border-rail-edge flex items-center justify-between gap-4 bg-panel">
          <div>
            <h1 class="font-headline text-lg font-semibold tracking-tight">Histórico</h1>
            <p class="text-xs text-mute mt-0.5">
              Versões de <span class="font-code text-copper">{{ app.selectedFile()!.name }}</span>
            </p>
          </div>
          <div class="flex items-center gap-1 bg-void border border-rail-edge rounded-md px-2 py-1.5">
            <app-icon name="search" [size]="14" className="text-mute" />
            <input
              [(ngModel)]="filter"
              (ngModelChange)="filterSig.set($event)"
              placeholder="Filtrar versões…"
              class="bg-transparent outline-none text-xs text-ink w-44"
            />
          </div>
        </div>

        <div class="flex-1 overflow-hidden flex">
          <div class="w-52 shrink-0 border-r border-rail-edge p-3 space-y-1 overflow-y-auto scrollbar-thin bg-panel">
            @for (e of app.selectedFile()!.environments; track e.id) {
              <button
                type="button"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-left transition-colors"
                [class.bg-rail]="e.id === currentEnvId()"
                [class.text-copper]="e.id === currentEnvId()"
                [class.text-mute]="e.id !== currentEnvId()"
                (click)="app.selectEnvironment(e.id)"
              >
                <span class="w-2 h-2 rounded-full" [style.background]="e.color"></span>
                {{ e.name }}
                <span class="ml-auto font-code opacity-60">{{ e.versions.length }}</span>
              </button>
            }
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin p-6">
            @if (versions().length === 0) {
              <div class="text-sm text-mute max-w-md leading-relaxed">
                Nenhuma versão salva para
                <span class="text-ink">{{ app.selectedEnvironment()?.name }}</span>. Use
                <span class="text-copper">Salvar versão</span> no Editor.
              </div>
            } @else {
              <div class="relative pl-6 max-w-2xl">
                <div class="absolute left-[7px] top-2 bottom-2 w-px bg-rail-edge"></div>
                @for (v of versions(); track v.id; let i = $index) {
                  <div class="relative mb-5">
                    <span class="absolute -left-6 top-4 w-3.5 h-3.5 rounded-full bg-panel border-2 border-copper"></span>
                    <div class="rounded-md border border-rail-edge bg-panel p-4">
                      <div class="flex items-center justify-between mb-1">
                        <div class="text-xs text-mute">{{ format(v.createdAt) }}</div>
                        <span class="font-code text-[11px] text-mute bg-void border border-rail-edge px-2 py-0.5 rounded">
                          {{ v.id.slice(0, 7) }}
                        </span>
                      </div>
                      <div class="text-sm text-ink font-medium mb-2">{{ v.message }}</div>
                      @if (diffAt(i); as diff) {
                        <div class="flex items-center gap-3 text-[11px] font-code mb-2">
                          @if (diff.additions > 0) {
                            <span class="text-ok">+{{ diff.additions }}</span>
                          }
                          @if (diff.deletions > 0) {
                            <span class="text-danger">−{{ diff.deletions }}</span>
                          }
                          @if (diff.additions === 0 && diff.deletions === 0) {
                            <span class="text-mute">sem mudanças de linha</span>
                          }
                        </div>
                      }
                      <div class="flex items-center gap-2 mt-2">
                        @if (app.selectedEnvironment()?.content === v.content) {
                          <span class="text-xs px-3 py-1.5 rounded-md bg-ok/10 text-ok flex items-center gap-1">
                            <app-icon name="check" [size]="13" /> Versão atual
                          </span>
                        } @else {
                          <button
                            type="button"
                            class="border border-rail-edge text-ink px-3 py-1.5 rounded-md hover:border-copper hover:text-copper transition-colors text-xs flex items-center gap-1.5"
                            (click)="restore(v)"
                          >
                            <app-icon name="restore" [size]="13" /> Restaurar esta versão
                          </button>
                        }
                        @if (i === 0 && app.selectedEnvironment()?.content !== v.content) {
                          <span class="text-[11px] text-mute opacity-70">mais recente salva</span>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class HistoryPageComponent {
  readonly app = inject(AppStateService)
  filter = ''
  readonly filterSig = signal('')
  readonly format = formatDate

  readonly currentEnvId = computed(
    () => this.app.selectedEnvironment()?.id ?? this.app.selectedFile()?.environments[0]?.id ?? null,
  )

  readonly versions = computed(() => {
    const env =
      this.app.selectedEnvironment() ?? this.app.selectedFile()?.environments[0] ?? null
    const q = this.filterSig().toLowerCase()
    return (env?.versions ?? []).filter((v) => v.message.toLowerCase().includes(q))
  })

  diffAt(i: number) {
    const list = this.versions()
    const prev = list[i + 1]
    if (!prev) return null
    return lineDiffSummary(prev.content, list[i].content)
  }

  restore(v: Version) {
    const file = this.app.selectedFile()
    const env = this.app.selectedEnvironment() ?? file?.environments[0]
    if (!file || !env) return
    this.app.restoreVersion(file.id, env.id, v.id)
  }
}
