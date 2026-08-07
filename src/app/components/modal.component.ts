import { Component, EventEmitter, Input, Output } from '@angular/core'
import { IconComponent } from './icon.component'

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
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
          <h2 class="font-headline text-sm font-semibold text-ink tracking-tight">{{ title }}</h2>
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
export class ModalComponent {
  @Input({ required: true }) title!: string
  @Output() closed = new EventEmitter<void>()
}
