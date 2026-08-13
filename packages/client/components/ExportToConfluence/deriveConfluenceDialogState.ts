export type ConfluenceDialogState =
  | 'connectAtlassian'
  | 'enableConfluence'
  | 'form'
  | 'exporting'
  | 'report'

type Input = {
  hasAtlassianAuth: boolean
  hasConfluenceAccess: boolean
  activeExport: {readonly status: string} | null | undefined
}

export const deriveConfluenceDialogState = ({
  hasAtlassianAuth,
  hasConfluenceAccess,
  activeExport
}: Input): ConfluenceDialogState => {
  if (!hasAtlassianAuth) return 'connectAtlassian'
  if (!hasConfluenceAccess) return 'enableConfluence'
  if (!activeExport) return 'form'
  return activeExport.status === 'running' ? 'exporting' : 'report'
}
