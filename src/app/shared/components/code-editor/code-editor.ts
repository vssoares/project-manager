import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  afterNextRender,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import type { editor } from 'monaco-editor';
import { editorOptions, languageFromFileName, MONACO_THEME } from '../../../core/monaco';
import { prepareMonaco } from '../../../core/monaco-setup';

@Component({
  selector: 'app-code-editor',
  template: `
    <div class="flex-1 min-h-0 monaco-host h-full w-full relative">
      <div #host class="absolute inset-0"></div>
      @if (!ready()) {
        <div class="absolute inset-0 flex items-center justify-center bg-void text-mute text-xs tracking-wide">
          Abrindo editor…
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
        min-height: 0;
      }
    `,
  ],
})
export class CodeEditor implements OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  readonly value = input('');
  readonly readOnly = input(false);
  readonly fileName = input('.env');
  readonly valueChange = output<string>();

  protected readonly ready = signal(false);
  private editor?: editor.IStandaloneCodeEditor;
  private updatingFromInput = false;

  constructor() {
    afterNextRender(() => {
      void this.init();
    });

    effect(() => {
      const value = this.value();
      const readOnly = this.readOnly();
      if (!this.ready() || !this.editor) return;
      if (value !== this.editor.getValue()) {
        this.updatingFromInput = true;
        this.editor.setValue(value);
        this.updatingFromInput = false;
      }
      this.editor.updateOptions({ readOnly, domReadOnly: readOnly });
    });

    effect(() => {
      const fileName = this.fileName();
      if (!this.ready() || !this.editor) return;
      const model = this.editor.getModel();
      if (!model) return;
      void prepareMonaco().then((monaco) => {
        monaco.editor.setModelLanguage(model, languageFromFileName(fileName));
      });
    });
  }

  private async init() {
    const monaco = await prepareMonaco();
    this.editor = monaco.editor.create(this.host.nativeElement, {
      ...editorOptions,
      value: this.value(),
      language: languageFromFileName(this.fileName()),
      theme: MONACO_THEME,
      readOnly: this.readOnly(),
      domReadOnly: this.readOnly(),
    });
    this.editor.onDidChangeModelContent(() => {
      if (this.updatingFromInput) return;
      this.valueChange.emit(this.editor?.getValue() ?? '');
    });
    this.ready.set(true);
  }

  ngOnDestroy() {
    this.editor?.dispose();
  }
}
