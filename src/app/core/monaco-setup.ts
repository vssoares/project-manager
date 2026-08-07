import editorWorker from 'monaco-editor/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/language/typescript/ts.worker?worker'
import * as monaco from 'monaco-editor'
import { defineAppTheme, registerDotenvLanguage, type Monaco } from './monaco'

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker: (_: unknown, label: string) => Worker
    }
  }
}

self.MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    if (label === 'json') return new jsonWorker()
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
    if (label === 'typescript' || label === 'javascript') return new tsWorker()
    return new editorWorker()
  },
}

let prepared = false

export async function prepareMonaco(): Promise<Monaco> {
  if (!prepared) {
    registerDotenvLanguage(monaco)
    defineAppTheme(monaco)
    prepared = true
  }
  return monaco
}

export { monaco }
