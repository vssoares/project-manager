import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { GeneratorShell } from '../../components/generator-shell/generator-shell'
import { generateCnh, generateMany } from '../../data-access/generators'

@Component({
  selector: 'app-cnh-page',
  imports: [FormsModule, GeneratorShell],
  template: `
    <app-generator-shell title="Gerador de CNH" description="Gera números de CNH válidos. Uso apenas para testes." [results]="results()" (generate)="onGenerate()">
      <div options class="flex flex-wrap items-center gap-4">
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
export class CnhPage {
  masked = true
  count = 1
  readonly results = signal<string[]>([])
  onGenerate() {
    this.results.set(generateMany(this.count, () => generateCnh(this.masked)))
  }
}
