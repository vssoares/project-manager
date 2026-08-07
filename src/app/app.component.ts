import { Component, inject, signal } from '@angular/core'
import { LayoutComponent } from './components/layout.component'
import { AppStateService } from './core/app-state.service'
import type { PageKey } from './core/types'
import { ComparePageComponent } from './pages/compare-page.component'
import { FilesPageComponent } from './pages/files-page.component'
import { HistoryPageComponent } from './pages/history-page.component'
import { SettingsPageComponent } from './pages/settings-page.component'
import { GitFlowPage } from './features/git-flow/pages/git-flow-page/git-flow-page'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LayoutComponent,
    FilesPageComponent,
    HistoryPageComponent,
    ComparePageComponent,
    SettingsPageComponent,
    GitFlowPage,
  ],
  template: `
    @if (!app.loaded()) {
      <div class="h-screen w-screen flex flex-col items-center justify-center gap-3 bg-void text-mute text-sm">
        <div class="w-2 h-2 rounded-full bg-signal circuit-pulse"></div>
        <span class="font-code text-xs tracking-wide">Carregando patch bay…</span>
      </div>
    } @else {
      <app-layout [page]="page()" (navigate)="page.set($event)">
        @switch (page()) {
          @case ('files') {
            <app-files-page />
          }
          @case ('history') {
            <app-history-page />
          }
          @case ('compare') {
            <app-compare-page />
          }
          @case ('gitflow') {
            <app-git-flow-page />
          }
          @case ('settings') {
            <app-settings-page />
          }
        }
      </app-layout>
    }
  `,
})
export class AppComponent {
  readonly app = inject(AppStateService)
  readonly page = signal<PageKey>('files')
}
