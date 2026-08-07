import { Component, ElementRef, OnDestroy, ViewChild, afterNextRender, effect, input, signal } from '@angular/core';
import type { editor } from 'monaco-editor';
import { editorOptions, languageFromFileName, MONACO_THEME } from '../../../core/monaco';
import { prepareMonaco } from '../../../core/monaco-setup';

@Component({
  selector: 'app-monaco-diff',
  template: `
    <div class="flex-1 min-h-0 flex flex-col monaco-host h-full">
      <div class="shrink-0 grid grid-cols-2 border-b border-rail-edge text-[11px] font-code">
        <div class="px-4 py-2 bg-panel text-mute border-r border-rail-edge truncate">
          <span class="text-copper/80 mr-2 uppercase tracking-widest text-[10px]">Base</span>
          {{ originalLabel() }}
        </div>
        <div class="px-4 py-2 bg-panel text-mute truncate">
          <span class="text-signal/80 mr-2 uppercase tracking-widest text-[10px]">Alvo</span>
          {{ modifiedLabel() }}
        </div>
      </div>
      <div class="flex-1 min-h-0 relative">
        <div #host class="absolute inset-0"></div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-height: 0;
      }
    `,
  ],
})
export class MonacoDiff implements OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  readonly original = input('');
  readonly modified = input('');
  readonly fileName = input('.env');
  readonly originalLabel = input('');
  readonly modifiedLabel = input('');

  private readonly ready = signal(false);
  private editor?: editor.IStandaloneDiffEditor;

  constructor() {
    afterNextRender(() => {
      void this.init();
    });

    effect(() => {
      this.original();
      this.modified();
      this.fileName();
      if (!this.ready()) return;
      void this.setModels();
    });
  }

  private async init() {
    const monaco = await prepareMonaco();
    this.editor = monaco.editor.createDiffEditor(this.host.nativeElement, {
      ...editorOptions,
      theme: MONACO_THEME,
      readOnly: true,
      renderSideBySide: true,
      originalEditable: false,
    });
    this.ready.set(true);
    await this.setModels();
  }

  private async setModels() {
    if (!this.editor) return;
    const monaco = await prepareMonaco();
    const language = languageFromFileName(this.fileName());
    const original = monaco.editor.createModel(this.original(), language);
    const modified = monaco.editor.createModel(this.modified(), language);
    const prev = this.editor.getModel();
    this.editor.setModel({ original, modified });
    prev?.original.dispose();
    prev?.modified.dispose();
  }

  ngOnDestroy() {
    const model = this.editor?.getModel();
    model?.original.dispose();
    model?.modified.dispose();
    this.editor?.dispose();
  }
}
