import { Component, computed, input } from '@angular/core';
import type { UpdateInfo } from '../../../../core/update/update.service';

@Component({
  selector: 'app-update-overlay',
  templateUrl: './update-overlay.html',
})
export class UpdateOverlay {
  readonly info = input.required<UpdateInfo>();

  protected readonly isInstalling = computed(() => this.info().status === 'installing');
}
