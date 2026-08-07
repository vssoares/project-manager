import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';

const PATHS: Record<string, string> = {
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  file: 'M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 0v5h5',
  plus: 'M12 5v14M5 12h14',
  history: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l4 2',
  compare: 'M8 3v18M16 3v18M4 8h4M16 8h4M4 16h4M16 16h4',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
  save: 'M5 3h11l3 3v15H5V3Zm3 0v6h8V3M6 21v-8h12v8',
  rocket:
    'M14 3c3 0 6 2 7 7-3 1-5 3-6 6H9c-1-3-3-5-6-6 1-5 4-7 7-7Zm-3 13-2 4M16 16l2 4M9 9a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  link: 'M9 15l6-6M8 7l1-1a4 4 0 0 1 6 6l-1 1M16 17l-1 1a4 4 0 0 1-6-6l1-1',
  close: 'M6 6l12 12M18 6 6 18',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  check: 'm5 13 4 4L19 7',
  restore: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5',
  external: 'M14 4h6v6M20 4 10 14M6 6h4v0H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4',
  code: 'm8 6-6 6 6 6M16 6l6 6-6 6',
  edit: 'M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6M18.4 2.6a2 2 0 1 1 3 3L12 15l-4 1 1-4 9.4-9.4Z',
};

@Component({
  selector: 'app-icon',
  imports: [NgClass],
  template: `
    @if (path(); as d) {
      <svg
        viewBox="0 0 24 24"
        [attr.width]="size()"
        [attr.height]="size()"
        fill="none"
        stroke="currentColor"
        [attr.stroke-width]="strokeWidth()"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="shrink-0"
        [ngClass]="className()"
        aria-hidden="true"
      >
        <path [attr.d]="d" />
      </svg>
    }
  `,
})
export class Icon {
  readonly name = input.required<string>();
  readonly className = input('');
  readonly size = input(18);
  readonly strokeWidth = input(1.8);

  protected readonly path = computed(() => PATHS[this.name()]);
}
