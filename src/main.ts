import { bootstrapApplication } from '@angular/platform-browser'
import { App } from './app/app'
import { appConfig } from './app/app.config'
import './app/core/monaco-setup'
import './index.css'

if (import.meta.env.DEV) {
  // Dev builds run with `jit: true` (see vite.config.ts), which leaves
  // @Component decorators uncompiled and relies on Angular's runtime
  // compiler to JIT them on bootstrap. Production uses AOT and never
  // needs this, so keep it out of the prod bundle.
  await import('@angular/compiler')
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err))
