import plural from '../utils/plural'

export const MAX_TEAM_INVITEES = 50

export const formatNewTeamInviteeExcess = (excess: number) =>
  `You can invite up to ${MAX_TEAM_INVITEES} people while creating a team. Remove ${excess}, then invite them from the team page.`

export const formatUnfinishedInvitee = (text: string) =>
  `Choose someone for “${text}” from the list, or type their email.`

export const formatInvalidInvitees = (count: number) =>
  `Fix or remove the ${plural(count, 'invalid email address', 'invalid email addresses')} above before creating the team`
