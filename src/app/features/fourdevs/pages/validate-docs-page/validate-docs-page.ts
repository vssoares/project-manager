import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ToolShell } from '../../components/tool-shell/tool-shell'
import { validateCnpj, validateCpf } from '../../data-access/generators'

@Component({
  selector: 'app-validate-docs-page',
  imports: [FormsModule, ToolShell],
  template: `
    <app-tool-shell title="Validador CPF / CNPJ" description="Verifica se o documento possui dígitos verificadores válidos.">
      <div class="rounded-md border border-rail-edge bg-panel p-5 space-y-4">
        <label class="block text-xs text-mute">
          Documento
          <input
            [(ngModel)]="value"
            placeholder="CPF ou CNPJ"
            class="mt-1 w-full bg-void border border-rail-edge rounded-md px-3 py-2 text-sm text-ink font-code outline-none focus:border-copper"
          />
        </label>
        <div class="flex gap-2">
          <button type="button" class="bg-copper text-on-primary px-4 py-2 rounded-md text-xs font-semibold tracking-wide hover:bg-copper-dim" (click)="check('cpf')">Validar CPF</button>
          <button type="button" class="border border-rail-edge text-mute hover:text-ink px-4 py-2 rounded-md text-xs" (click)="check('cnpj')">Validar CNPJ</button>
        </div>
        @if (result(); as r) {
          <p class="text-sm font-code" [class.text-signal]="r.ok" [class.text-danger]="!r.ok">{{ r.message }}</p>
        }
      </div>
    </app-tool-shell>
  `,
})
export class ValidateDocsPage {
  value = ''
  readonly result = signal<{ ok: boolean; message: string } | null>(null)

  check(kind: 'cpf' | 'cnpj') {
    const ok = kind === 'cpf' ? validateCpf(this.value) : validateCnpj(this.value)
    this.result.set({
      ok,
      message: ok ? `${kind.toUpperCase()} válido` : `${kind.toUpperCase()} inválido`,
    })
  }
}
