import { Injectable, inject } from '@angular/core';
import { ElectronApiService, RunCommandPayload } from './electron-api.service';

export interface ConsoleLine {
  text: string;
  type: 'out' | 'err' | 'system';
}

interface OutputHandlers {
  onOut: (text: string) => void;
  onErr: (text: string) => void;
  onDone: (code: number) => void;
}

/**
 * Talks to the Electron main process for everything git-flow related:
 * running hf.ps1 (with live streamed output), opening gitk, and picking a
 * project folder.
 */
@Injectable({ providedIn: 'root' })
export class GitFlowApi {
  private readonly electron = inject(ElectronApiService);

  runCommand(payload: RunCommandPayload): Promise<void> {
    return this.electron.runCommand(payload);
  }

  openGitk(projectPath: string): Promise<void> {
    return this.electron.openGitk(projectPath);
  }

  selectFolder(): Promise<string | null> {
    return this.electron.selectFolder();
  }

  onOutput(handlers: OutputHandlers): () => void {
    const offOut = this.electron.onPsOut(handlers.onOut);
    const offErr = this.electron.onPsErr(handlers.onErr);
    const offDone = this.electron.onPsDone(handlers.onDone);
    return () => {
      offOut();
      offErr();
      offDone();
    };
  }
}
