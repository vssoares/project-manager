import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Icon } from '../../../../shared/components/icon/icon'
import {
  type CepAddress,
  generateCepWithAddress,
  generateMany,
} from '../../data-access/generators'

@Component({
  selector: 'app-cep-page',
  imports: [FormsModule, Icon],
  template: `
    <div class="h-full overflow-y-auto scrollbar-thin">
      <div class="px-8 py-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 class="font-headline text-xl font-semibold tracking-tight">Gerador de CEP</h1>
          <p class="text-sm text-mute mt-1">
            Gera CEPs válidos e busca o endereço correspondente (ViaCEP). Uso apenas para testes.
          </p>
        </div>

        <div class="rounded-md border border-rail-edge bg-panel p-5 space-y-4">
          <div class="flex flex-wrap items-center gap-4">
            <label class="flex items-center gap-2 text-xs text-mute cursor-pointer">
              <input type="checkbox" [(ngModel)]="masked" class="accent-copper" />
              Com hífen
            </label>
            <label class="flex items-center gap-2 text-xs text-mute">
              Quantidade
              <input
                type="number"
                [(ngModel)]="count"
                min="1"
                max="10"
                class="w-16 bg-void border border-rail-edge rounded-md px-2 py-1 text-ink font-code text-xs outline-none focus:border-copper"
              />
            </label>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button
              type="button"
              class="bg-copper text-on-primary px-4 py-2 rounded-md text-xs font-semibold tracking-wide hover:bg-copper-dim transition-colors disabled:opacity-60"
              [disabled]="loading()"
              (click)="onGenerate()"
            >
              {{ loading() ? 'Buscando…' : 'Gerar' }}
            </button>
          </div>

          @if (error(); as err) {
            <p class="text-xs text-danger">{{ err }}</p>
          }
        </div>

        @if (addresses().length > 0) {
          <div class="space-y-3">
            @for (addr of addresses(); track $index) {
              <div class="rounded-md border border-rail-edge bg-panel overflow-hidden">
                <div class="px-4 py-2.5 border-b border-rail-edge flex items-center justify-between gap-3">
                  <code class="font-code text-sm text-copper">{{ addr.cep }}</code>
                  <button
                    type="button"
                    class="text-[10px] uppercase tracking-widest text-mute hover:text-copper transition-colors"
                    (click)="copyAddress(addr, $index)"
                  >
                    {{ copiedIndex() === $index ? 'copiado' : 'copiar' }}
                  </button>
                </div>
                <dl class="px-4 py-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
                  <dt class="text-mute">Logradouro</dt>
                  <dd class="text-ink">{{ addr.logradouro || '—' }}</dd>
                  <dt class="text-mute">Complemento</dt>
                  <dd class="text-ink">{{ addr.complemento || '—' }}</dd>
                  <dt class="text-mute">Bairro</dt>
                  <dd class="text-ink">{{ addr.bairro || '—' }}</dd>
                  <dt class="text-mute">Cidade</dt>
                  <dd class="text-ink">{{ addr.localidade || '—' }}</dd>
                  <dt class="text-mute">UF</dt>
                  <dd class="text-ink">{{ addr.uf || '—' }}</dd>
                  <dt class="text-mute">DDD</dt>
                  <dd class="text-ink">{{ addr.ddd || '—' }}</dd>
                  <dt class="text-mute">IBGE</dt>
                  <dd class="text-ink font-code">{{ addr.ibge || '—' }}</dd>
                </dl>
              </div>
            }
          </div>
        } @else if (!loading()) {
          <div class="flex items-center gap-2 text-xs text-mute px-1">
            <app-icon name="search" [size]="14" />
            Clique em Gerar para obter CEP e endereço.
          </div>
        }
      </div>
    </div>
  `,
})
export class CepPage {
  masked = true
  count = 1

  readonly addresses = signal<CepAddress[]>([])
  readonly loading = signal(false)
  readonly error = signal('')
  readonly copiedIndex = signal<number | null>(null)

  async onGenerate(): Promise<void> {
    this.loading.set(true)
    this.error.set('')
    this.copiedIndex.set(null)

    try {
      const jobs = generateMany(Math.min(10, this.count), () => generateCepWithAddress(this.masked))
      const results = await Promise.all(jobs)
      const found = results.filter((r): r is CepAddress => r !== null)
      this.addresses.set(found)
      if (found.length === 0) {
        this.error.set('Não foi possível obter um CEP com endereço. Tente novamente.')
      }
    } catch {
      this.error.set('Falha ao consultar o ViaCEP. Verifique a conexão.')
      this.addresses.set([])
    } finally {
      this.loading.set(false)
    }
  }

  protected async copyAddress(addr: CepAddress, index: number): Promise<void> {
    const text = [
      `CEP: ${addr.cep}`,
      `Logradouro: ${addr.logradouro || '—'}`,
      `Complemento: ${addr.complemento || '—'}`,
      `Bairro: ${addr.bairro || '—'}`,
      `Cidade: ${addr.localidade || '—'}`,
      `UF: ${addr.uf || '—'}`,
      `DDD: ${addr.ddd || '—'}`,
      `IBGE: ${addr.ibge || '—'}`,
    ].join('\n')

    await navigator.clipboard.writeText(text)
    this.copiedIndex.set(index)
    setTimeout(() => this.copiedIndex.set(null), 1500)
  }
}
