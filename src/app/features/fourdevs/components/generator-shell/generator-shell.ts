import { Component, input, output, signal } from '@angular/core'
import { Icon } from '../../../../shared/components/icon/icon'

@Component({
  selector: 'app-generator-shell',
  imports: [Icon],
  template: `
    <div class="h-full overflow-y-auto scrollbar-thin">
      <div class="px-8 py-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 class="font-headline text-xl font-semibold tracking-tight">{{ title() }}</h1>
          <p class="text-sm text-mute mt-1">{{ description() }}</p>
        </div>

        <div class="rounded-md border border-rail-edge bg-panel p-5 space-y-4">
          <ng-content select="[options]" />

          <div class="flex items-center gap-2 pt-1">
            <button
              type="button"
              class="bg-copper text-on-primary px-4 py-2 rounded-md text-xs font-semibold tracking-wide hover:bg-copper-dim transition-colors"
              (click)="generate.emit()"
            >
              Gerar
            </button>
            @if (results().length > 0) {
              <button
                type="button"
                class="border border-rail-edge text-mute hover:text-ink hover:border-mute px-3 py-2 rounded-md text-xs transition-colors flex items-center gap-1.5"
                (click)="copyAll()"
              >
                <app-icon name="check" [size]="12" />
                {{ copiedAll() ? 'Copiado!' : 'Copiar todos' }}
              </button>
            }
          </div>
        </div>

        @if (results().length > 0) {
          <div class="rounded-md border border-rail-edge bg-panel overflow-hidden">
            <div class="px-4 py-2 border-b border-rail-edge text-[10px] uppercase tracking-[0.18em] text-mute">
              Resultado
            </div>
            <ul class="divide-y divide-rail-edge/60">
              @for (item of results(); track $index) {
                <li class="flex items-center gap-3 px-4 py-2.5 group">
                  <code class="flex-1 font-code text-sm text-ink break-all">{{ item }}</code>
                  <button
                    type="button"
                    class="shrink-0 text-[10px] uppercase tracking-widest text-mute hover:text-copper transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    (click)="copyOne(item, $index)"
                  >
                    {{ copiedIndex() === $index ? 'copiado' : 'copiar' }}
                  </button>
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </div>
  `,
})
export class GeneratorShell {
  readonly title = input.required<string>()
  readonly description = input.required<string>()
  readonly results = input<string[]>([])
  readonly generate = output<void>()

  protected readonly copiedIndex = signal<number | null>(null)
  protected readonly copiedAll = signal(false)

  protected async copyOne(text: string, index: number): Promise<void> {
    await navigator.clipboard.writeText(text)
    this.copiedIndex.set(index)
    this.copiedAll.set(false)
    setTimeout(() => this.copiedIndex.set(null), 1500)
  }

  protected async copyAll(): Promise<void> {
    await navigator.clipboard.writeText(this.results().join('\n'))
    this.copiedAll.set(true)
    this.copiedIndex.set(null)
    setTimeout(() => this.copiedAll.set(false), 1500)
  }
}
