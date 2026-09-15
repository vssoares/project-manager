import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { generateMany, generatePassword } from '../../data-access/generators'
import { GeneratorShell } from '../../components/generator-shell/generator-shell'

@Component({
  selector: 'app-password-page',
  imports: [FormsModule, GeneratorShell],
  template: `
    <app-generator-shell
      title="Gerador de senha"
      description="Gera senhas aleatórias com as regras que você escolher."
      [results]="results()"
      (generate)="onGenerate()"
    >
      <div options class="space-y-4">
        <div class="flex flex-wrap items-center gap-4">
          <label class="flex items-center gap-2 text-xs text-mute">
            Tamanho
            <input
              type="number"
              [(ngModel)]="length"
              min="4"
              max="128"
              class="w-16 bg-void border border-rail-edge rounded-md px-2 py-1 text-ink font-code text-xs outline-none focus:border-copper"
            />
          </label>
          <label class="flex items-center gap-2 text-xs text-mute">
            Quantidade
            <input
              type="number"
              [(ngModel)]="count"
              min="1"
              max="50"
              class="w-16 bg-void border border-rail-edge rounded-md px-2 py-1 text-ink font-code text-xs outline-none focus:border-copper"
            />
          </label>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <label class="flex items-center gap-2 text-xs text-mute cursor-pointer">
            <input type="checkbox" [(ngModel)]="uppercase" class="accent-copper" />
            Maiúsculas
          </label>
          <label class="flex items-center gap-2 text-xs text-mute cursor-pointer">
            <input type="checkbox" [(ngModel)]="lowercase" class="accent-copper" />
            Minúsculas
          </label>
          <label class="flex items-center gap-2 text-xs text-mute cursor-pointer">
            <input type="checkbox" [(ngModel)]="numbers" class="accent-copper" />
            Números
          </label>
          <label class="flex items-center gap-2 text-xs text-mute cursor-pointer">
            <input type="checkbox" [(ngModel)]="symbols" class="accent-copper" />
            Símbolos
          </label>
        </div>
      </div>
    </app-generator-shell>
  `,
})
export class PasswordPage {
  length = 16
  count = 1
  uppercase = true
  lowercase = true
  numbers = true
  symbols = true
  readonly results = signal<string[]>([])

  onGenerate(): void {
    this.results.set(
      generateMany(this.count, () =>
        generatePassword({
          length: this.length,
          uppercase: this.uppercase,
          lowercase: this.lowercase,
          numbers: this.numbers,
          symbols: this.symbols,
        }),
      ),
    )
  }
}
