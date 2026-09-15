import { Component, inject, signal } from '@angular/core';
import { AppStateService } from './core/app-state.service';
import type { PageKey } from './core/types';
import { FilesPage } from './features/env-files/pages/files-page/files-page';
import { SettingsPage } from './features/env-files/pages/settings-page/settings-page';
import { CepPage } from './features/fourdevs/pages/cep-page/cep-page';
import { CnpjPage } from './features/fourdevs/pages/cnpj-page/cnpj-page';
import { CpfPage } from './features/fourdevs/pages/cpf-page/cpf-page';
import { PasswordPage } from './features/fourdevs/pages/password-page/password-page';
import { GitFlowPage } from './features/git-flow/pages/git-flow-page/git-flow-page';
import { Layout } from './layout/layout';

@Component({
  selector: 'app-root',
  imports: [Layout, FilesPage, SettingsPage, GitFlowPage, CpfPage, CnpjPage, CepPage, PasswordPage],
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
          @case ('cpf') {
            <app-cpf-page />
          }
          @case ('cnpj') {
            <app-cnpj-page />
          }
          @case ('cep') {
            <app-cep-page />
          }
          @case ('password') {
            <app-password-page />
          }
        }
      </app-layout>
    }
  `,
})
export class App {
  readonly app = inject(AppStateService);
  readonly page = signal<PageKey>('files');
}
