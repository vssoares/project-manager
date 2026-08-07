import { Injectable, computed, effect, signal } from '@angular/core'
import { api } from './api'
import { makeId } from './id'
import { ENV_COLORS, type AppState, type Environment, type TrackedFile, type Version } from './types'

const emptyState: AppState = {
  trackedFiles: [],
  selectedFileId: null,
  selectedEnvironmentId: null,
}

function makeEnvironment(name: string, color: string, content = ''): Environment {
  const now = Date.now()
  return { id: makeId(), name, color, content, updatedAt: now, versions: [] }
}

function defaultTrackedFile(name: string, path: string | null, content = ''): TrackedFile {
  const env = makeEnvironment('Local', ENV_COLORS[2].color, content)
  return {
    id: makeId(),
    name,
    path,
    environments: [env],
    activeEnvironmentId: env.id,
    createdAt: Date.now(),
  }
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
  readonly state = signal<AppState>(emptyState)
  readonly loaded = signal(false)

  readonly trackedFiles = computed(() => this.state().trackedFiles)

  readonly selectedFile = computed(() => {
    const s = this.state()
    return s.trackedFiles.find((f) => f.id === s.selectedFileId) ?? null
  })

  readonly selectedEnvironment = computed(() => {
    const file = this.selectedFile()
    const envId = this.state().selectedEnvironmentId
    return file?.environments.find((e) => e.id === envId) ?? null
  })

  private saveTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    void api.loadState().then((saved) => {
      if (saved && typeof saved === 'object') {
        this.state.set({ ...emptyState, ...(saved as AppState) })
      }
      this.loaded.set(true)
    })

    effect(() => {
      const current = this.state()
      const isLoaded = this.loaded()
      if (!isLoaded) return
      if (this.saveTimer) clearTimeout(this.saveTimer)
      this.saveTimer = setTimeout(() => {
        void api.saveState(current)
      }, 250)
    })
  }

  selectFile(fileId: string) {
    const file = this.trackedFiles().find((f) => f.id === fileId)
    this.state.update((s) => ({
      ...s,
      selectedFileId: fileId,
      selectedEnvironmentId: file?.activeEnvironmentId ?? file?.environments[0]?.id ?? null,
    }))
  }

  selectEnvironment(envId: string) {
    this.state.update((s) => ({ ...s, selectedEnvironmentId: envId }))
  }

  private upsertFile(file: TrackedFile, selectEnvId?: string) {
    this.state.update((s) => ({
      ...s,
      trackedFiles: [...s.trackedFiles, file],
      selectedFileId: file.id,
      selectedEnvironmentId: selectEnvId ?? file.environments[0]?.id ?? null,
    }))
  }

  async addTrackedFileFromDisk() {
    const picked = await api.pickFile()
    if (!picked) return
    this.upsertFile(defaultTrackedFile(picked.name, picked.path, picked.content))
  }

  addTrackedFileManual(name: string) {
    this.upsertFile(defaultTrackedFile(name || 'novo-arquivo.env', null, ''))
  }

  removeTrackedFile(fileId: string) {
    this.state.update((s) => {
      const trackedFiles = s.trackedFiles.filter((f) => f.id !== fileId)
      const stillSelected = s.selectedFileId === fileId
      return {
        ...s,
        trackedFiles,
        selectedFileId: stillSelected ? trackedFiles[0]?.id ?? null : s.selectedFileId,
        selectedEnvironmentId: stillSelected
          ? trackedFiles[0]?.environments[0]?.id ?? null
          : s.selectedEnvironmentId,
      }
    })
  }

  renameTrackedFile(fileId: string, name: string) {
    this.mutateFile(fileId, (f) => ({ ...f, name }))
  }

  private mutateFile(fileId: string, fn: (f: TrackedFile) => TrackedFile) {
    this.state.update((s) => ({
      ...s,
      trackedFiles: s.trackedFiles.map((f) => (f.id === fileId ? fn(f) : f)),
    }))
  }

  addEnvironment(fileId: string, name: string, color: string) {
    const env = makeEnvironment(name, color)
    this.mutateFile(fileId, (f) => ({ ...f, environments: [...f.environments, env] }))
    this.state.update((s) => ({ ...s, selectedFileId: fileId, selectedEnvironmentId: env.id }))
  }

  removeEnvironment(fileId: string, envId: string) {
    this.mutateFile(fileId, (f) => {
      const environments = f.environments.filter((e) => e.id !== envId)
      const activeEnvironmentId =
        f.activeEnvironmentId === envId ? environments[0]?.id ?? null : f.activeEnvironmentId
      return { ...f, environments, activeEnvironmentId }
    })
  }

  updateEnvironmentContent(fileId: string, envId: string, content: string) {
    this.mutateFile(fileId, (f) => ({
      ...f,
      environments: f.environments.map((e) =>
        e.id === envId ? { ...e, content, updatedAt: Date.now() } : e,
      ),
    }))
  }

  saveVersion(fileId: string, envId: string, message: string) {
    this.mutateFile(fileId, (f) => ({
      ...f,
      environments: f.environments.map((e) => {
        if (e.id !== envId) return e
        const version: Version = {
          id: makeId(),
          message: message || 'Nova versão',
          content: e.content,
          createdAt: Date.now(),
        }
        return { ...e, versions: [version, ...e.versions] }
      }),
    }))
  }

  restoreVersion(fileId: string, envId: string, versionId: string) {
    this.mutateFile(fileId, (f) => ({
      ...f,
      environments: f.environments.map((e) => {
        if (e.id !== envId) return e
        const version = e.versions.find((v) => v.id === versionId)
        if (!version) return e
        return { ...e, content: version.content, updatedAt: Date.now() }
      }),
    }))
  }

  async applyToDisk(fileId: string, envId: string) {
    const file = this.trackedFiles().find((f) => f.id === fileId)
    const env = file?.environments.find((e) => e.id === envId)
    if (!file || !env) return { ok: false, message: 'Ambiente não encontrado.' }
    if (!file.path) {
      return { ok: false, message: 'Este arquivo ainda não está vinculado a um caminho no disco.' }
    }
    const ok = await api.writeFile(file.path, env.content)
    if (ok) {
      this.mutateFile(fileId, (f) => ({ ...f, activeEnvironmentId: envId }))
    }
    return ok
      ? { ok: true, message: `${env.name} aplicado em ${file.path}` }
      : { ok: false, message: 'Falha ao escrever o arquivo no disco.' }
  }

  async linkPath(fileId: string) {
    const picked = await api.pickFile()
    if (!picked) return
    this.mutateFile(fileId, (f) => ({ ...f, path: picked.path, name: picked.name }))
  }
}
