export interface Version {
  id: string
  message: string
  content: string
  createdAt: number
}

export interface Environment {
  id: string
  name: string
  color: string
  content: string
  updatedAt: number
  versions: Version[]
}

export interface TrackedFile {
  id: string
  name: string
  path: string | null
  environments: Environment[]
  activeEnvironmentId: string | null
  createdAt: number
}

export interface AppState {
  trackedFiles: TrackedFile[]
  selectedFileId: string | null
  selectedEnvironmentId: string | null
}

export type PageKey = 'files' | 'history' | 'compare' | 'gitflow' | 'settings'

export const ENV_COLORS = [
  { name: 'Produção', color: '#f07178' },
  { name: 'Staging', color: '#e8a45c' },
  { name: 'Local', color: '#3ecfcf' },
  { name: 'Desenvolvimento', color: '#7eb8e8' },
] as const
