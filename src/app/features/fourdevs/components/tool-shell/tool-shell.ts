import { Component, input } from '@angular/core'

@Component({
  selector: 'app-tool-shell',
  template: `
    <div class="h-full overflow-y-auto scrollbar-thin">
      <div class="px-8 py-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 class="font-headline text-xl font-semibold tracking-tight">{{ title() }}</h1>
          <p class="text-sm text-mute mt-1">{{ description() }}</p>
        </div>
        <ng-content />
      </div>
    </div>
  `,
})
export class ToolShell {
  readonly title = input.required<string>()
  readonly description = input.required<string>()
}
