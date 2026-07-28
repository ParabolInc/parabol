export type ConfluenceDialogState = 'S0' | 'S1' | 'EMPTY' | 'S2' | 'S3' | 'S4'

type Input = {
  connection:
    | {
        readonly hasConfluenceScopes: boolean
        readonly confluenceSites: readonly unknown[]
      }
    | null
    | undefined
  activeExport: {readonly status: string} | null | undefined
}

export const deriveConfluenceDialogState = ({
  connection,
  activeExport
}: Input): ConfluenceDialogState => {
  if (!connection) return 'S0'
  if (!connection.hasConfluenceScopes) return 'S1'
  if (connection.confluenceSites.length === 0) return 'EMPTY'
  if (!activeExport) return 'S2'
  return activeExport.status === 'running' ? 'S3' : 'S4'
}
