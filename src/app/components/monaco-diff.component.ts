import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  afterNextRender,
} from '@angular/core'
import type { editor } from 'monaco-editor'
import { editorOptions, languageFromFileName, MONACO_THEME } from '../core/monaco'
import { prepareMonaco } from '../core/monaco-setup'

@Component({
  selector: 'app-monaco-diff',
  standalone: true,
  template: `
    <div class="flex-1 min-h-0 flex flex-col monaco-host h-full">
      <div class="shrink-0 grid grid-cols-2 border-b border-rail-edge text-[11px] font-code">
        <div class="px-4 py-2 bg-panel text-mute border-r border-rail-edge truncate">
          <span class="text-copper/80 mr-2 uppercase tracking-widest text-[10px]">Base</span>
          {{ originalLabel }}
        </div>
        <div class="px-4 py-2 bg-panel text-mute truncate">
          <span class="text-signal/80 mr-2 uppercase tracking-widest text-[10px]">Alvo</span>
          {{ modifiedLabel }}
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
export class MonacoDiffComponent implements OnChanges, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>
  @Input() original = ''
  @Input() modified = ''
  @Input() fileName = '.env'
  @Input() originalLabel = ''
  @Input() modifiedLabel = ''

  private editor?: editor.IStandaloneDiffEditor

  constructor() {
    afterNextRender(() => {
      void this.init()
    })
  }

  private async init() {
    const monaco = await prepareMonaco()
    this.editor = monaco.editor.createDiffEditor(this.host.nativeElement, {
      ...editorOptions,
      theme: MONACO_THEME,
      readOnly: true,
      renderSideBySide: true,
      originalEditable: false,
    })
    this.setModels()
  }

  private async setModels() {
    if (!this.editor) return
    const monaco = await prepareMonaco()
    const language = languageFromFileName(this.fileName)
    const original = monaco.editor.createModel(this.original, language)
    const modified = monaco.editor.createModel(this.modified, language)
    const prev = this.editor.getModel()
    this.editor.setModel({ original, modified })
    prev?.original.dispose()
    prev?.modified.dispose()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.editor) return
    if (changes['original'] || changes['modified'] || changes['fileName']) {
      void this.setModels()
    }
  }

  ngOnDestroy() {
    const model = this.editor?.getModel()
    model?.original.dispose()
    model?.modified.dispose()
    this.editor?.dispose()
  }
}
