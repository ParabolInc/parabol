export type InspirationSourceService =
  | 'PARABOL'
  | 'github'
  | 'jira'
  | 'linear'
  | 'azureDevOps'
  | 'gcal'

export interface InspirationSourceKind {
  key: string
  label: string
}

export const INSPIRATION_SOURCE_KINDS: Record<InspirationSourceService, InspirationSourceKind[]> = {
  PARABOL: [
    {key: 'tasks', label: 'Tasks'},
    {key: 'standups', label: 'Standup answers'}
  ],
  github: [
    {key: 'pullRequest', label: 'Pull requests'},
    {key: 'issue', label: 'Issues'}
  ],
  jira: [
    {key: 'assigned', label: 'Issues assigned to you'},
    {key: 'created', label: 'Issues you created'}
  ],
  linear: [{key: 'involved', label: 'Issues you’re involved in'}],
  azureDevOps: [
    {key: 'assigned', label: 'Work items assigned to you'},
    {key: 'created', label: 'Work items you created'}
  ],
  gcal: [{key: 'events', label: 'Meetings'}]
}

export interface InspirationSourceSettings {
  kinds: Record<InspirationSourceService, string[]>
  githubRepos: string[]
  jiraProjectIds: string[]
  linearIds: string[]
  azureDevOpsProjectIds: string[]
}

export const DEFAULT_INSPIRATION_SOURCE_SETTINGS: InspirationSourceSettings = {
  kinds: {
    PARABOL: ['tasks', 'standups'],
    github: ['pullRequest', 'issue'],
    jira: ['assigned'],
    linear: ['involved'],
    azureDevOps: ['assigned'],
    gcal: ['events']
  },
  githubRepos: [],
  jiraProjectIds: [],
  linearIds: [],
  azureDevOpsProjectIds: []
}

export const withInspirationSourceDefaults = (
  stored: Partial<InspirationSourceSettings>
): InspirationSourceSettings => ({
  ...DEFAULT_INSPIRATION_SOURCE_SETTINGS,
  ...stored,
  kinds: {...DEFAULT_INSPIRATION_SOURCE_SETTINGS.kinds, ...stored.kinds}
})
