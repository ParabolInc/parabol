import {useId} from 'react'
import InviteeField from '../../../../components/InviteeField/InviteeField'
import OrgInviteeFieldRoot from '../../../../components/InviteeField/OrgInviteeFieldRoot'
import type useTeamInviteeDrafts from '../../../../hooks/useTeamInviteeDrafts'
import {MAX_TEAM_INVITEES} from '../../../../shared/teamInvitees'

interface Props {
  invitees: ReturnType<typeof useTeamInviteeDrafts>
  orgId: string | null
  onSubmit: () => void
}

const NO_TEAM_EMAILS: readonly string[] = []

const NewTeamFormInvitees = (props: Props) => {
  const {invitees, orgId, onSubmit} = props
  const hintId = useId()
  const fieldProps = {
    invitees,
    teamEmails: NO_TEAM_EMAILS,
    targetTeamId: null,
    capacity: MAX_TEAM_INVITEES - invitees.drafts.length,
    labelledBy: hintId,
    onSubmit
  }

  return (
    <>
      <p id={hintId} className='mt-8 mb-3 text-xs leading-4'>
        {invitees.hasEmailCheck
          ? 'Add people by name or email.'
          : 'Invite others to your new team. Invites expire in 30 days.'}
      </p>
      {orgId ? (
        <OrgInviteeFieldRoot {...fieldProps} orgId={orgId} />
      ) : (
        <InviteeField {...fieldProps} directory={null} />
      )}
    </>
  )
}

export default NewTeamFormInvitees
