import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ToolShell } from '../../components/tool-shell/tool-shell'
import { toSlug } from '../../data-access/generators'

@Component({
  selector: 'app-text-case-page',
  imports: [FormsModule, ToolShell],
  template: `
    <app-tool-shell title="Maiúscula / slug" description="Converte texto entre maiúsculas, minúsculas e slug.">
      <div class="rounded-md border border-rail-edge bg-panel p-5 space-y-4">
        <textarea [(ngModel)]="input" rows="4" class="w-full bg-void border border-rail-edge rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-copper font-code resize-y" placeholder="Texto…"></textarea>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="border border-rail-edge text-mute hover:text-ink px-3 py-1.5 rounded-md text-xs" (click)="output.set(input.toUpperCase())">MAIÚSCULA</button>
          <button type="button" class="border border-rail-edge text-mute hover:text-ink px-3 py-1.5 rounded-md text-xs" (click)="output.set(input.toLowerCase())">minúscula</button>
          <button type="button" class="border border-rail-edge text-mute hover:text-ink px-3 py-1.5 rounded-md text-xs" (click)="output.set(toTitle())">Title Case</button>
          <button type="button" class="bg-copper text-on-primary px-3 py-1.5 rounded-md text-xs font-semibold" (click)="output.set(toSlug(input))">Slug</button>
        </div>
        @if (output()) {
          <div class="rounded-md bg-void border border-rail-edge px-3 py-2 font-code text-sm text-ink break-all whitespace-pre-wrap">{{ output() }}</div>
        }
      </div>
    </app-tool-shell>
  `,
})
export class TextCasePage {
  input = ''
  readonly output = signal('')
  protected readonly toSlug = toSlug

  toTitle() {
    return this.input
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
      .join(' ')
  }
}
