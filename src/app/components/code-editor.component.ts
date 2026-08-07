import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  afterNextRender,
} from '@angular/core'
import type { editor } from 'monaco-editor'
import { editorOptions, languageFromFileName, MONACO_THEME } from '../core/monaco'
import { prepareMonaco } from '../core/monaco-setup'

@Component({
  selector: 'app-code-editor',
  standalone: true,
  template: `
    <div class="flex-1 min-h-0 monaco-host h-full w-full relative">
      <div #host class="absolute inset-0"></div>
      @if (!ready) {
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
export class CodeEditorComponent implements OnChanges, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>
  @Input() value = ''
  @Input() readOnly = false
  @Input() fileName = '.env'
  @Output() valueChange = new EventEmitter<string>()

  ready = false
  private editor?: editor.IStandaloneCodeEditor
  private updatingFromInput = false

  constructor() {
    afterNextRender(() => {
      void this.init()
    })
  }

  private async init() {
    const monaco = await prepareMonaco()
    this.editor = monaco.editor.create(this.host.nativeElement, {
      ...editorOptions,
      value: this.value,
      language: languageFromFileName(this.fileName),
      theme: MONACO_THEME,
      readOnly: this.readOnly,
      domReadOnly: this.readOnly,
    })
    this.editor.onDidChangeModelContent(() => {
      if (this.updatingFromInput) return
      this.valueChange.emit(this.editor?.getValue() ?? '')
    })
    this.ready = true
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.editor) return
    if (changes['value'] && this.value !== this.editor.getValue()) {
      this.updatingFromInput = true
      this.editor.setValue(this.value)
      this.updatingFromInput = false
    }
    if (changes['readOnly']) {
      this.editor.updateOptions({ readOnly: this.readOnly, domReadOnly: this.readOnly })
    }
    if (changes['fileName']) {
      const model = this.editor.getModel()
      if (model) {
        void prepareMonaco().then((monaco) => {
          monaco.editor.setModelLanguage(model, languageFromFileName(this.fileName))
        })
      }
    }
  }

  ngOnDestroy() {
    this.editor?.dispose()
  }
}
