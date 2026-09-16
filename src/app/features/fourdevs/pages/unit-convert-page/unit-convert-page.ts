import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ToolShell } from '../../components/tool-shell/tool-shell'
import { type UnitKind, convertUnit } from '../../data-access/generators'

@Component({
  selector: 'app-unit-convert-page',
  imports: [FormsModule, ToolShell],
  template: `
    <app-tool-shell title="Conversor de unidades" description="Converte comprimento, massa e temperatura.">
      <div class="rounded-md border border-rail-edge bg-panel p-5 space-y-4">
        <label class="flex items-center gap-2 text-xs text-mute">
          Tipo
          <select [(ngModel)]="kind" (ngModelChange)="onKindChange()" class="bg-void border border-rail-edge rounded-md px-2 py-1 text-ink text-xs outline-none focus:border-copper">
            <option value="length">Comprimento</option>
            <option value="mass">Massa</option>
            <option value="temp">Temperatura</option>
          </select>
        </label>
        <div class="flex flex-wrap gap-3 items-end">
          <label class="text-xs text-mute">
            Valor
            <input type="number" [(ngModel)]="value" class="mt-1 block w-28 bg-void border border-rail-edge rounded-md px-2 py-1.5 text-ink font-code text-sm outline-none focus:border-copper" />
          </label>
          <label class="text-xs text-mute">
            De
            <select [(ngModel)]="from" class="mt-1 block bg-void border border-rail-edge rounded-md px-2 py-1.5 text-ink text-sm outline-none focus:border-copper">
              @for (u of units; track u) {
                <option [value]="u">{{ u }}</option>
              }
            </select>
          </label>
          <label class="text-xs text-mute">
            Para
            <select [(ngModel)]="to" class="mt-1 block bg-void border border-rail-edge rounded-md px-2 py-1.5 text-ink text-sm outline-none focus:border-copper">
              @for (u of units; track u) {
                <option [value]="u">{{ u }}</option>
              }
            </select>
          </label>
        </div>
        <button type="button" class="bg-copper text-on-primary px-4 py-2 rounded-md text-xs font-semibold tracking-wide hover:bg-copper-dim" (click)="run()">Converter</button>
        @if (result(); as r) {
          <p class="font-code text-lg text-copper">{{ value }} {{ from }} = {{ r }} {{ to }}</p>
        }
      </div>
    </app-tool-shell>
  `,
})
export class UnitConvertPage {
  kind: UnitKind = 'length'
  value = 1
  from = 'm'
  to = 'km'
  units = ['m', 'km', 'cm', 'mm', 'mi', 'ft', 'in']
  readonly result = signal<string | null>(null)

  onKindChange() {
    if (this.kind === 'length') {
      this.units = ['m', 'km', 'cm', 'mm', 'mi', 'ft', 'in']
      this.from = 'm'
      this.to = 'km'
    } else if (this.kind === 'mass') {
      this.units = ['kg', 'g', 'mg', 'lb', 'oz']
      this.from = 'kg'
      this.to = 'lb'
    } else {
      this.units = ['C', 'F', 'K']
      this.from = 'C'
      this.to = 'F'
    }
    this.result.set(null)
  }

  run() {
    const n = convertUnit(this.kind, this.value, this.from, this.to)
    this.result.set(Number.isFinite(n) ? n.toFixed(6).replace(/\.?0+$/, '') : '—')
  }
}
