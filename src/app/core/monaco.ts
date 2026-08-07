import type * as MonacoNS from 'monaco-editor'
import type { editor } from 'monaco-editor'

export type Monaco = typeof MonacoNS

export const MONACO_THEME = 'env-switcher-dark'

export function registerDotenvLanguage(monaco: Monaco) {
  const languages = monaco.languages.getLanguages()
  if (languages.some((l) => l.id === 'dotenv')) return

  monaco.languages.register({ id: 'dotenv' })
  monaco.languages.setMonarchTokensProvider('dotenv', {
    tokenizer: {
      root: [
        [/#.*$/, 'comment'],
        [/^\s*export\s+/, 'keyword'],
        [/^[A-Za-z_][\w]*(?=\s*=)/, 'variable'],
        [/=/, 'operator'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string_double'],
        [/'/, 'string', '@string_single'],
        [/[^\s#]+/, 'string'],
      ],
      string_double: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop'],
      ],
      string_single: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, 'string', '@pop'],
      ],
    },
  })
}

export function defineAppTheme(monaco: Monaco) {
  monaco.editor.defineTheme(MONACO_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '5a6a78', fontStyle: 'italic' },
      { token: 'variable', foreground: '7eb8e8' },
      { token: 'keyword', foreground: 'e8a45c' },
      { token: 'operator', foreground: '6b7a88' },
      { token: 'string', foreground: '3ecfcf' },
      { token: 'string.escape', foreground: 'e8a45c' },
      { token: 'string.invalid', foreground: 'f07178' },
    ],
    colors: {
      'editor.background': '#0a0e12',
      'editor.foreground': '#c8d0d8',
      'editorLineNumber.foreground': '#3d4a57',
      'editorLineNumber.activeForeground': '#e8a45c',
      'editor.selectionBackground': '#1e3a4a80',
      'editor.lineHighlightBackground': '#12181f',
      'editorCursor.foreground': '#e8a45c',
      'editorWhitespace.foreground': '#1a222d',
      'editorIndentGuide.background': '#1a222d',
      'editorIndentGuide.activeBackground': '#2a3542',
      'editorWidget.background': '#12181f',
      'editorWidget.border': '#2a3542',
      'diffEditor.insertedTextBackground': '#3ecfcf22',
      'diffEditor.removedTextBackground': '#f0717822',
      'diffEditor.insertedLineBackground': '#3ecfcf12',
      'diffEditor.removedLineBackground': '#f0717812',
      'scrollbarSlider.background': '#2a354266',
      'scrollbarSlider.hoverBackground': '#3d4a5788',
    },
  })
}

export function languageFromFileName(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('.env') || lower.endsWith('env')) return 'dotenv'
  if (lower.endsWith('.json')) return 'json'
  if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml'
  if (lower.endsWith('.toml')) return 'ini'
  if (lower.endsWith('.xml')) return 'xml'
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'javascript'
  if (lower.endsWith('.ts')) return 'typescript'
  if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'shell'
  return 'dotenv'
}

export const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  fontFamily: '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace',
  fontSize: 13,
  lineHeight: 22,
  fontLigatures: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 12, bottom: 12 },
  renderLineHighlight: 'line',
  cursorBlinking: 'smooth',
  smoothScrolling: true,
  tabSize: 2,
  wordWrap: 'off',
  bracketPairColorization: { enabled: true },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  scrollbar: {
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
  },
}
