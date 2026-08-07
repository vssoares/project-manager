import { Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'solid' | 'outline' | 'tab' | 'toggle';

const BASE = 'cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-100';

const SOLID = 'bg-copper hover:bg-copper-dim text-on-primary font-bold uppercase tracking-widest rounded-md';

const OUTLINE =
  'border border-rail-edge bg-transparent text-mute hover:border-copper hover:text-copper rounded-md font-medium';

const TAB_ACTIVE = 'text-copper bg-copper/10 rounded-md uppercase tracking-widest font-semibold';
const TAB_IDLE = 'text-mute hover:text-ink rounded-md uppercase tracking-widest font-semibold';

@Component({
  selector: 'app-button',
  host: { class: 'contents' },
  template: `
    <button type="button" [class]="hostClass()" [disabled]="disabled()" (click)="clicked.emit()">
      <ng-content />
    </button>
  `,
})
export class Button {
  readonly variant = input<ButtonVariant>('solid');
  readonly isActive = input(false);
  readonly active = input('');
  readonly idle = input('');
  readonly disabled = input(false);
  readonly extraClass = input('', { alias: 'class' });

  readonly clicked = output<void>();

  protected readonly hostClass = computed(() => {
    let variantClass = '';

    switch (this.variant()) {
      case 'solid':
        variantClass = SOLID;
        break;
      case 'outline':
        variantClass = OUTLINE;
        break;
      case 'tab':
        variantClass = this.isActive() ? TAB_ACTIVE : TAB_IDLE;
        break;
      case 'toggle':
        variantClass = `border ${this.isActive() ? this.active() : this.idle()}`;
        break;
    }

    return `${BASE} ${variantClass} ${this.extraClass()}`;
  });
}
