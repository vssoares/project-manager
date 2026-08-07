export const BASE_PATH = 'C:\\Users\\ViniciusSoaresdeSant\\Desktop\\Fretefy\\Front';

export const PROJECTS: string[] = [];

export const BRANCH_TYPES = ['sustentacao', 'manutencao', 'votorantim', 'vcmonitoramento'] as const;

export type HotfixActionId = 'start' | 'finish' | 'delete';

export interface HotfixAction {
  id: HotfixActionId;
  label: string;
  idle: string;
  active: string;
}

export const ACTIONS: HotfixAction[] = [
  {
    id: 'start',
    label: 'START',
    idle: 'bg-transparent text-mute border-rail-edge hover:border-ok hover:text-ok uppercase tracking-widest rounded-md',
    active: 'bg-ok/10 text-ok border-ok shadow-[0_0_14px_rgba(127,217,154,0.2)] uppercase tracking-widest rounded-md',
  },
  {
    id: 'finish',
    label: 'FINISH',
    idle: 'bg-transparent text-mute border-rail-edge hover:border-key hover:text-key uppercase tracking-widest rounded-md',
    active: 'bg-key/10 text-key border-key shadow-[0_0_14px_rgba(126,184,232,0.2)] uppercase tracking-widest rounded-md',
  },
  {
    id: 'delete',
    label: 'DELETE',
    idle: 'bg-transparent text-mute border-rail-edge hover:border-danger hover:text-danger uppercase tracking-widest rounded-md',
    active: 'bg-danger/10 text-danger border-danger shadow-[0_0_14px_rgba(240,113,120,0.2)] uppercase tracking-widest rounded-md',
  },
];
