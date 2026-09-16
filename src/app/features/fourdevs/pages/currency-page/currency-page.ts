import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ToolShell } from '../../components/tool-shell/tool-shell'
import { convertCurrency } from '../../data-access/generators'

@Component({
  selector: 'app-currency-page',
  imports: [FormsModule, ToolShell],
  template: `
    <app-tool-shell title="Conversor de moedas" description="Cotação em tempo real via Frankfurter (BCE).">
      <div class="rounded-md border border-rail-edge bg-panel p-5 space-y-4">
        <div class="flex flex-wrap gap-3">
          <label class="text-xs text-mute">
            Valor
            <input type="number" [(ngModel)]="amount" class="mt-1 block w-28 bg-void border border-rail-edge rounded-md px-2 py-1.5 text-ink font-code text-sm outline-none focus:border-copper" />
          </label>
          <label class="text-xs text-mute">
            De
            <select [(ngModel)]="from" class="mt-1 block bg-void border border-rail-edge rounded-md px-2 py-1.5 text-ink text-sm outline-none focus:border-copper">
              @for (c of currencies; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </label>
          <label class="text-xs text-mute">
            Para
            <select [(ngModel)]="to" class="mt-1 block bg-void border border-rail-edge rounded-md px-2 py-1.5 text-ink text-sm outline-none focus:border-copper">
              @for (c of currencies; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </label>
        </div>
        <button type="button" class="bg-copper text-on-primary px-4 py-2 rounded-md text-xs font-semibold tracking-wide hover:bg-copper-dim disabled:opacity-60" [disabled]="loading()" (click)="convert()">
          {{ loading() ? 'Convertendo…' : 'Converter' }}
        </button>
        @if (error()) {
          <p class="text-xs text-danger">{{ error() }}</p>
        }
        @if (result(); as r) {
          <p class="font-code text-lg text-copper">{{ amount }} {{ from }} = {{ r }} {{ to }}</p>
        }
      </div>
    </app-tool-shell>
  `,
})
export class CurrencyPage {
  amount = 100
  from = 'BRL'
  to = 'USD'
  readonly currencies = ['BRL', 'USD', 'EUR', 'GBP', 'ARS', 'CAD', 'JPY', 'CHF']
  readonly result = signal<string | null>(null)
  readonly loading = signal(false)
  readonly error = signal('')

  async convert() {
    this.loading.set(true)
    this.error.set('')
    try {
      const value = await convertCurrency(this.amount, this.from, this.to)
      this.result.set(value.toFixed(4))
    } catch {
      this.error.set('Não foi possível obter a cotação. Verifique a conexão.')
      this.result.set(null)
    } finally {
      this.loading.set(false)
    }
  }
}
