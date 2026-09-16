import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ToolShell } from '../../components/tool-shell/tool-shell'
import { calcPercentage } from '../../data-access/generators'

@Component({
  selector: 'app-percentage-page',
  imports: [FormsModule, ToolShell],
  template: `
    <app-tool-shell title="Calculadora de porcentagem" description="Quanto é X% de Y, X é quantos % de Y, ou variação percentual.">
      <div class="rounded-md border border-rail-edge bg-panel p-5 space-y-4">
        <label class="flex items-center gap-2 text-xs text-mute">
          Modo
          <select [(ngModel)]="mode" class="bg-void border border-rail-edge rounded-md px-2 py-1 text-ink text-xs outline-none focus:border-copper">
            <option value="of">X% de Y</option>
            <option value="is">X é quantos % de Y</option>
            <option value="change">Variação de Y para X</option>
          </select>
        </label>
        <div class="flex flex-wrap gap-3">
          <label class="text-xs text-mute">
            {{ mode === 'of' ? 'X (%)' : 'X' }}
            <input type="number" [(ngModel)]="a" class="mt-1 block w-28 bg-void border border-rail-edge rounded-md px-2 py-1.5 text-ink font-code text-sm outline-none focus:border-copper" />
          </label>
          <label class="text-xs text-mute">
            Y
            <input type="number" [(ngModel)]="b" class="mt-1 block w-28 bg-void border border-rail-edge rounded-md px-2 py-1.5 text-ink font-code text-sm outline-none focus:border-copper" />
          </label>
        </div>
        <button type="button" class="bg-copper text-on-primary px-4 py-2 rounded-md text-xs font-semibold tracking-wide hover:bg-copper-dim" (click)="run()">Calcular</button>
        @if (result()) {
          <p class="font-code text-lg text-copper">{{ result() }}</p>
        }
      </div>
    </app-tool-shell>
  `,
})
export class PercentagePage {
  mode: 'of' | 'is' | 'change' = 'of'
  a = 10
  b = 200
  readonly result = signal('')

  run() {
    this.result.set(calcPercentage(this.mode, this.a, this.b))
  }
}
