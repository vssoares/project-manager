import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ToolShell } from '../../components/tool-shell/tool-shell'
import { hashText, md5 } from '../../data-access/generators'

@Component({
  selector: 'app-hash-page',
  imports: [FormsModule, ToolShell],
  template: `
    <app-tool-shell title="Gerador de hash" description="MD5, SHA-1, SHA-256 e SHA-512 do texto informado.">
      <div class="rounded-md border border-rail-edge bg-panel p-5 space-y-4">
        <textarea [(ngModel)]="input" rows="4" class="w-full bg-void border border-rail-edge rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-copper font-code resize-y" placeholder="Texto…"></textarea>
        <label class="flex items-center gap-2 text-xs text-mute">
          Algoritmo
          <select [(ngModel)]="algo" class="bg-void border border-rail-edge rounded-md px-2 py-1 text-ink text-xs outline-none focus:border-copper">
            <option value="MD5">MD5</option>
            <option value="SHA-1">SHA-1</option>
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-512">SHA-512</option>
          </select>
        </label>
        <button type="button" class="bg-copper text-on-primary px-4 py-2 rounded-md text-xs font-semibold tracking-wide hover:bg-copper-dim" (click)="run()">Gerar hash</button>
        @if (output()) {
          <code class="block rounded-md bg-void border border-rail-edge px-3 py-2 font-code text-xs text-ink break-all">{{ output() }}</code>
        }
      </div>
    </app-tool-shell>
  `,
})
export class HashPage {
  input = ''
  algo: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512' = 'SHA-256'
  readonly output = signal('')

  async run() {
    if (this.algo === 'MD5') {
      this.output.set(md5(this.input))
      return
    }
    this.output.set(await hashText(this.input, this.algo))
  }
}
