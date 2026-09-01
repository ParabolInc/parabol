/** What a push wrote and where; null when the push left no provenance (comment-only, skipped, or the service records none) */
export type EstimatePushResult =
  | {service: 'jira' | 'jiraServer' | 'azureDevOps' | 'linear'; target: 'field'; targetId: string}
  | {service: 'github' | 'gitlab'; target: 'label'; targetId: string}
  | null
