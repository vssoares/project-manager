import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ToolShell } from '../../components/tool-shell/tool-shell'
import { dateDiff } from '../../data-access/generators'

@Component({
  selector: 'app-date-diff-page',
  imports: [FormsModule, ToolShell],
  template: `
    <app-tool-shell title="Diferença de datas" description="Calcula o intervalo entre duas datas/horas.">
      <div class="rounded-md border border-rail-edge bg-panel p-5 space-y-4">
        <div class="flex flex-wrap gap-3">
          <label class="text-xs text-mute">
            De
            <input type="datetime-local" [(ngModel)]="from" class="mt-1 block bg-void border border-rail-edge rounded-md px-2 py-1.5 text-ink text-sm outline-none focus:border-copper" />
          </label>
          <label class="text-xs text-mute">
            Até
            <input type="datetime-local" [(ngModel)]="to" class="mt-1 block bg-void border border-rail-edge rounded-md px-2 py-1.5 text-ink text-sm outline-none focus:border-copper" />
          </label>
        </div>
        <button type="button" class="bg-copper text-on-primary px-4 py-2 rounded-md text-xs font-semibold tracking-wide hover:bg-copper-dim" (click)="run()">Calcular</button>
        @if (result()) {
          <p class="font-code text-sm text-copper">{{ result() }}</p>
        }
      </div>
    </app-tool-shell>
  `,
})
export class DateDiffPage {
  from = ''
  to = ''
  readonly result = signal('')

  constructor() {
    const now = new Date()
    const earlier = new Date(now.getTime() - 86400000)
    this.to = this.toLocal(now)
    this.from = this.toLocal(earlier)
  }

  private toLocal(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  run() {
    if (!this.from || !this.to) return
    this.result.set(dateDiff(this.from, this.to).label)
  }
}
