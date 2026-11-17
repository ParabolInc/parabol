interface TemplateScope {
  isActive: boolean
  orgId: string
  teamId: string
  scope: string
}

interface TeamScope {
  id: string
  orgId: string
}

const isTemplateAvailableToTeam = (template: TemplateScope, team: TeamScope) => {
  if (!template.isActive) return false
  if (template.orgId === 'aGhostOrg') return true
  if (template.orgId !== team.orgId) return false
  return template.scope !== 'TEAM' || template.teamId === team.id
}

export default isTemplateAvailableToTeam
