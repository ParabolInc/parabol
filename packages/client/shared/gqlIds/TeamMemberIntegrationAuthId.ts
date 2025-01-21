const TeamMemberIntegrationAuthId = {
  join: (dbId: number) => `TeamMemberIntegrationAuth:${dbId}`,
  split: (gqlId: string) => {
    const [_, id] = gqlId.split(':')
    return Number.parseInt(id!)!
  }
}

export default TeamMemberIntegrationAuthId
