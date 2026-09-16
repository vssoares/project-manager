import { Component, computed, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ToolShell } from '../../components/tool-shell/tool-shell'
import { countText } from '../../data-access/generators'

@Component({
  selector: 'app-text-counter-page',
  imports: [FormsModule, ToolShell],
  template: `
    <app-tool-shell title="Contador de texto" description="Conta caracteres, palavras e linhas.">
      <div class="rounded-md border border-rail-edge bg-panel p-5 space-y-4">
        <textarea
          [ngModel]="text()"
          (ngModelChange)="text.set($event)"
          rows="8"
          placeholder="Cole ou digite o texto…"
          class="w-full bg-void border border-rail-edge rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-copper font-code resize-y"
        ></textarea>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div class="rounded-md bg-void border border-rail-edge px-3 py-2">
            <div class="text-[10px] uppercase tracking-widest text-mute">Chars</div>
            <div class="font-code text-copper text-lg">{{ stats().chars }}</div>
          </div>
          <div class="rounded-md bg-void border border-rail-edge px-3 py-2">
            <div class="text-[10px] uppercase tracking-widest text-mute">Sem espaços</div>
            <div class="font-code text-copper text-lg">{{ stats().charsNoSpaces }}</div>
          </div>
          <div class="rounded-md bg-void border border-rail-edge px-3 py-2">
            <div class="text-[10px] uppercase tracking-widest text-mute">Palavras</div>
            <div class="font-code text-copper text-lg">{{ stats().words }}</div>
          </div>
          <div class="rounded-md bg-void border border-rail-edge px-3 py-2">
            <div class="text-[10px] uppercase tracking-widest text-mute">Linhas</div>
            <div class="font-code text-copper text-lg">{{ stats().lines }}</div>
          </div>
        </div>
      </div>
    </app-tool-shell>
  `,
})
export class TextCounterPage {
  readonly text = signal('')
  readonly stats = computed(() => countText(this.text()))
}
