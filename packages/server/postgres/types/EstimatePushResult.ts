/** What a push wrote and where, stored on TaskEstimate.pushResult; null when the push left no provenance (comment-only, skipped, or the service records none) */
export type EstimatePushResult =
  | {
      targetKind: 'field'
      service: 'jira' | 'jiraServer' | 'azureDevOps' | 'linear'
      fieldId: string
    }
  | {targetKind: 'label'; service: 'github'; labelName: string}
  | {targetKind: 'label'; service: 'gitlab'; labelId: string}
  | null
