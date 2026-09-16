import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ToolShell } from '../../components/tool-shell/tool-shell'
import { decodeBase64, decodeUrl, encodeBase64, encodeUrl } from '../../data-access/generators'

@Component({
  selector: 'app-base64-page',
  imports: [FormsModule, ToolShell],
  template: `
    <app-tool-shell title="Base64 / URL" description="Codifica e decodifica texto em Base64 ou URL encode.">
      <div class="rounded-md border border-rail-edge bg-panel p-5 space-y-4">
        <textarea [(ngModel)]="input" rows="4" class="w-full bg-void border border-rail-edge rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-copper font-code resize-y" placeholder="Texto…"></textarea>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="bg-copper text-on-primary px-3 py-1.5 rounded-md text-xs font-semibold" (click)="safe(() => encodeBase64(input))">Base64 encode</button>
          <button type="button" class="border border-rail-edge text-mute hover:text-ink px-3 py-1.5 rounded-md text-xs" (click)="safe(() => decodeBase64(input))">Base64 decode</button>
          <button type="button" class="border border-rail-edge text-mute hover:text-ink px-3 py-1.5 rounded-md text-xs" (click)="safe(() => encodeUrl(input))">URL encode</button>
          <button type="button" class="border border-rail-edge text-mute hover:text-ink px-3 py-1.5 rounded-md text-xs" (click)="safe(() => decodeUrl(input))">URL decode</button>
        </div>
        @if (error()) {
          <p class="text-xs text-danger">{{ error() }}</p>
        }
        @if (output()) {
          <code class="block rounded-md bg-void border border-rail-edge px-3 py-2 font-code text-xs text-ink break-all whitespace-pre-wrap">{{ output() }}</code>
        }
      </div>
    </app-tool-shell>
  `,
})
export class Base64Page {
  input = ''
  readonly output = signal('')
  readonly error = signal('')
  protected readonly encodeBase64 = encodeBase64
  protected readonly decodeBase64 = decodeBase64
  protected readonly encodeUrl = encodeUrl
  protected readonly decodeUrl = decodeUrl

  safe(fn: () => string) {
    try {
      this.error.set('')
      this.output.set(fn())
    } catch {
      this.error.set('Não foi possível converter o valor informado.')
      this.output.set('')
    }
  }
}
