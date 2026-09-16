import { Component, inject, signal } from '@angular/core';
import { AppStateService } from './core/app-state.service';
import type { PageKey } from './core/types';
import { FilesPage } from './features/env-files/pages/files-page/files-page';
import { SettingsPage } from './features/env-files/pages/settings-page/settings-page';
import { FourdevsHost } from './features/fourdevs/fourdevs-host';
import { isFourdevsPage } from './features/fourdevs/fourdevs.nav';
import { GitFlowPage } from './features/git-flow/pages/git-flow-page/git-flow-page';
import { Layout } from './layout/layout';

@Component({
  selector: 'app-root',
  imports: [Layout, FilesPage, SettingsPage, GitFlowPage, FourdevsHost],
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
          @case ('gitflow') {
            <app-git-flow-page />
          }
          @case ('settings') {
            <app-settings-page />
          }
          @default {
            @if (isFourdevs(page())) {
              <app-fourdevs-host [tool]="page()" />
            }
          }
        }
      </app-layout>
    }
  `,
})
export class App {
  readonly app = inject(AppStateService);
  readonly page = signal<PageKey>('files');
  protected readonly isFourdevs = isFourdevsPage;
}
