import { Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-modal',
  imports: [Icon],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-void/75 backdrop-blur-[2px]"
      (click)="closed.emit()"
    >
      <div
        class="w-full max-w-md rounded-md border border-rail-edge bg-panel shadow-2xl fade-in"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-rail-edge">
          <h2 class="font-headline text-sm font-semibold text-ink tracking-tight">{{ title() }}</h2>
          <button type="button" class="text-mute hover:text-ink transition-colors" (click)="closed.emit()">
            <app-icon name="close" [size]="18" />
          </button>
        </div>
        <div class="px-5 py-4">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class Modal {
  readonly title = input.required<string>();
  readonly closed = output<void>();
}
