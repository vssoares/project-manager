import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ToolShell } from '../../components/tool-shell/tool-shell'
import { formatJson } from '../../data-access/generators'

@Component({
  selector: 'app-json-tools-page',
  imports: [FormsModule, ToolShell],
  template: `
    <app-tool-shell title="JSON formatter" description="Formata ou minifica JSON e valida a sintaxe.">
      <div class="rounded-md border border-rail-edge bg-panel p-5 space-y-4">
        <textarea [(ngModel)]="input" rows="10" class="w-full bg-void border border-rail-edge rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-copper font-code resize-y" placeholder='{"ok":true}'></textarea>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="bg-copper text-on-primary px-3 py-1.5 rounded-md text-xs font-semibold" (click)="run(true)">Formatar</button>
          <button type="button" class="border border-rail-edge text-mute hover:text-ink px-3 py-1.5 rounded-md text-xs" (click)="run(false)">Minificar</button>
        </div>
        @if (error()) {
          <p class="text-xs text-danger">{{ error() }}</p>
        }
        @if (output()) {
          <pre class="rounded-md bg-void border border-rail-edge px-3 py-2 font-code text-xs text-ink overflow-x-auto whitespace-pre-wrap">{{ output() }}</pre>
        }
      </div>
    </app-tool-shell>
  `,
})
export class JsonToolsPage {
  input = '{\n  "ok": true\n}'
  readonly output = signal('')
  readonly error = signal('')

  run(pretty: boolean) {
    try {
      this.error.set('')
      this.output.set(formatJson(this.input, pretty))
    } catch (e) {
      this.error.set((e as Error).message || 'JSON inválido')
      this.output.set('')
    }
  }
}
