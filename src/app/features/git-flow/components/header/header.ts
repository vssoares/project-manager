import { Component, inject } from '@angular/core';
import { UpdateService } from '../../../../core/update/update.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
})
export class Header {
  protected readonly update = inject(UpdateService);

  protected onUpdateClick(): void {
    this.update.startUpdate();
  }
}
