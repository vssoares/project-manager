import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { GeneratorShell } from '../../components/generator-shell/generator-shell'
import { generateMany, generateNumber } from '../../data-access/generators'

@Component({
  selector: 'app-number-gen-page',
  imports: [FormsModule, GeneratorShell],
  template: `
    <app-generator-shell title="Número aleatório" description="Gera inteiros ou decimais dentro de um intervalo." [results]="results()" (generate)="onGenerate()">
      <div options class="flex flex-wrap items-center gap-4">
        <label class="flex items-center gap-2 text-xs text-mute">
          Mín
          <input type="number" [(ngModel)]="min" class="w-20 bg-void border border-rail-edge rounded-md px-2 py-1 text-ink font-code text-xs outline-none focus:border-copper" />
        </label>
        <label class="flex items-center gap-2 text-xs text-mute">
          Máx
          <input type="number" [(ngModel)]="max" class="w-20 bg-void border border-rail-edge rounded-md px-2 py-1 text-ink font-code text-xs outline-none focus:border-copper" />
        </label>
        <label class="flex items-center gap-2 text-xs text-mute">
          Decimais
          <input type="number" [(ngModel)]="decimals" min="0" max="8" class="w-16 bg-void border border-rail-edge rounded-md px-2 py-1 text-ink font-code text-xs outline-none focus:border-copper" />
        </label>
        <label class="flex items-center gap-2 text-xs text-mute">
          Quantidade
          <input type="number" [(ngModel)]="count" min="1" max="50" class="w-16 bg-void border border-rail-edge rounded-md px-2 py-1 text-ink font-code text-xs outline-none focus:border-copper" />
        </label>
      </div>
    </app-generator-shell>
  `,
})
export class NumberGenPage {
  min = 1
  max = 100
  decimals = 0
  count = 1
  readonly results = signal<string[]>([])
  onGenerate() {
    this.results.set(generateMany(this.count, () => generateNumber(this.min, this.max, this.decimals)))
  }
}
