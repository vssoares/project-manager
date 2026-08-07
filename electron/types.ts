export interface RunCommandPayload {
  action: string
  version?: string
  projectPath: string
  branchType?: string
  branchUs?: string
  branchName?: string
  force?: boolean
}

export interface UpdateAvailablePayload {
  version: string
}

export interface UpdateProgressPayload {
  percent: number
}
