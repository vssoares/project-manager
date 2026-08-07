import { AfterViewChecked, Component, ElementRef, inject, viewChild } from '@angular/core';
import { Button } from '../../../../shared/components/button/button';
import { GitFlowStore } from '../../state/git-flow.store';

@Component({
  selector: 'app-console-output',
  imports: [Button],
  templateUrl: './console-output.html',
})
export class ConsoleOutput implements AfterViewChecked {
  protected readonly store = inject(GitFlowStore);

  private readonly endRef = viewChild<ElementRef<HTMLDivElement>>('endRef');
  private lastLineCount = 0;

  ngAfterViewChecked(): void {
    const lineCount = this.store.lines().length;
    if (lineCount !== this.lastLineCount) {
      this.lastLineCount = lineCount;
      this.endRef()?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  protected lineClass(type: 'out' | 'err' | 'system'): string {
    if (type === 'out') return 'text-ink';
    if (type === 'err') return 'text-danger';
    return 'text-copper';
  }
}
