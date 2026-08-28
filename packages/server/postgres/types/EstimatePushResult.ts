/** What a push wrote and where, stored on TaskEstimate.pushResult; null when the push left no provenance (comment-only, skipped, or the service records none) */
export type EstimatePushResult =
  | {targetKind: 'field'; fieldId: string}
  | {targetKind: 'label'; labelName: string}
  | {targetKind: 'label'; labelId: string}
  | null
