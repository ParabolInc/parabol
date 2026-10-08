const teamsAwaitingChoice = new Set<string>()

/** The viewer is connecting on this team and has yet to be asked which projects to share */
export const expectAzureDevOpsProjectChoice = (teamId: string) => {
  teamsAwaitingChoice.add(teamId)
}

/** True once per connect, so the picker opens itself for a new connection and never again */
export const takeAzureDevOpsProjectChoice = (teamId: string) => teamsAwaitingChoice.delete(teamId)
