import {type InviteeDraft, isDraftReady} from '../hooks/useTeamInviteeDrafts'
import {
  formatInvalidInvitees,
  formatNewTeamInviteeExcess,
  formatUnfinishedInvitee,
  MAX_TEAM_INVITEES
} from '../shared/teamInvitees'

type Input = {
  drafts: readonly InviteeDraft[]
  pendingText: string
  hasDirectory: boolean
}

const validateTeamInvitees = (input: Input): {emails: string[]} | {error: string} => {
  const {drafts, pendingText, hasDirectory} = input
  if (hasDirectory && pendingText && !pendingText.includes('@')) {
    return {error: formatUnfinishedInvitee(pendingText)}
  }
  const invalidCount = drafts.filter((draft) => !isDraftReady(draft)).length
  if (invalidCount > 0) return {error: formatInvalidInvitees(invalidCount)}
  const emails = drafts.map(({email}) => email)
  const excess = emails.length - MAX_TEAM_INVITEES
  if (excess > 0) return {error: formatNewTeamInviteeExcess(excess)}
  return {emails}
}

export default validateTeamInvitees
