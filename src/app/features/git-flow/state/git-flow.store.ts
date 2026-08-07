import { Injectable, computed, inject, signal } from '@angular/core';
import { ConsoleLine, GitFlowApi } from '../data-access/git-flow.api';
import { ACTIONS, BASE_PATH, BRANCH_TYPES, HotfixActionId, PROJECTS } from '../git-flow.constants';

export interface CustomProject {
  name: string;
  path: string;
}

export interface Project extends CustomProject {
  isCustom: boolean;
}

export type Mode = 'hotfix' | 'newbranch' | 'delbranch';

const CUSTOM_PROJECTS_KEY = 'customProjects';

/**
 * Single state owner for the git-flow feature. No facade/ layer — the app
 * has exactly one feature, so the store doubles as orchestration between
 * GitFlowApi and the UI.
 */
@Injectable({ providedIn: 'root' })
export class GitFlowStore {
  private readonly api = inject(GitFlowApi);

  readonly actions = ACTIONS;
  readonly branchTypes = BRANCH_TYPES;

  readonly customProjects = signal<CustomProject[]>(this.readCustomProjects());
  readonly selectedProject = signal<string | null>(null);
  readonly selectedAction = signal<HotfixActionId | null>(null);
  readonly version = signal('');
  readonly mode = signal<Mode>('hotfix');
  readonly branchType = signal<string>(BRANCH_TYPES[0]);
  readonly branchUs = signal('');
  readonly branchName = signal('');
  readonly deleteBranchName = signal('');
  readonly forceHotfixDelete = signal(false);
  readonly lines = signal<ConsoleLine[]>([]);
  readonly running = signal(false);

  readonly allProjects = computed<Project[]>(() => [
    ...PROJECTS.map((name) => ({ name, path: `${BASE_PATH}\\${name}`, isCustom: false })),
    ...this.customProjects().map((p) => ({ ...p, isCustom: true })),
  ]);

  readonly branchPreview = computed(() => {
    const us = this.branchUs().trim();
    const name = this.branchName().trim();
    const type = this.branchType();
    return us ? `feature/${type}-${us}-${name}` : `feature/${type}-${name}`;
  });

  private unsubscribeListeners: (() => void) | null = null;

  getProjectPath(name: string): string {
    return this.allProjects().find((p) => p.name === name)?.path ?? `${BASE_PATH}\\${name}`;
  }

  addProject(project: CustomProject): void {
    if (this.allProjects().some((p) => p.name === project.name)) return;
    this.customProjects.update((prev) => [...prev, project]);
    this.persistCustomProjects();
  }

  removeProject(name: string): void {
    if (this.selectedProject() === name) this.selectedProject.set(null);
    this.customProjects.update((prev) => prev.filter((p) => p.name !== name));
    this.persistCustomProjects();
  }

  selectProject(name: string): void {
    if (this.running()) return;
    this.selectedProject.update((prev) => (prev === name ? null : name));
    this.selectedAction.set(null);
    this.version.set('');
  }

  switchMode(mode: Mode): void {
    if (this.running()) return;
    this.mode.set(mode);
    if (mode !== 'hotfix') {
      this.selectedAction.set(null);
      this.version.set('');
    }
  }

  selectAction(id: HotfixActionId): void {
    if (this.running() || !this.selectedProject()) return;
    this.selectedAction.update((prev) => (prev === id ? null : id));
    this.version.set('');
    if (id !== 'delete') this.forceHotfixDelete.set(false);
  }

  async execute(): Promise<void> {
    const project = this.selectedProject();
    const action = this.selectedAction();
    const version = this.version().trim();
    if (!project || !action || !version || this.running()) return;

    const projectPath = this.getProjectPath(project);
    const forceFlag = action === 'delete' && this.forceHotfixDelete() ? ' -f' : '';
    this.lines.set([{ text: `> [${project}] hf ${action} ${version}${forceFlag}`, type: 'system' }]);
    this.setupListeners();

    await this.api.runCommand({
      action,
      version,
      projectPath,
      force: action === 'delete' ? this.forceHotfixDelete() : false,
    });
  }

  async createBranch(): Promise<void> {
    const project = this.selectedProject();
    const name = this.branchName().trim();
    if (!project || !name || this.running()) return;

    const projectPath = this.getProjectPath(project);
    this.lines.set([{ text: `> [${project}] criar branch: ${this.branchPreview()}`, type: 'system' }]);
    this.setupListeners();

    await this.api.runCommand({
      action: 'new-branch',
      version: '',
      projectPath,
      branchType: this.branchType(),
      branchUs: this.branchUs().trim(),
      branchName: name,
    });
  }

  async deleteBranch(): Promise<void> {
    const project = this.selectedProject();
    const name = this.deleteBranchName().trim();
    if (!project || !name || this.running()) return;

    const confirmed = window.confirm(`Deletar branch local "${name}"?\n\nEsta ação não pode ser desfeita.`);
    if (!confirmed) return;

    const projectPath = this.getProjectPath(project);
    this.lines.set([{ text: `> [${project}] git branch -D ${name}`, type: 'system' }]);
    this.setupListeners();

    await this.api.runCommand({
      action: 'delete-branch',
      version: '',
      projectPath,
      branchName: name,
    });
  }

  async openGitk(): Promise<void> {
    const project = this.selectedProject();
    if (!project || this.running()) return;

    const projectPath = this.getProjectPath(project);
    this.lines.update((prev) => [
      ...prev,
      { text: `> [${project}] git checkout master`, type: 'system' },
      { text: `> [${project}] git pull origin master`, type: 'system' },
      { text: `> [${project}] gitk master`, type: 'system' },
    ]);

    try {
      await this.api.openGitk(projectPath);
    } catch (err) {
      this.lines.update((prev) => [...prev, { text: String(err), type: 'err' }]);
    }
  }

  clearLines(): void {
    this.lines.set([]);
  }

  private setupListeners(): void {
    this.unsubscribeListeners?.();
    this.running.set(true);

    this.unsubscribeListeners = this.api.onOutput({
      onOut: (text) => this.lines.update((prev) => [...prev, { text: text.trimEnd(), type: 'out' }]),
      onErr: (text) => this.lines.update((prev) => [...prev, { text: text.trimEnd(), type: 'err' }]),
      onDone: (code) => {
        const msg = code === 0 ? '✓ Concluído (código 0)' : `✗ Encerrado com código ${code}`;
        this.lines.update((prev) => [...prev, { text: msg, type: 'system' }]);
        this.running.set(false);
      },
    });
  }

  private readCustomProjects(): CustomProject[] {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_PROJECTS_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private persistCustomProjects(): void {
    localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(this.customProjects()));
  }
}
