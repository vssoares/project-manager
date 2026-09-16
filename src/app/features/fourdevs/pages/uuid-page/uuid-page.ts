import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { GeneratorShell } from '../../components/generator-shell/generator-shell'
import { generateMany, generateUuid } from '../../data-access/generators'

@Component({
  selector: 'app-uuid-page',
  imports: [FormsModule, GeneratorShell],
  template: `
    <app-generator-shell title="Gerador de UUID" description="Gera UUIDs v4 para identificadores únicos." [results]="results()" (generate)="onGenerate()">
      <div options class="flex flex-wrap items-center gap-4">
        <label class="flex items-center gap-2 text-xs text-mute">
          Quantidade
          <input type="number" [(ngModel)]="count" min="1" max="50" class="w-16 bg-void border border-rail-edge rounded-md px-2 py-1 text-ink font-code text-xs outline-none focus:border-copper" />
        </label>
      </div>
    </app-generator-shell>
  `,
})
export class UuidPage {
  count = 1
  readonly results = signal<string[]>([])
  onGenerate() {
    this.results.set(generateMany(this.count, () => generateUuid()))
  }
}
