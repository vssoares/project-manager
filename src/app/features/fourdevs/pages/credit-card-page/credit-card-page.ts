import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { GeneratorShell } from '../../components/generator-shell/generator-shell'
import { type CardBrand, generateCreditCard, generateMany } from '../../data-access/generators'

@Component({
  selector: 'app-credit-card-page',
  imports: [FormsModule, GeneratorShell],
  template: `
    <app-generator-shell title="Gerador de cartão de crédito" description="Gera números válidos (Luhn) para testes. Não use em pagamentos reais." [results]="results()" (generate)="onGenerate()">
      <div options class="flex flex-wrap items-center gap-4">
        <label class="flex items-center gap-2 text-xs text-mute">
          Bandeira
          <select [(ngModel)]="brand" class="bg-void border border-rail-edge rounded-md px-2 py-1 text-ink text-xs outline-none focus:border-copper">
            <option value="visa">Visa</option>
            <option value="mastercard">Mastercard</option>
            <option value="amex">Amex</option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-xs text-mute cursor-pointer">
          <input type="checkbox" [(ngModel)]="masked" class="accent-copper" /> Com espaços
        </label>
        <label class="flex items-center gap-2 text-xs text-mute">
          Quantidade
          <input type="number" [(ngModel)]="count" min="1" max="50" class="w-16 bg-void border border-rail-edge rounded-md px-2 py-1 text-ink font-code text-xs outline-none focus:border-copper" />
        </label>
      </div>
    </app-generator-shell>
  `,
})
export class CreditCardPage {
  brand: CardBrand = 'visa'
  masked = true
  count = 1
  readonly results = signal<string[]>([])
  onGenerate() {
    this.results.set(generateMany(this.count, () => generateCreditCard(this.brand, this.masked)))
  }
}
