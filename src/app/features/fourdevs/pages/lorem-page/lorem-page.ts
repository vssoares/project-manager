import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { GeneratorShell } from '../../components/generator-shell/generator-shell'
import { generateLorem } from '../../data-access/generators'

@Component({
  selector: 'app-lorem-page',
  imports: [FormsModule, GeneratorShell],
  template: `
    <app-generator-shell title="Lorem Ipsum" description="Gera texto placeholder para layouts e protótipos." [results]="results()" (generate)="onGenerate()">
      <div options class="flex flex-wrap items-center gap-4">
        <label class="flex items-center gap-2 text-xs text-mute">
          Parágrafos
          <input type="number" [(ngModel)]="paragraphs" min="1" max="10" class="w-16 bg-void border border-rail-edge rounded-md px-2 py-1 text-ink font-code text-xs outline-none focus:border-copper" />
        </label>
      </div>
    </app-generator-shell>
  `,
})
export class LoremPage {
  paragraphs = 2
  readonly results = signal<string[]>([])
  onGenerate() {
    this.results.set([generateLorem(this.paragraphs)])
  }
}
